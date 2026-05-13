import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import { connectPostgres } from './config/postgres';
import { initTransactionsTable } from './models/PgTransaction';
import { initUsersTable } from './models/PgUser';
import { runMongoToPostgresMigration } from './migrations/mongoToPostgres';
import { config } from './config/env';
import { verifyToken } from './middleware/auth';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './api/authRoutes';
import emailRoutes from './api/emailRoutes';
import paymentRoutes from './api/paymentRoutes';
import contactRoutes from './api/contactRoutes';
import webhookRoutes from './api/webhookRoutes';
import payuRoutes from './api/payuRoutes';
import cashfreeRoutes from './api/cashfreeRoutes';
import { startCashfreePoller } from './services/cashfreePoller';
import { logger } from './utils/logger';

const app = express();

// Trust the first proxy hop (Cloud Run / GCP load balancer sets X-Forwarded-For)
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'https://picthper.com',
    'https://pitchperfect-frontend-968931902817.us-central1.run.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ────────────────────────────────────────────────────────────
// Order matters: specific routes first, then the global json parser.

// 1. Generic payment webhook: raw body for HMAC-SHA256 signature verification
app.use('/api/webhook/payment', express.raw({ type: 'application/json' }));

// 2. PayU IPN webhooks: urlencoded form data (server-to-server from PayU)
app.use('/api/webhook/payu', express.urlencoded({ extended: false }));

// 3. Cashfree webhooks: raw body for HMAC-SHA256 signature verification
app.use('/api/webhook/cashfree', express.raw({ type: 'application/json' }));

// 4. PayU browser callbacks (surl/furl): urlencoded form data posted by PayU
app.use('/api/payu/callback', express.urlencoded({ extended: false }));

// 4. All other routes: JSON
app.use(express.json());

app.use(apiLimiter);

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`--> ${req.method} ${req.path}`, { ip: req.ip, query: req.query });

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`<-- ${req.method} ${req.path} ${res.statusCode} (${ms}ms)`);
  });

  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/email', verifyToken, emailRoutes);
app.use('/api/payment', verifyToken, paymentRoutes);
app.use('/api/contact', contactRoutes);

// Webhook routes (no auth — called by payment gateways)
app.use('/api/webhook', webhookRoutes);

// PayU routes: /api/payu/initiate (protected inside the router), /api/payu/callback/*
app.use('/api/payu', payuRoutes);

// Cashfree routes: /api/cashfree/initiate (protected inside the router), /api/cashfree/callback
app.use('/api/cashfree', cashfreeRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const startServer = async () => {
  // Bind the port first so Cloud Run's startup probe succeeds immediately.
  // DB connections happen after — if they fail the process exits and Cloud Run restarts.
  const port = config.port;
  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      logger.info(`Server running on http://localhost:${port}`);
      resolve();
    });
  });

  try {
    await connectDB();
    await connectPostgres();
    await initTransactionsTable();
    await initUsersTable();
    // await runMongoToPostgresMigration();
    // startCashfreePoller();
  } catch (error) {
    logger.error('Failed to connect to databases', { error });
    process.exit(1);
  }
};

startServer();

export default app;
