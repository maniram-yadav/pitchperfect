# Environment Variables Configuration Guide

This project supports reading environment variables from multiple sources:
1. **System environment variables** (highest priority)
2. **`.env` file** (loaded by dotenv)
3. **Default values** (fallback)

## Using System Environment Variables

### Why Use System Environment Variables?

- **Security**: Keep sensitive data (API keys) out of source control
- **Flexibility**: Different values for development, staging, production
- **CI/CD Integration**: Automatically set in deployment pipelines

### How to Set System Environment Variables

#### Linux/Mac (Bash/Zsh)

```bash
# Temporary (current session only)
export OPENAI_API_KEY=sk-your-api-key
export SYSTEM_OPENAI_API_KEY=sk-your-api-key

# Permanent (add to ~/.bashrc, ~/.zshrc, or ~/.bash_profile)
echo 'export OPENAI_API_KEY=sk-your-api-key' >> ~/.bashrc
source ~/.bashrc
```

#### Windows (PowerShell or CMD)

```powershell
# Temporary (current session only)
$env:OPENAI_API_KEY = "sk-your-api-key"

# Permanent (System Environment Variables)
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-your-api-key", [EnvironmentVariableTarget]::User)
# Restart PowerShell/CMD after setting
```

#### Windows (Command Prompt)

```cmd
# Temporary (current session only)
set OPENAI_API_KEY=sk-your-api-key

# Permanent (System Environment Variables via GUI)
# Settings > System > Advanced system settings > Environment Variables
```

## Configuration Methods

### Method 1: Direct Values in `.env` (Development)

```env
OPENAI_API_KEY=sk-your-direct-key
RAZORPAY_KEY_ID=your-key-id
```

**Pros**: Simple, works immediately  
**Cons**: Never commit sensitive keys to git

### Method 2: Reference System Environment Variables (Recommended)

```env
OPENAI_API_KEY=${SYSTEM_OPENAI_API_KEY}
RAZORPAY_KEY_ID=${SYSTEM_RAZORPAY_KEY_ID}
```

**Then set system env variables:**

```bash
export SYSTEM_OPENAI_API_KEY=sk-your-api-key
export SYSTEM_RAZORPAY_KEY_ID=your-key-id
```

**Pros**: Secure, flexible, CI/CD friendly  
**Cons**: Requires setting system env vars

### Method 3: Direct System Environment Variables (Best for Production)

```bash
# Don't use .env in production, rely on system env vars
export OPENAI_API_KEY=sk-your-api-key
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
export JWT_SECRET=your-secret
```

**Then .env is optional or minimal**

**Pros**: Most secure, production best practice  
**Cons**: More setup required

## Variable Reference Examples

### In `.env` file:

```env
# Direct values
OPENAI_API_KEY=sk-direct-key
MONGODB_URI=mongodb://localhost:27017/pitchperfect

# References to system env variables
OPENAI_API_KEY=${SYSTEM_OPENAI_API_KEY}
JWT_SECRET=${MY_JWT_SECRET}
RAZORPAY_KEY_SECRET=${PROD_RAZORPAY_SECRET}
```

### In system environment:

```bash
# Option A: Use same names
export OPENAI_API_KEY=sk-your-key
export MONGODB_URI=mongodb+srv://...
export JWT_SECRET=your-secret

# Option B: Use prefixed names (referenced in .env)
export SYSTEM_OPENAI_API_KEY=sk-your-key
export MY_JWT_SECRET=your-secret
export PROD_RAZORPAY_SECRET=secret-key
```

## Complete Setup Example

### Step 1: Set System Environment Variables

```bash
# Linux/Mac
export SYSTEM_OPENAI_API_KEY=sk-your-actual-key
export SYSTEM_RAZORPAY_KEY_ID=your-actual-id
export SYSTEM_RAZORPAY_KEY_SECRET=your-actual-secret
export MY_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
export MY_JWT_SECRET=super-secret-key-min-32-chars-long

# Verify
echo $SYSTEM_OPENAI_API_KEY  # Should print: sk-your-actual-key
```

### Step 2: Update `.env` file

```env
PORT=5000
NODE_ENV=development

# Reference system environment variables
OPENAI_API_KEY=${SYSTEM_OPENAI_API_KEY}
MONGODB_URI=${MY_MONGODB_URI}
JWT_SECRET=${MY_JWT_SECRET}
RAZORPAY_KEY_ID=${SYSTEM_RAZORPAY_KEY_ID}
RAZORPAY_KEY_SECRET=${SYSTEM_RAZORPAY_KEY_SECRET}

# Or use direct values for non-sensitive config
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
```

### Step 3: Run the application

```bash
npm run dev
```

The config will automatically:
1. Load `.env` file
2. Resolve `${VAR_NAME}` references to system env variables
3. Use fallback defaults if not found

## Troubleshooting

### "Environment variable reference ${SYSTEM_OPENAI_API_KEY} not found"

This warning means the variable you're referencing doesn't exist.

**Solution:**
```bash
# Check if env var is set
echo $SYSTEM_OPENAI_API_KEY

# If empty, set it
export SYSTEM_OPENAI_API_KEY=sk-your-key

# Try again
npm run dev
```

### Change Not Taking Effect

If you updated system env variables, you may need to:

1. **Restart your terminal/IDE** (environment variables are loaded when shell starts)
2. **Restart the application** (Node reads env vars on startup)

```bash
# Restart in same session (Linux/Mac)
exec bash

# Verify env var is set
echo $SYSTEM_OPENAI_API_KEY
```

### Check Current Configuration

Add this to `src/index.ts` temporarily to see loaded values:

```typescript
import { config } from './config/env';
console.log('Config:', JSON.stringify({
  aiProvider: config.aiProvider.provider,
  nodeEnv: config.nodeEnv,
  // Don't log actual keys!
}, null, 2));
```

## Production Deployment

### Environment Variables in Docker

```dockerfile
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV JWT_SECRET=${JWT_SECRET}
```

```bash
docker run -e OPENAI_API_KEY=sk-... -e JWT_SECRET=... myapp
```

### Environment Variables in Cloud Platforms

**AWS EC2/ECS:**
- Use Systems Manager Parameter Store or Secrets Manager
- Load into container as environment variables

**Google Cloud / Azure:**
- Use Secret Manager or Key Vault
- Set as environment variables during deployment

**Heroku:**
```bash
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set JWT_SECRET=...
```

## Security Best Practices

✅ **DO:**
- Use system environment variables for sensitive data
- Use `.env.example` with placeholder values in git
- Rotate API keys regularly
- Use different keys for dev/staging/production
- Never commit actual `.env` file to git
- Use CI/CD secrets management for deployments

❌ **DON'T:**
- Commit `.env` with real API keys to git
- Log or print sensitive values
- Pass secrets through URLs or query parameters
- Use same keys across environments
- Share environment variable secrets in chat/email

## Summary

| Method | Security | Setup Complexity | CI/CD Ready | Recommended For |
|--------|----------|-----------------|-------------|-----------------|
| Direct `.env` | ⚠️ Low | Simple | No | Development only |
| `.env` + References | ✅ High | Medium | Yes | Development & Testing |
| System Env Vars Only | ✅✅ Highest | Medium | Yes | Production |
