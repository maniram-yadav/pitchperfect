import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Helper function to read and expand environment variables
 * Supports both direct values and references to system env variables
 * Examples:
 *   OPENAI_API_KEY=sk-direct-key (direct value)
 *   OPENAI_API_KEY=${SYSTEM_OPENAI_API_KEY} (reference to system env variable)
 */
const getEnvValue = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue || '';

  // Check if value is a reference to another env variable (${VAR_NAME})
  if (value.startsWith('${') && value.endsWith('}')) {
    const refKey = value.slice(2, -1);
    const refValue = process.env[refKey];
    if (refValue) {
      return refValue;
    }
    console.warn(`⚠️  Environment variable reference ${value} not found for key ${key}`);
    return defaultValue || '';
  }

  return value;
};

export const config = {
  port: parseInt(getEnvValue('PORT', '5000'), 10),
  nodeEnv: getEnvValue('NODE_ENV', 'development'),
  mongodb: {
    uri: getEnvValue('MONGODB_URI', 'mongodb://localhost:27017/pitchperfect'),
  },
  jwt: {
    secret: getEnvValue('JWT_SECRET', 'secret-key'),
    refreshSecret: getEnvValue('JWT_REFRESH_SECRET', 'refresh-secret-key'),
    expiresIn: '1h',
    refreshExpiresIn: '7d',
  },
  aiProvider: {
    provider: (getEnvValue('AI_PROVIDER', 'openai')) as 'openai' | 'mock',
    apiKey: getEnvValue('OPENAI_API_KEY', ''),
    model: getEnvValue('OPENAI_MODEL', 'gpt-4'),
    temperature: parseFloat(getEnvValue('OPENAI_TEMPERATURE', '0.7')),
  },
  postgres: {
    // Google Cloud SQL: set CLOUD_SQL_SOCKET_PATH=/cloudsql/project:region:instance
    // Direct TCP: set POSTGRES_HOST, POSTGRES_PORT, POSTGRES_SSL
    socketPath: getEnvValue('CLOUD_SQL_SOCKET_PATH', ''),
    host: getEnvValue('POSTGRES_HOST', 'localhost'),
    port: parseInt(getEnvValue('POSTGRES_PORT', '5432'), 10),
    user: getEnvValue('POSTGRES_USER', 'postgres'),
    password: getEnvValue('POSTGRES_PASSWORD', ''),
    database: getEnvValue('POSTGRES_DATABASE', 'pitchperfect'),
    ssl: getEnvValue('POSTGRES_SSL', 'false') === 'true',
    poolSize: parseInt(getEnvValue('POSTGRES_POOL_SIZE', '10'), 10),
  },
  razorpay: {
    keyId: getEnvValue('RAZORPAY_KEY_ID', ''),
    keySecret: getEnvValue('RAZORPAY_KEY_SECRET', ''),
  },
  cashfree: {
    appId: getEnvValue('CASHFREE_APP_ID', ''),
    secretKey: getEnvValue('CASHFREE_SECRET_KEY', ''),
    webhookSecret: getEnvValue('CASHFREE_WEBHOOK_SECRET', ''),
    // true → sandbox.cashfree.com  |  false → api.cashfree.com (production)
    sandboxMode: getEnvValue('CASHFREE_SANDBOX_MODE', 'true') === 'true',
    poll: {
      // How often the poller wakes up (ms). Default: 5 minutes.
      intervalMs: parseInt(getEnvValue('CASHFREE_POLL_INTERVAL_MS', '300000'), 10),
      // Max number of poll attempts before marking a transaction as 'stuck'.
      maxAttempts: parseInt(getEnvValue('CASHFREE_POLL_MAX_ATTEMPTS', '5'), 10),
      // Minimum age of a transaction (minutes) before the first poll attempt.
      minAgeMinutes: parseInt(getEnvValue('CASHFREE_POLL_MIN_AGE_MINUTES', '10'), 10),
    },
  },
  payu: {
    merchantKey: getEnvValue('PAYU_MERCHANT_KEY', ''),
    merchantSalt: getEnvValue('PAYU_MERCHANT_SALT', ''),
    // true → https://test.payu.in/_payment  |  false → https://secure.payu.in/_payment
    testMode: getEnvValue('PAYU_TEST_MODE', 'true') === 'true',
  },
  backendUrl: getEnvValue('BACKEND_URL', 'http://localhost:5000'),
  webhookSecret: getEnvValue('WEBHOOK_SECRET', ''),
  gmail: {
    strategy: getEnvValue('EMAIL_STRATEGY', 'smtp') as 'smtp' | 'oauth2',
    user: getEnvValue('GMAIL_USER', ''),
    // smtp strategy
    appPassword: getEnvValue('GMAIL_APP_PASSWORD', ''),
    // oauth2 strategy
    clientId: getEnvValue('GMAIL_CLIENT_ID', ''),
    clientSecret: getEnvValue('GMAIL_CLIENT_SECRET', ''),
    refreshToken: getEnvValue('GMAIL_REFRESH_TOKEN', ''),
  },
  frontendUrl: getEnvValue('FRONTEND_URL', ''),
  contactEmail: getEnvValue('CONTACT_EMAIL', ''),
};
