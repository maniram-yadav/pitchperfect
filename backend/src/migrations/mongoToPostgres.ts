import { getPool } from '../config/postgres';
import { UserModel } from '../models/User';
import { OtpTokenModel } from '../models/OtpToken';
import { logger } from '../utils/logger';

const MIGRATION_NAME = 'mongo_to_postgres_users_v1';

export async function runMongoToPostgresMigration(): Promise<void> {
  const pool = getPool();

  // Ensure a migrations tracking table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      name    TEXT        PRIMARY KEY,
      ran_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query<{ name: string }>(
    'SELECT name FROM migrations WHERE name = $1',
    [MIGRATION_NAME]
  );

  if (rows.length > 0) {
    logger.info('Migration already ran — skipping', { migration: MIGRATION_NAME });
    return;
  }

  logger.info('Starting MongoDB → PostgreSQL user migration', { migration: MIGRATION_NAME });

  // ── Migrate users ──────────────────────────────────────────────────────────
  const users = await UserModel.find({}).lean();
  logger.info(`Migrating ${users.length} users`);

  for (const user of users) {
    await pool.query(
      `INSERT INTO users
         (id, name, email, password_hash, tokens, plan, email_verified,
          email_verification_token, profile, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (email) DO NOTHING`,
      [
        (user._id as any).toString(),
        user.name,
        user.email,
        user.passwordHash,
        user.tokens,
        user.plan,
        user.emailVerified,
        user.emailVerificationToken ?? null,
        JSON.stringify(user.profile ?? {}),
        (user as any).createdAt ?? new Date(),
        (user as any).updatedAt ?? new Date(),
      ]
    );
  }

  // ── Migrate active OTP tokens ──────────────────────────────────────────────
  const otpTokens = await OtpTokenModel.find({ expiresAt: { $gt: new Date() } }).lean();
  logger.info(`Migrating ${otpTokens.length} active OTP tokens`);

  for (const otp of otpTokens) {
    await pool.query(
      `INSERT INTO otp_tokens (email, otp_hash, expires_at, attempts)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [otp.email, otp.otpHash, otp.expiresAt, otp.attempts]
    );
  }

  // ── Mark migration complete ────────────────────────────────────────────────
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [MIGRATION_NAME]);

  logger.info('MongoDB → PostgreSQL user migration completed', {
    users: users.length,
    otpTokens: otpTokens.length,
  });
}
