import crypto from 'crypto';

/**
 * Verify the HMAC-SHA256 signature Cashfree attaches to every webhook.
 *
 * Cashfree signs: `timestamp + "." + rawBody`
 * The signature is Base64-encoded and sent in the `x-webhook-signature` header.
 * The timestamp comes from the `x-webhook-timestamp` header.
 *
 * Always verify before trusting the webhook payload.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: Buffer,
  timestamp: string,
  receivedSignature: string,
  secretKey: string
): boolean {
  const signedData = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(signedData)
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(receivedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Map a Cashfree webhook event type to our internal TransactionStatus.
 * Cashfree order_status PAID = success; payment failures leave order ACTIVE.
 */
export function cashfreeEventToStatus(
  webhookType: string,
  orderStatus: string
): 'success' | 'failed' | 'refunded' | null {
  switch (webhookType) {
    case 'PAYMENT_SUCCESS_WEBHOOK':
      return orderStatus === 'PAID' ? 'success' : 'failed';
    case 'PAYMENT_FAILED_WEBHOOK':
    case 'PAYMENT_USER_DROPPED_WEBHOOK':
      return 'failed';
    case 'REFUND_STATUS_WEBHOOK':
      return 'refunded';
    default:
      return null;
  }
}
