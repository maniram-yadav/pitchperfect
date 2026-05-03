import { Pool, PoolConfig } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

const buildPoolConfig = (): PoolConfig => {
  const pg = config.postgres;

  // Google Cloud SQL via Cloud SQL Auth Proxy (Unix socket)
  // Set CLOUD_SQL_SOCKET_PATH=/cloudsql/PROJECT:REGION:INSTANCE
  if (pg.socketPath) {
    return {
      host: pg.socketPath,
      user: pg.user,
      password: pg.password,
      database: pg.database,
      max: pg.poolSize,
    };
  }

  // Direct TCP connection (with optional SSL for Cloud SQL public IP)
  return {
    host: pg.host,
    port: pg.port,
    user: pg.user,
    password: pg.password,
    database: pg.database,
    max: pg.poolSize,
    ssl: pg.ssl ? { rejectUnauthorized: false } : false,
  };
};

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(buildPoolConfig());
    pool.on('error', (err) => {
      logger.error('PostgreSQL pool idle client error', { message: err.message });
    });
  }
  return pool;
};

export const connectPostgres = async (): Promise<void> => {
  const client = await getPool().connect();
  try {
    await client.query('SELECT 1');
    logger.info('PostgreSQL connected successfully');
  } finally {
    client.release();
  }
};

export const disconnectPostgres = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL pool closed');
  }
};
