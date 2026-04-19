# AI Email Generation Providers

This system supports multiple AI providers for generating cold emails. You can easily switch between providers by changing the configuration in your `.env` file.

## Supported Providers

### 1. **OpenAI** (Default, Production)
Uses OpenAI's GPT API to generate high-quality, personalized cold emails.

**Configuration in `.env`:**
```
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
```

**Requirements:**
- Valid OpenAI API key from [platform.openai.com](https://platform.openai.com)
- Model: `gpt-4` (recommended) or `gpt-3.5-turbo`
- Temperature: 0.0 to 1.0 (0.7 is balanced, lower = more deterministic, higher = more creative)

**Features:**
- ✅ High-quality, contextual email generation
- ✅ Proper sequence generation with follow-ups
- ✅ Respects tone, length, and email type preferences
- ✅ Personalization based on input parameters

### 2. **Mock** (Testing/Development)
Returns realistic test data without making actual API calls. Perfect for testing the UI without OpenAI costs.

**Configuration in `.env`:**
```
AI_PROVIDER=mock
```

**Features:**
- ✅ No API key required
- ✅ Instant responses (500ms simulation)
- ✅ Realistic test data
- ✅ Full sequence generation
- ✅ Free (no API costs)

## How to Switch Providers

### Using OpenAI in Production:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...your-key...
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
```

### Using Mock for Testing:
```env
AI_PROVIDER=mock
```

Then restart your backend server:
```bash
npm run dev
```

## Implementation Details

### Architecture
```
Backend
├── src/
│   ├── services/
│   │   ├── emailService.ts (Main service using configured provider)
│   │   ├── aiProviderFactory.ts (Factory to instantiate providers)
│   │   └── providers/
│   │       ├── openaiProvider.ts (OpenAI implementation)
│   │       └── mockAIProvider.ts (Mock implementation)
│   ├── types/
│   │   └── aiProvider.ts (AI provider interfaces)
│   └── config/
│       └── env.ts (Configuration loader)
```

### How It Works

1. **Configuration Loading** (`env.ts`):
   - Reads AI provider setting from `.env`
   - Loads API keys and model parameters

2. **Provider Factory** (`aiProviderFactory.ts`):
   - Instantiates the configured provider
   - Validates required configuration
   - Throws error if invalid provider or missing API key

3. **Email Service** (`emailService.ts`):
   - Uses the initialized provider via factory
   - Handles token deduction and database storage
   - Tracks which provider was used for each generation

4. **AI Providers** (`providers/`):
   - Implement common `AIProvider` interface
   - Both support email generation and sequence creation
   - Handle their specific API interactions

## API Integration Example

When the frontend calls the email generation endpoint:
```
POST /api/email/generate
Body: {
  senderName: "John Doe",
  senderRole: "Sales Manager",
  senderCompany: "Acme Corp",
  targetIndustry: "SaaS",
  targetRole: "CTO",
  painPoints: ["Team scaling", "Engineering efficiency"],
  valueProposition: "Streamlined engineering workflows",
  variations: 3,
  generateSequence: true,
  ...other fields
}
```

**Response** (includes provider information):
```json
{
  "success": true,
  "message": "Emails generated successfully",
  "data": {
    "generationId": "...",
    "provider": "openai", // or "mock"
    "emails": [
      {
        "subject": "Quick question about SaaS",
        "body": "...",
        "variation": 1
      },
      ...
    ],
    "sequence": [
      {
        "day": 1,
        "subject": "...",
        "body": "..."
      },
      ...
    ],
    "tokensUsed": 10
  }
}
```

## Cost Comparison

| Provider | Cost | Speed | Quality | Best For |
|----------|------|-------|---------|----------|
| **OpenAI** | $$ (per token) | 5-10 sec | ⭐⭐⭐⭐⭐ | Production |
| **Mock** | Free | <1 sec | ⭐⭐⭐⭐ | Testing & Demo |

## Environment Variables Summary

```env
# Required for OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Optional OpenAI parameters
OPENAI_MODEL=gpt-4              # Default: gpt-4
OPENAI_TEMPERATURE=0.7          # Default: 0.7

# For testing (no additional variables needed)
AI_PROVIDER=mock
```

## Troubleshooting

### "OpenAI API key is required when using openai provider"
- Add `OPENAI_API_KEY=sk-...` to `.env`
- Restart backend server

### "Unknown AI provider"
- Valid providers: `openai`, `mock`
- Check spelling in `AI_PROVIDER=`

### API rate limiting (429 errors)
- Implement request queuing
- Add delays between requests
- Use gpt-3.5-turbo for lower costs

### Slow generation
- Switch to `gpt-3.5-turbo` model
- Reduce `OPENAI_TEMPERATURE` for faster deterministic responses
- Use mock provider for testing

## Future Providers

The architecture supports easy addition of new providers:
1. Create `src/services/providers/newProviderName.ts`
2. Implement the `AIProvider` interface
3. Update factory to handle new provider
4. Add to enum: `AI_PROVIDER=newprovider`
