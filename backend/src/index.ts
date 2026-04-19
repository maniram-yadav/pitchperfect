import express from 'express';
import { connectDB } from './config/database';
import { config } from './config/env';
import { verifyToken } from './middleware/auth';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './api/authRoutes';
import emailRoutes from './api/emailRoutes';
import paymentRoutes from './api/paymentRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(apiLimiter);

// Routes
app.post('/api/auth/signup', authRoutes);
app.post('/api/auth/login', authRoutes);
app.get('/api/auth/profile', verifyToken, authRoutes);

app.post('/api/email/generate', verifyToken, emailRoutes);
app.get('/api/email/history', verifyToken, emailRoutes);
app.get('/api/email/:generationId', verifyToken, emailRoutes);

app.post('/api/payment/initiate', verifyToken, paymentRoutes);
app.post('/api/payment/success', verifyToken, paymentRoutes);
app.post('/api/payment/failure', paymentRoutes);
app.get('/api/payment/history', verifyToken, paymentRoutes);
app.get('/api/tokens/balance', verifyToken, paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
