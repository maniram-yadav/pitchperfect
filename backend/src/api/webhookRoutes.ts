import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { paymentService } from '../services/paymentService';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { TransactionStatus, WebhookPayload } from '../types/transaction';
import { verifyCashfreeWebhookSignature } from '../utils/cashfreeWebhook';

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
 * Legacy PayU IPN endpoint for successful payments (old dashboard config).
 * New integrations should use /payu/notify instead.
 * Body: application/x-www-form-urlencoded (payment fields at the top level).
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
 * Legacy PayU IPN endpoint for failed payments (old dashboard config).
 * New integrations should use /payu/notify instead.
 * Body: application/x-www-form-urlencoded.
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



// PayU's documented IP ranges for webhook delivery — used to validate inbound requests
// in production. Skipped in test/dev mode to avoid blocking local testing.
const PAYU_WEBHOOK_IPS = new Set([
  '52.140.8.88', '52.140.8.89', '52.140.8.64', '52.140.8.65',
  '3.7.89.1', '3.7.89.2', '3.7.89.3', '3.7.89.8', '3.7.89.9', '3.7.89.10',
  '180.179.174.2', '180.179.165.250',
  '3.6.73.183', '3.6.83.44',
]);

/**
 * POST /api/webhook/payu/notify
 *
 * Unified PayU webhook endpoint — configure this single URL in the PayU merchant
 * dashboard under "Developer → Webhooks". PayU sends all events (payment success,
 * failure, refund) here as server-to-server POST requests.
 *
 * Body: application/x-www-form-urlencoded
 * Outer fields: event_type, status, request_identifier, timestamp, ...
 * event_payload: JSON-encoded string containing the full transaction response
 *                (mihpayid, txnid, amount, hash, udf1-udf10, etc.)
 *
 * The hash inside event_payload is verified before updating any transaction.
 * Always returns HTTP 200 to prevent PayU from retrying (retries up to 3×).
 */
router.post('/payu/notify', async (req: Request, res: Response): Promise<void> => {
  const sourceIp = req.ip ?? 'unknown';
  const { event_type, request_identifier } = req.body;

  logger.info('PayU webhook notify', { sourceIp, event_type, request_identifier });

  // Optional IP allowlist — enforce only in production to allow local testing
  if (config.payu.testMode === false && !PAYU_WEBHOOK_IPS.has(sourceIp)) {
    logger.warn('PayU webhook rejected: IP not in allowlist', { sourceIp });
    // Still return 200 so PayU doesn't keep retrying; we log the rejection for investigation
    res.status(200).send('OK');
    return;
  }

  // event_payload is a JSON string embedded in the form body
  const rawPayload = req.body.event_payload;
  if (!rawPayload) {
    logger.warn('PayU webhook missing event_payload', { sourceIp, event_type });
    res.status(200).send('OK');
    return;
  }

  let eventPayload: Record<string, string>;
  try {
    eventPayload = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
  } catch {
    logger.warn('PayU webhook event_payload is not valid JSON', { sourceIp, event_type });
    res.status(200).send('OK');
    return;
  }

  const { txnid, mihpayid, status } = eventPayload;
  logger.info('PayU webhook event_payload parsed', { txnid, mihpayid, status, event_type });

  // processPayuResponse verifies the hash, locates the transaction via udf1,
  // updates its status, and grants tokens on success.
  const result = await paymentService.processPayuResponse(eventPayload, sourceIp);

  if (!result.success) {
    logger.warn('PayU webhook processing failed', { txnid, reason: result.message });
  }

  res.status(200).send('OK');
});
/**
 * POST /api/webhook/cashfree
 *
 * Unified Cashfree webhook endpoint — configure this URL in the Cashfree dashboard
 * under "Payment Gateway → Webhooks". Cashfree sends all events (payment success,
 * failure, user-dropped, refund) here as server-to-server POST requests.
 *
 * Body: application/json (raw, for HMAC-SHA256 verification)
 * Headers: x-webhook-signature (Base64 HMAC), x-webhook-timestamp
 *
 * Always returns HTTP 200 to prevent Cashfree from retrying.
 */
router.post(
  '/cashfree',
  async (req: Request, res: Response): Promise<void> => {
    const rawBody: Buffer = req.body;
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;
    const sourceIp = req.ip ?? 'unknown';

    logger.info('POST /api/webhook/cashfree', { sourceIp, hasSignature: !!signature });

    // Signature verification — skipped when secret is not configured (development)
    if (config.cashfree.webhookSecret) {
      if (!signature || !timestamp) {
        logger.warn('Cashfree webhook missing signature or timestamp headers', { sourceIp });
        res.status(200).send('OK');
        return;
      }
      if (!verifyCashfreeWebhookSignature(rawBody, timestamp, signature, config.cashfree.webhookSecret)) {
        logger.warn('Cashfree webhook signature verification failed', { sourceIp });
        res.status(200).send('OK');
        return;
      }
    }

    let body: Record<string, any>;
    try {
      body = JSON.parse(rawBody.toString('utf8'));
    } catch {
      logger.warn('Cashfree webhook: invalid JSON body', { sourceIp });
      res.status(200).send('OK');
      return;
    }

    // Cashfree webhook shape:
    // { type: "PAYMENT_SUCCESS_WEBHOOK", data: { order: { order_id, order_status },
    //   payment: { cf_payment_id, payment_status, payment_message } }, event_time: "..." }
    const webhookType: string = body.type ?? '';
    const orderId: string = body.data?.order?.order_id ?? '';
    const orderStatus: string = body.data?.order?.order_status ?? '';
    const cfPaymentId: string | undefined = body.data?.payment?.cf_payment_id?.toString();
    const failureMessage: string | undefined = body.data?.payment?.payment_message;

    logger.info('Cashfree webhook parsed', { webhookType, orderId, orderStatus });

    if (!orderId) {
      logger.warn('Cashfree webhook missing order_id', { webhookType });
      res.status(200).send('OK');
      return;
    }

    const result = await paymentService.processCashfreeWebhook(
      webhookType,
      orderId,
      orderStatus,
      cfPaymentId,
      failureMessage,
      body as Record<string, unknown>,
      sourceIp
    );

    if (!result.success) {
      logger.warn('Cashfree webhook processing failed', { orderId, reason: result.message });
    }

    // Always 200 — Cashfree will retry on non-200; log failures for investigation
    res.status(200).send('OK');
  }
);

export default router;
