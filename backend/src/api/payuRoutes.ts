import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { generatePayuHash } from '../utils/payuHash';
import { paymentService } from '../services/paymentService';
import { UserModel } from '../models/User';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { PLAN_TOKENS, PAID_PLAN_NAMES } from '../utils/constants';

const router = Router();

const PAYU_PAYMENT_URL = config.payu.testMode
  ? 'https://test.payu.in/_payment'
  : 'https://secure.payu.in/_payment';

/**
 * POST /api/payu/initiate  (protected — requires JWT)
 *
 * Creates (or retrieves via idempotency key) a Postgres transaction and
 * returns all fields needed to POST the user's browser directly to PayU's
 * hosted checkout page.
 *
 * Body: { plan, amount, phone, idempotencyKey? }
 *
 * Response:
 *   {
 *     payuUrl: "https://test.payu.in/_payment",
 *     transactionId: "<uuid>",
 *     formFields: { key, txnid, amount, productinfo, firstname, email,
 *                   phone, surl, furl, hash, udf1, udf2, udf3, udf4, udf5 }
 *   }
 *
 * The frontend must create a hidden <form> with these fields and submit it
 * to payuUrl — never construct or submit this form server-side.
 */
router.post('/initiate', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('POST /api/payu/initiate', { userId, plan: req.body.plan });

  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { plan, amount, phone, idempotencyKey } = req.body;

    if (!plan || !amount || !phone) {
      res.status(400).json({ success: false, message: 'plan, amount, and phone are required' });
      return;
    }

    if (!(PAID_PLAN_NAMES as readonly string[]).includes(plan)) {
      res.status(400).json({ success: false, message: `Invalid plan. Must be one of: ${PAID_PLAN_NAMES.join(', ')}` });
      return;
    }

    if (!config.payu.merchantKey || !config.payu.merchantSalt) {
      logger.error('PayU merchant key/salt not configured');
      res.status(500).json({ success: false, message: 'Payment gateway not configured' });
      return;
    }

    // Fetch user to get name and email for the PayU form
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Create or retrieve the transaction (idempotent)
    const txnResult = await paymentService.initiatePayment(userId, plan, amount, idempotencyKey);
    if (!txnResult.success || !txnResult.data) {
      res.status(400).json(txnResult);
      return;
    }

    const transactionId: string = txnResult.data.transactionId;

    // PayU txnid: UUID without dashes (alphanumeric, unique)
    const txnid = transactionId.replace(/-/g, '');

    // Amount must be a string with 2 decimal places
    const amountStr = parseFloat(amount.toString()).toFixed(2);

    // First name only (PayU's field is firstname, not full name)
    const firstname = user.name.split(' ')[0];

    const planKey = plan as keyof typeof PLAN_TOKENS;
    const productinfo = `PitchPerfect ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${PLAN_TOKENS[planKey]} Tokens`;

    // surl / furl: backend endpoints that verify hash then redirect to frontend
    const surl = `${config.backendUrl}/api/payu/callback/success`;
    const furl = `${config.backendUrl}/api/payu/callback/failure`;

    // udf1 = our internal transaction UUID (for fast lookup in callbacks)
    // udf2 = userId (secondary reference)
    const udf1 = transactionId;
    const udf2 = userId;

    const hash = generatePayuHash({
      key: config.payu.merchantKey,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email: user.email,
      udf1,
      udf2,
      salt: config.payu.merchantSalt,
    });

    logger.info('PayU initiation successful', { userId, transactionId, plan });

    res.status(200).json({
      success: true,
      message: 'PayU payment initiated',
      data: {
        payuUrl: PAYU_PAYMENT_URL,
        transactionId,
        formFields: {
          key: config.payu.merchantKey,
          txnid,
          amount: amountStr,
          productinfo,
          firstname,
          email: user.email,
          phone: String(phone),
          surl,
          furl,
          hash,
          udf1,
          udf2,
          udf3: '',
          udf4: '',
          udf5: '',
        },
      },
    });
  } catch (error) {
    logger.error('PayU initiate error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/payu/callback/success  (public — set as surl in PayU form)
 *
 * PayU redirects the user's browser here after a successful payment.
 * Body is application/x-www-form-urlencoded.
 *
 * Steps:
 *  1. Verify reverse hash
 *  2. Update Postgres transaction → success + grant tokens
 *  3. Redirect browser to frontend /payment-success
 */
router.post('/callback/success', async (req: Request, res: Response): Promise<void> => {
  const { txnid, status, mihpayid } = req.body;
  logger.info('PayU callback success', { txnid, status, mihpayid });

  const frontendBase = config.frontendUrl;

  try {
    const result = await paymentService.processPayuResponse(req.body, req.ip);

    if (!result.success) {
      logger.warn('PayU success callback processing failed', { txnid, reason: result.message });
      res.redirect(
        `${frontendBase}/payment-failure?txnid=${encodeURIComponent(txnid ?? '')}&error=${encodeURIComponent(result.message)}`
      );
      return;
    }

    res.redirect(
      `${frontendBase}/payment-success?txnid=${encodeURIComponent(txnid ?? '')}&mihpayid=${encodeURIComponent(mihpayid ?? '')}&status=success`
    );
  } catch (error) {
    logger.error('PayU success callback error', { txnid, error });
    res.redirect(`${frontendBase}/payment-failure?error=server_error`);
  }
});

/**
 * POST /api/payu/callback/failure  (public — set as furl in PayU form)
 *
 * PayU redirects the user's browser here after a failed payment.
 * Body is application/x-www-form-urlencoded.
 *
 * Steps:
 *  1. Verify reverse hash
 *  2. Update Postgres transaction → failed
 *  3. Redirect browser to frontend /payment-failure
 */
router.post('/callback/failure', async (req: Request, res: Response): Promise<void> => {
  const { txnid, error_Message, error: errorCode,mihpayid, udf1:txId,udf2:userId,hash,phone,email,productinfo } = req.body;
  logger.info('PayU callback failure', { txnid, errorCode, error_Message });

  const frontendBase = config.frontendUrl;

  try {
    await paymentService.processPayuResponse(req.body, req.ip);
    const errMsg = error_Message || errorCode || 'Payment failed';
    res.redirect(
      `${frontendBase}/payment-failure?txnid=${encodeURIComponent(txnid ?? '')}&error=${encodeURIComponent(errMsg)}`
    );
  } catch (error) {
    logger.error('PayU failure callback error', { txnid, error });
    res.redirect(`${frontendBase}/payment-failure?error=server_error`);
  }
});

export default router;
