# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seth Online (赛斯在线) is a Next.js web application that provides AI-powered chat functionality using Dify API, with user authentication, subscription management, and chat history features. The app is designed with a mystical theme connecting users with "fifth-dimensional Seth wisdom."

## Architecture

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components using Lucide React icons
- **State Management**: React Context API for authentication

### Backend & Services
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password, Google OAuth)
- **AI Service**: Dify API for chat functionality
- **Deployment**: Netlify

### Key Components Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
├── contexts/             # React Context providers
├── lib/                  # Utility functions and API clients
└── types/                # TypeScript type definitions
```

## Development Commands

### Local Development
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Setup
1. Execute the SQL schema from `supabase-schema.sql` in your Supabase project
2. Ensure RLS policies are properly configured
3. Set up the required environment variables

## Environment Variables

Required environment variables (see `.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DIFY_API_URL=https://pro.aifunbox.com/v1/
DIFY_API_KEY=your_dify_api_key
```

## Database Schema

### Core Tables
- `user_profiles`: User subscription and usage information
- `chat_conversations`: Chat session management
- `chat_messages`: Individual messages storage
- `subscriptions`: Payment and subscription tracking

### Key Features
- Row Level Security (RLS) for user data isolation
- Automatic user profile creation on signup
- Usage counting and limits enforcement
- Conversation history with message persistence

## API Integration

### Dify API
- **Endpoint**: Configurable via `DIFY_API_URL`
- **Authentication**: Bearer token via `DIFY_API_KEY` 
- **Features**: Streaming responses, conversation continuity
- **Implementation**: See `src/lib/dify.ts`

### Supabase Integration
- **Client Setup**: `src/lib/supabase.ts`
- **Database Operations**: `src/lib/database.ts`
- **Auth Context**: `src/contexts/AuthContext.tsx`

## Component Architecture

### Authentication Flow
- `AuthModal`: Login/signup modal with email and Google auth
- `AuthContext`: Global authentication state management
- OAuth callback handling in `/auth/callback`

### Chat Interface
- `ChatInterface`: Main chat UI with sidebar for conversation history
- Real-time streaming response handling
- Message persistence to database
- Usage limit enforcement

### Subscription Management
- `SubscriptionModal`: Subscription tier selection and upgrade
- Three tiers: Free (15 messages), Standard ($19.99/month, 150 messages), Premium ($49.99/month, 500 messages)
- Payment integration ready (Stripe for international, Ping++ for domestic)

## Deployment Configuration

### Netlify Setup
- Build command: `npm run build`
- Publish directory: `.next`
- Environment variables configured in Netlify dashboard
- Redirects configured via `netlify.toml`

### Build Configuration
- `next.config.ts` optimized for Netlify deployment
- Standalone output for better performance
- External packages configured for server-side rendering

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration with Next.js recommended rules
- Tailwind CSS for styling with custom gradient themes
- Mobile-first responsive design approach

### Error Handling
- Comprehensive error boundaries for chat functionality
- User-friendly error messages for authentication failures
- Graceful degradation for API failures

### Performance Considerations
- Streaming responses for real-time chat experience
- Optimized database queries with proper indexing
- Client-side caching for conversation history
- Lazy loading for non-critical components

## Testing and Quality Assurance

### Before Deployment
- Run `npm run build` to ensure compilation success
- Test all authentication flows (email, Google)
- Verify chat functionality with real Dify API
- Check responsive design on mobile devices
- Validate subscription upgrade flow

### Common Issues
- Ensure Supabase RLS policies allow proper data access
- Verify Dify API key permissions and rate limits
- Check environment variable configuration
- Validate OAuth redirect URLs for Google authentication

## Future Enhancements

### Payment Integration
- Stripe integration for international payments
- Ping++ integration for Chinese domestic payments
- Subscription lifecycle management
- Usage analytics and reporting

### Feature Expansions
- Chat export functionality (JSON/TXT formats)
- Advanced conversation management
- User preference settings
- Multi-language support

This architecture provides a solid foundation for a production-ready AI chat application with proper authentication, data persistence, and subscription management.