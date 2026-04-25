import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { paymentService } from '../services/paymentService';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { TransactionStatus, WebhookPayload } from '../types/transaction';

const router = Router();

const VALID_STATUSES: TransactionStatus[] = [
  'pending', 'processing', 'success', 'failed', 'refunded', 'cancelled',
];

// Verify HMAC-SHA256 signature sent in X-Webhook-Signature header.
// Skipped when WEBHOOK_SECRET is not configured (development).
function verifySignature(rawBody: Buffer, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', config.webhookSecret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

// Parse a Razorpay-style webhook into the generic WebhookPayload shape.
// Razorpay stores the idempotency key in payment.notes.idempotency_key.
function parseRazorpayWebhook(body: Record<string, any>): WebhookPayload {
  const event: string = body.event ?? '';
  const paymentEntity = body.payload?.payment?.entity ?? {};
  const refundEntity = body.payload?.refund?.entity ?? {};

  let status: TransactionStatus;
  switch (event) {
    case 'payment.authorized': status = 'processing'; break;
    case 'payment.captured':   status = 'success';    break;
    case 'payment.failed':     status = 'failed';     break;
    case 'refund.created':
    case 'refund.processed':   status = 'refunded';   break;
    default:                   status = 'processing';
  }

  return {
    idempotency_key:   paymentEntity?.notes?.idempotency_key ?? refundEntity?.notes?.idempotency_key,
    gateway_order_id:  paymentEntity?.order_id,
    gateway_payment_id: paymentEntity?.id,
    status,
    failure_reason:    paymentEntity?.error_description,
    event,
    metadata:          body.payload as Record<string, unknown>,
  };
}

/**
 * POST /api/webhook/payment
 *
 * Accepts raw JSON body so HMAC can be verified before parsing.
 * Two formats are supported:
 *
 * Generic format:
 *   { idempotency_key, gateway_order_id?, gateway_payment_id?,
 *     status, failure_reason?, event?, metadata? }
 *
 * Razorpay format:
 *   { event: "payment.captured", payload: { payment: { entity: { ... } } } }
 *   (idempotency_key must be stored in payment.notes.idempotency_key)
 *
 * The endpoint always returns HTTP 200 to stop the gateway from retrying
 * a webhook that was received but failed business-logic processing.
 */
router.post(
  '/payment',
  // express.raw is applied in index.ts BEFORE express.json for /api/webhook/*
  async (req: Request, res: Response): Promise<void> => {
    const rawBody: Buffer = req.body;
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const sourceIp = req.ip ?? 'unknown';

    logger.info('POST /api/webhook/payment', { sourceIp, hasSignature: !!signature });

    // Signature verification (skipped if secret not configured)
    if (config.webhookSecret) {
      if (!signature || !verifySignature(rawBody, signature)) {
        logger.warn('Webhook signature verification failed', { sourceIp });
        res.status(401).json({ success: false, message: 'Invalid signature' });
        return;
      }
    }

    let body: Record<string, any>;
    try {
      body = JSON.parse(rawBody.toString('utf8'));
    } catch {
      res.status(400).json({ success: false, message: 'Invalid JSON body' });
      return;
    }

    let payload: WebhookPayload;

    if (body.event && body.payload) {
      // Razorpay-style webhook
      payload = parseRazorpayWebhook(body);
    } else {
      // Generic webhook format
      const status = body.status as TransactionStatus;

      if (!status || !VALID_STATUSES.includes(status)) {
        res.status(400).json({
          success: false,
          message: `status is required and must be one of: ${VALID_STATUSES.join(', ')}`,
        });
        return;
      }

      if (!body.idempotency_key && !body.gateway_order_id) {
        res.status(400).json({
          success: false,
          message: 'idempotency_key or gateway_order_id is required',
        });
        return;
      }

      payload = {
        idempotency_key:    body.idempotency_key,
        gateway_order_id:   body.gateway_order_id,
        gateway_payment_id: body.gateway_payment_id,
        gateway_signature:  body.gateway_signature,
        status,
        failure_reason:     body.failure_reason,
        event:              body.event ?? `status.${status}`,
        metadata:           body.metadata,
      };
    }

    const result = await paymentService.processWebhook(payload, sourceIp);
    logger.info('Webhook processed', { success: result.success, status: payload.status });

    // Always 200 — failures are logged; we do not want the gateway to keep retrying
    res.status(200).json(result);
  }
);

/**
 * POST /api/webhook/payu/success
 *
 * PayU server-to-server (IPN) webhook for successful payments.
 * Configure this URL in the PayU merchant dashboard under
 * "Developer → Webhook" or "Manage Webhooks".
 *
 * Body is application/x-www-form-urlencoded (PayU IPN format).
 * express.urlencoded is applied in index.ts for /api/webhook/payu/*.
 *
 * Must respond HTTP 200 quickly — PayU retries up to 3 times on failure.
 */
router.post('/payu/success', async (req: Request, res: Response): Promise<void> => {
  const { txnid, mihpayid, status } = req.body;
  logger.info('PayU IPN success webhook', { txnid, mihpayid, status });

  const result = await paymentService.processPayuResponse(req.body, req.ip ?? 'unknown');

  if (!result.success) {
    logger.warn('PayU IPN success processing failed', { txnid, reason: result.message });
  }

  // Always 200 — prevent PayU from retrying
  res.status(200).send('OK');
});

/**
 * POST /api/webhook/payu/failure
 *
 * PayU server-to-server (IPN) webhook for failed payments.
 * Configure alongside /payu/success in the PayU merchant dashboard.
 *
 * Body is application/x-www-form-urlencoded.
 * Must respond HTTP 200 quickly.
 */
router.post('/payu/failure', async (req: Request, res: Response): Promise<void> => {
  const { txnid, error: errorCode, error_Message: errorMessage } = req.body;
  logger.info('PayU IPN failure webhook', { txnid, errorCode, errorMessage });

  const result = await paymentService.processPayuResponse(req.body, req.ip ?? 'unknown');

  if (!result.success) {
    logger.warn('PayU IPN failure processing failed', { txnid, reason: result.message });
  }

  res.status(200).send('OK');
});

export default router;
