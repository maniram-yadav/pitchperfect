import { getPool } from '../config/postgres';
import {
  PgTransaction,
  CreateTransactionInput,
  TransactionStatus,
  WebhookEvent,
} from '../types/transaction';
import { logger } from '../utils/logger';

export const initTransactionsTable = async (): Promise<void> => {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      idempotency_key     VARCHAR(255)  UNIQUE NOT NULL,
      user_id             VARCHAR(255)  NOT NULL,
      plan                VARCHAR(50)   NOT NULL,
      amount              NUMERIC(10,2) NOT NULL,
      currency            VARCHAR(10)   NOT NULL DEFAULT 'INR',
      tokens_added        INTEGER       NOT NULL,
      gateway_order_id    VARCHAR(255),
      gateway_payment_id  VARCHAR(255),
      gateway_signature   TEXT,
      status              VARCHAR(50)   NOT NULL DEFAULT 'pending',
      failure_reason      TEXT,
      webhook_events      JSONB         NOT NULL DEFAULT '[]'::jsonb,
      metadata            JSONB         NOT NULL DEFAULT '{}'::jsonb,
      created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_txn_user_id          ON transactions(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_txn_idempotency_key  ON transactions(idempotency_key)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_txn_gateway_order_id ON transactions(gateway_order_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_txn_status           ON transactions(status)`);

  logger.info('PostgreSQL transactions table initialized');
};

export const pgTransactionRepo = {
  async create(input: CreateTransactionInput): Promise<PgTransaction> {
    const pool = getPool();
    try {
      const { rows } = await pool.query<PgTransaction>(
        `INSERT INTO transactions
           (idempotency_key, user_id, plan, amount, currency, tokens_added, gateway_order_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          input.idempotency_key,
          input.user_id,
          input.plan,
          input.amount,
          input.currency ?? 'INR',
          input.tokens_added,
          input.gateway_order_id ?? null,
          JSON.stringify(input.metadata ?? {}),
        ]
      );
      return rows[0];
    } catch (err: any) {
      // Unique constraint violation — return the existing row (idempotent)
      if (err.code === '23505') {
        const existing = await pgTransactionRepo.findByIdempotencyKey(input.idempotency_key);
        if (existing) return existing;
      }
      throw err;
    }
  },

  async findByIdempotencyKey(key: string): Promise<PgTransaction | null> {
    const { rows } = await getPool().query<PgTransaction>(
      'SELECT * FROM transactions WHERE idempotency_key = $1',
      [key]
    );
    return rows[0] ?? null;
  },

  async findById(id: string): Promise<PgTransaction | null> {
    const { rows } = await getPool().query<PgTransaction>(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );
    return rows[0] ?? null;
  },

  async findByGatewayOrderId(orderId: string): Promise<PgTransaction | null> {
    const { rows } = await getPool().query<PgTransaction>(
      'SELECT * FROM transactions WHERE gateway_order_id = $1',
      [orderId]
    );
    return rows[0] ?? null;
  },

  async findByUserId(userId: string): Promise<PgTransaction[]> {
    const { rows } = await getPool().query<PgTransaction>(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async updateStatus(
    id: string,
    status: TransactionStatus,
    fields: {
      gateway_payment_id?: string;
      gateway_signature?: string;
      failure_reason?: string;
    } = {}
  ): Promise<PgTransaction | null> {
    const { rows } = await getPool().query<PgTransaction>(
      `UPDATE transactions
       SET status             = $2,
           gateway_payment_id = COALESCE($3, gateway_payment_id),
           gateway_signature  = COALESCE($4, gateway_signature),
           failure_reason     = COALESCE($5, failure_reason),
           updated_at         = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        status,
        fields.gateway_payment_id ?? null,
        fields.gateway_signature ?? null,
        fields.failure_reason ?? null,
      ]
    );
    return rows[0] ?? null;
  },

  async appendWebhookEvent(id: string, event: WebhookEvent): Promise<void> {
    await getPool().query(
      `UPDATE transactions
       SET webhook_events = webhook_events || $2::jsonb,
           updated_at     = NOW()
       WHERE id = $1`,
      [id, JSON.stringify([event])]
    );
  },
};
