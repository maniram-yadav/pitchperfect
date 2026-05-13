export type PlanName = 'free' | 'basic test' | 'starter' | 'pro';
export type PaidPlanName = 'basic test' | 'starter' | 'pro';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'refunded'
  | 'cancelled'
  | 'stuck';

export interface WebhookEvent {
  event: string;
  payload: Record<string, unknown>;
  received_at: string;
  source_ip?: string;
}

export interface PgTransaction {
  id: string;
  idempotency_key: string;
  user_id: string;
  plan: PaidPlanName;
  amount: number;
  currency: string;
  tokens_added: number;
  gateway: string | null;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  gateway_signature: string | null;
  status: TransactionStatus;
  failure_reason: string | null;
  webhook_events: WebhookEvent[];
  metadata: Record<string, unknown>;
  pull_attempts: number;
  last_pulled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionInput {
  idempotency_key: string;
  user_id: string;
  plan: PaidPlanName;
  amount: number;
  currency?: string;
  tokens_added: number;
  gateway_order_id?: string;
  metadata?: Record<string, unknown>;
}

export interface WebhookPayload {
  idempotency_key?: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
  status: TransactionStatus;
  failure_reason?: string;
  event?: string;
  metadata?: Record<string, unknown>;
}
