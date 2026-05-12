import { config } from '../config/env';
import { logger } from '../utils/logger';

const CASHFREE_BASE_URL = config.cashfree.sandboxMode
  ? 'https://sandbox.cashfree.com/pg'
  : 'https://api.cashfree.com/pg';

const CASHFREE_API_VERSION = '2025-01-01';

logger.debug('[cashfreeClient] mode=%s baseUrl=%s appId=%s secretKey=%s',
  config.cashfree.sandboxMode ? 'sandbox' : 'production',
  CASHFREE_BASE_URL,
  config.cashfree.appId ? config.cashfree.appId.slice(0, 6) + '***' : 'MISSING',
  config.cashfree.secretKey ? '***set***' : 'MISSING',
);

function getHeaders(): Record<string, string> {
  return {
    'x-client-id': config.cashfree.appId,
    'x-client-secret': config.cashfree.secretKey,
    'x-api-version': CASHFREE_API_VERSION,
    'Content-Type': 'application/json',
  };
}

export interface CashfreeOrderInput {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta: {
    return_url: string;
    notify_url?: string;
  };
  order_note?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: number;
  order_id: string;
  payment_session_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
  order_note?: string;
}

export async function createCashfreeOrder(
  input: CashfreeOrderInput
): Promise<CashfreeOrderResponse> {
  logger.debug('[cashfreeClient] createCashfreeOrder → POST %s/orders payload=%j',
    CASHFREE_BASE_URL, { ...input, customer_details: { ...input.customer_details, customer_email: '***' } });

  const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });


  
  logger.debug('[cashfreeClient] createCashfreeOrder ← status=%d ok=%s', response.status, response.ok);

  if (!response.ok) {
    const error = await response.text();
    logger.error('[cashfreeClient] createCashfreeOrder failed status=%d body=%s', response.status, error);
    throw new Error(`Cashfree order creation failed [${response.status}]: ${error}`);
  }

  const data = await response.json() as CashfreeOrderResponse;
  logger.debug('[cashfreeClient] createCashfreeOrder success cf_order_id=%s payment_session_id=%s',
    data.cf_order_id, data.payment_session_id ? data.payment_session_id.slice(0, 12) + '***' : 'none');
  return data;
}

export async function fetchCashfreeOrder(orderId: string): Promise<CashfreeOrderResponse> {
  logger.debug('[cashfreeClient] fetchCashfreeOrder → GET %s/orders/%s', CASHFREE_BASE_URL, orderId);

  const response = await fetch(`${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  logger.debug('[cashfreeClient] fetchCashfreeOrder ← status=%d ok=%s orderId=%s',
    response.status, response.ok, orderId);

  if (!response.ok) {
    const error = await response.text();
    logger.error('[cashfreeClient] fetchCashfreeOrder failed orderId=%s status=%d body=%s',
      orderId, response.status, error);
    throw new Error(`Cashfree order fetch failed [${response.status}]: ${error}`);
  }

  const data = await response.json() as CashfreeOrderResponse;
  logger.debug('[cashfreeClient] fetchCashfreeOrder success orderId=%s order_status=%s amount=%s %s',
    data.order_id, data.order_status, data.order_amount, data.order_currency);
  return data;
}
