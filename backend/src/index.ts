import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import { config } from './config/env';
import { verifyToken } from './middleware/auth';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './api/authRoutes';
import emailRoutes from './api/emailRoutes';
import paymentRoutes from './api/paymentRoutes';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', verifyToken, emailRoutes);
app.use('/api/payment', verifyToken, paymentRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();

export default app;
