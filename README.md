# PitchPerfect - AI Cold Email Generator

## Overview
PitchPerfect is a token-based AI-powered cold email generator that helps sales teams, freelancers, and agencies create personalized, high-converting cold emails in seconds.

## Project Structure

### Backend (`/backend`)
- **Technology**: Node.js + Express + TypeScript + MongoDB
- **Key Files**:
  - `src/api/` - API routes for auth, email generation, and payments
  - `src/models/` - MongoDB schemas (User, EmailGeneration, Transaction)
  - `src/services/` - Business logic (auth, email, payment services)
  - `src/middleware/` - Authentication and rate limiting
  - `src/config/` - Database and environment configuration

### Frontend (`/frontend`)
- **Technology**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Key Files**:
  - `src/pages/` - Main pages (login, signup, dashboard, generate, billing)
  - `src/components/` - Reusable React components
  - `src/hooks/` - Custom hooks (useAuth, useEmailGeneration)
  - `src/lib/` - API client, Zustand stores, and utilities
  - `src/types/` - TypeScript interfaces

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and API keys
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features Implemented (MVP)

### ✅ Authentication
- User signup/login with JWT
- Password hashing with bcryptjs
- Token refresh mechanism
- Profile management

### ✅ Email Generation
- AI-powered email creation with multiple variations
- Customizable parameters (tone, length, type, CTA)
- Email sequence generation (3-email sequences)
- Generation history tracking

### ✅ Token System
- User token balance tracking
- Token deduction on email generation
- Token-based monetization
- Free/Starter/Pro plans

### ✅ Payment Integration (Placeholder)
- Payment initiation flow
- Transaction tracking
- Payment success/failure handling
- Transaction history

### ✅ UI/Components
- Responsive design with Tailwind CSS
- Login/Signup forms
- Email generation form with validation
- Dashboard with token balance
- Billing/pricing page
- Email preview component
- Navigation and layout components

## API Endpoints

### Auth Routes
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Email Routes
- `POST /api/email/generate` - Generate emails (requires auth)
- `GET /api/email/history` - Get generation history
- `GET /api/email/:generationId` - Get specific generation

### Payment Routes
- `POST /api/payment/initiate` - Start payment process
- `POST /api/payment/success` - Confirm payment
- `POST /api/payment/failure` - Handle failed payment
- `GET /api/payment/history` - Get transaction history
- `GET /api/tokens/balance` - Get token balance

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
OPENAI_API_KEY=your_openai_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Placeholder Features (Not Implemented)

These features are marked as placeholders for future implementation:

1. **LinkedIn Scraper Input** - Auto-fill recipient data from LinkedIn
2. **Company Website Analyzer** - Extract company info from URLs
3. **Email Personalization Tags** - Dynamic variables like {{first_name}}
4. **A/B Testing** - Track performance of different email versions
5. **CRM Integration** - HubSpot/Salesforce sync
6. **Chrome Extension** - Browser extension for quick email generation

## Next Steps

1. **Integrate OpenAI API** - Replace mock email generation with real AI
2. **Setup Razorpay Payment** - Implement actual payment processing
3. **Add Email Analytics** - Track open rates, click rates, replies
4. **Build Chrome Extension** - Browser plugin for easy access
5. **Implement LinkedIn Scraper** - Auto-fill recipient information
6. **Add Company Website Analyzer** - Extract business insights from URLs

## Testing

Run tests with:
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Deployment

### Backend
- Use services like Heroku, Railway, or AWS
- Update MONGODB_URI for production
- Set NODE_ENV=production

### Frontend
- Deploy to Vercel (recommended for Next.js)
- Update NEXT_PUBLIC_API_URL to production API

## Support

For issues or questions, please create an issue in the repository.
