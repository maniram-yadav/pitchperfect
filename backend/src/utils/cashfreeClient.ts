import { config } from '../config/env';

const CASHFREE_BASE_URL = config.cashfree.sandboxMode
  ? 'https://sandbox.cashfree.com/pg'
  : 'https://api.cashfree.com/pg';

const CASHFREE_API_VERSION = '2023-08-01';

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
  const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cashfree order creation failed [${response.status}]: ${error}`);
  }

  return response.json() as Promise<CashfreeOrderResponse>;
}

export async function fetchCashfreeOrder(orderId: string): Promise<CashfreeOrderResponse> {
  const response = await fetch(`${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cashfree order fetch failed [${response.status}]: ${error}`);
  }

  return response.json() as Promise<CashfreeOrderResponse>;
}
