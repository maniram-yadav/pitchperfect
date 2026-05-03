import crypto from 'crypto';

export interface PayuHashInput {
  key: string;
  txnid: string;
  amount: string;    // e.g. "199.00"
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  salt: string;
}

/**
 * Generate SHA-512 hash for a PayU payment request.
 *
 * Formula (from PayU docs):
 *   sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 *
 * The six pipes at the end represent five empty fields followed by SALT.
 */
export function generatePayuHash(p: PayuHashInput): string {
  const str = [
    p.key, p.txnid, p.amount, p.productinfo, p.firstname, p.email,
    p.udf1 ?? '', p.udf2 ?? '', p.udf3 ?? '', p.udf4 ?? '', p.udf5 ?? '',
    '', '', '', '', '',   // five additional empty slots
    p.salt,
  ].join('|');

  return crypto.createHash('sha512').update(str).digest('hex');
}

export interface PayuResponseHashInput {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  status: string;
  salt: string;
}

/**
 * Verify the hash PayU attaches to its callback / webhook response.
 *
 * Reverse formula (from PayU docs):
 *   sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 *
 * ALWAYS verify this before trusting the payment status.
 */
export function verifyPayuResponseHash(
  p: PayuResponseHashInput,
  receivedHash: string
): boolean {
  const str = [
    p.salt, p.status,
    '', '', '', '', '',   // five empty slots (mirror of the forward hash)
    p.udf5 ?? '', p.udf4 ?? '', p.udf3 ?? '', p.udf2 ?? '', p.udf1 ?? '',
    p.email, p.firstname, p.productinfo, p.amount, p.txnid, p.key,
  ].join('|');

  const expected = crypto.createHash('sha512').update(str).digest('hex');
  return expected.toLowerCase() === receivedHash.toLowerCase();
}

/**
 * Convert a PayU txnid (UUID without dashes, 32 hex chars) back to a standard UUID.
 * Returns the input unchanged if it already contains dashes.
 */
export function txnidToUuid(txnid: string): string {
  if (!txnid || txnid.includes('-')) return txnid;
  return [
    txnid.slice(0, 8),
    txnid.slice(8, 12),
    txnid.slice(12, 16),
    txnid.slice(16, 20),
    txnid.slice(20),
  ].join('-');
}
