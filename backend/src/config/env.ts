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
  razorpay: {
    keyId: getEnvValue('RAZORPAY_KEY_ID', ''),
    keySecret: getEnvValue('RAZORPAY_KEY_SECRET', ''),
  },
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
};
