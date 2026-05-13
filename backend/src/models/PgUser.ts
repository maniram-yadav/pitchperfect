import { randomUUID } from 'crypto';
import { getPool } from '../config/postgres';
import type { PlanName } from '../types/transaction';
import { logger } from '../utils/logger';

export interface PgUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  tokens: number;
  plan: PlanName;
  email_verified: boolean;
  email_verification_token: string | null;
  profile: {
    role?: string;
    company?: string;
    website?: string;
    productDescription?: string;
    valueProposition?: string;
    usp?: string;
  };
  created_at: Date;
  updated_at: Date;
}

export interface PgOtpToken {
  id: string;
  email: string;
  otp_hash: string;
  expires_at: Date;
  attempts: number;
  created_at: Date;
}

export const initUsersTable = async (): Promise<void> => {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id                        TEXT          PRIMARY KEY,
      name                      TEXT          NOT NULL,
      email                     TEXT          UNIQUE NOT NULL,
      password_hash             TEXT          NOT NULL,
      tokens                    INTEGER       NOT NULL DEFAULT 10,
      plan                      VARCHAR(50)   NOT NULL DEFAULT 'free',
      email_verified            BOOLEAN       NOT NULL DEFAULT false,
      email_verification_token  TEXT,
      profile                   JSONB         NOT NULL DEFAULT '{}',
      created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS otp_tokens (
      id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      email       TEXT          NOT NULL,
      otp_hash    TEXT          NOT NULL,
      expires_at  TIMESTAMPTZ   NOT NULL,
      attempts    INTEGER       NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON otp_tokens(email)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires_at ON otp_tokens(expires_at)`);

  logger.info('PostgreSQL users and otp_tokens tables initialized');
};

export const pgUserRepo = {
  async create(input: {
    id?: string;
    name: string;
    email: string;
    password_hash: string;
    tokens?: number;
    plan?: PlanName;
    email_verified?: boolean;
    email_verification_token?: string | null;
    profile?: Record<string, string>;
    created_at?: Date;
    updated_at?: Date;
  }): Promise<PgUser> {
    const id = input.id ?? randomUUID();
    const { rows } = await getPool().query<PgUser>(
      `INSERT INTO users
         (id, name, email, password_hash, tokens, plan, email_verified, email_verification_token, profile, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        input.name,
        input.email.toLowerCase().trim(),
        input.password_hash,
        input.tokens ?? 10,
        input.plan ?? 'free',
        input.email_verified ?? false,
        input.email_verification_token ?? null,
        JSON.stringify(input.profile ?? {}),
        input.created_at ?? new Date(),
        input.updated_at ?? new Date(),
      ]
    );
    return rows[0];
  },

  async findById(id: string): Promise<PgUser | null> {
    const { rows } = await getPool().query<PgUser>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<PgUser | null> {
    const { rows } = await getPool().query<PgUser>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return rows[0] ?? null;
  },

  async findByVerificationToken(token: string): Promise<PgUser | null> {
    const { rows } = await getPool().query<PgUser>(
      'SELECT * FROM users WHERE email_verification_token = $1',
      [token]
    );
    return rows[0] ?? null;
  },

  async updateVerification(id: string, verified: boolean, token: string | null): Promise<PgUser | null> {
    const { rows } = await getPool().query<PgUser>(
      `UPDATE users
       SET email_verified = $2, email_verification_token = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, verified, token]
    );
    return rows[0] ?? null;
  },

  async updateVerificationToken(id: string, token: string): Promise<void> {
    await getPool().query(
      `UPDATE users SET email_verification_token = $2, updated_at = NOW() WHERE id = $1`,
      [id, token]
    );
  },

  async updateProfile(id: string, profile: Record<string, string>): Promise<PgUser | null> {
    const { rows } = await getPool().query<PgUser>(
      `UPDATE users SET profile = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, JSON.stringify(profile)]
    );
    return rows[0] ?? null;
  },

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await getPool().query(
      `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
      [id, passwordHash]
    );
  },

  async updatePasswordByEmail(email: string, passwordHash: string): Promise<void> {
    await getPool().query(
      `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE email = $1`,
      [email.toLowerCase().trim(), passwordHash]
    );
  },

  // Atomic deduct — returns null if user not found or insufficient tokens
  async deductTokens(id: string, amount: number): Promise<PgUser | null> {
    const { rows } = await getPool().query<PgUser>(
      `UPDATE users
       SET tokens = tokens - $2, updated_at = NOW()
       WHERE id = $1 AND tokens >= $2
       RETURNING *`,
      [id, amount]
    );
    return rows[0] ?? null;
  },

  // Atomic add — also updates plan if provided
  async addTokensAndPlan(id: string, tokensToAdd: number, plan: PlanName): Promise<PgUser | null> {
    const { rows } = await getPool().query<PgUser>(
      `UPDATE users
       SET tokens = tokens + $2, plan = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, tokensToAdd, plan]
    );
    return rows[0] ?? null;
  },
};

export const pgOtpTokenRepo = {
  async create(input: {
    email: string;
    otp_hash: string;
    expires_at: Date;
  }): Promise<PgOtpToken> {
    const pool = getPool();
    // Replace any existing OTP for this email and purge stale ones
    await pool.query('DELETE FROM otp_tokens WHERE email = $1', [input.email.toLowerCase().trim()]);
    await pool.query('DELETE FROM otp_tokens WHERE expires_at < NOW()');

    const { rows } = await pool.query<PgOtpToken>(
      `INSERT INTO otp_tokens (email, otp_hash, expires_at) VALUES ($1, $2, $3) RETURNING *`,
      [input.email.toLowerCase().trim(), input.otp_hash, input.expires_at]
    );
    return rows[0];
  },

  async findByEmail(email: string): Promise<PgOtpToken | null> {
    const { rows } = await getPool().query<PgOtpToken>(
      'SELECT * FROM otp_tokens WHERE email = $1 AND expires_at > NOW()',
      [email.toLowerCase().trim()]
    );
    return rows[0] ?? null;
  },

  async incrementAttempts(id: string): Promise<void> {
    await getPool().query(
      'UPDATE otp_tokens SET attempts = attempts + 1 WHERE id = $1',
      [id]
    );
  },

  async deleteById(id: string): Promise<void> {
    await getPool().query('DELETE FROM otp_tokens WHERE id = $1', [id]);
  },
};
