# Capital Telephony AMD Application

A full-stack application for automated voicemail detection (AMD) in outbound calls, designed to efficiently handle voicemail detection and human detection for sales/outreach applications.

## 🎯 Project Overview

This application enables authenticated users to:
- Initiate outbound calls to US toll-free numbers
- Automatically detect humans vs. voicemail/machines using multiple AMD strategies
- View real-time call status updates
- Track call history with filtering and CSV export
- Compare AMD strategy performance (accuracy, latency, cost)

## 🏗️ Architecture

### Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router, TypeScript)
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Better-Auth (open source)
- **AI/ML**: Python microservice (FastAPI/Flask) - *To be implemented*
- **Telephony**: Twilio SDK - *To be implemented*
- **Code Quality**: ESLint, Prettier, JSDoc/TypeDoc

### Key Architectural Decisions

1. **Separation of Concerns**: AMD logic separated from Twilio orchestration
2. **Real-time Updates**: WebSocket streams for non-blocking AMD status updates (planned)
3. **Error Resilience**: Database transactions for call logs with proper error handling
4. **Modular Design**: Components organized by feature (auth, dial, history)

## 📁 Project Structure

```
capital/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Better-Auth API routes
│   │   │   └── calls/         # Call management API
│   │   ├── dashboard/         # Main application dashboard
│   │   ├── login/             # Login page
│   │   └── signup/            # Signup page
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── dial/              # Dial interface components
│   │   └── history/           # Call history components
│   ├── lib/
│   │   ├── auth.ts            # Better-Auth configuration
│   │   ├── auth-server.ts    # Server-side auth utilities
│   │   └── prisma.ts          # Prisma client singleton
│   └── types/
│       └── call.ts            # TypeScript type definitions
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd capital
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/capital_amd?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Twilio (to be configured later)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# AI/ML API Keys (to be configured later)
GEMINI_API_KEY=""
HUGGINGFACE_API_KEY=""
```

**Important**: Generate a secure secret for `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

4. **Set up the database**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or create migration (production)
npm run db:migrate
```

5. **Run the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Database Schema

The application uses the following main models:

- **User**: Authentication and user management (managed by Better-Auth)
- **Call**: Call session tracking with status, AMD strategy, and Twilio SID
- **CallLog**: Detailed event logs for each call (answered, voicemail_detected, etc.)

See `prisma/schema.prisma` for full schema definition.

## 📖 Features

### ✅ Implemented

1. **Authentication & User Management**
   - User registration with email/password
   - Login/logout functionality
   - Session management via Better-Auth
   - Protected routes and API endpoints

2. **Database (PostgreSQL + Prisma)**
   - Prisma ORM setup with PostgreSQL
   - Call and call log models
   - Proper indexing for performance
   - Relationships and cascading deletes

3. **Core UI**
   - **Dial Interface**:
     - Target phone number input (US toll-free validation)
     - AMD strategy dropdown (Gemini, Hugging Face, Jambonz)
     - "Dial Now" button
     - Form validation and error handling
   - **History View**:
     - Paginated table of past calls
     - Filtering by AMD strategy and call status
     - CSV export functionality
     - Real-time status updates (5-second polling)
     - Color-coded status badges

### 🚧 To Be Implemented

1. **Twilio Integration**
   - Outbound call initiation
   - Media streams for bidirectional audio
   - Call status webhooks

2. **AMD Strategies**
   - Gemini audio analysis integration
   - Hugging Face model integration
   - Jambonz SIP-based AMD
   - Custom threshold calibration from test data

3. **WebSocket Support**
   - Real-time AMD status updates
   - Non-blocking UI updates

4. **Testing**
   - Test suite with provided numbers
   - AMD accuracy measurement
   - Latency and cost tracking

## 🧪 Testing Numbers

Use these numbers for voicemail simulation:
- **Costco**: 1-800-774-2678
- **Nike**: 1-800-806-6453
- **PayPal**: 1-888-221-1161

For human detection testing, use your own phone number.

## 📊 AMD Comparison (To Be Completed)

Once AMD strategies are implemented, this table will track:

| Strategy | Accuracy | Latency | Cost |
|----------|----------|---------|------|
| Gemini | TBD | TBD | TBD |
| Hugging Face | TBD | TBD | TBD |
| Jambonz | TBD | TBD | TBD |

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema changes (dev)
npm run db:migrate       # Create migration (prod)
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run format            # Format with Prettier
npm run format:check      # Check formatting
```

## 🔒 Security Considerations

- Better-Auth handles password hashing and session management
- API routes are protected with authentication checks
- Environment variables for sensitive data
- Input validation on all forms
- SQL injection protection via Prisma ORM

## 📝 Code Documentation

All code includes JSDoc comments explaining:
- Component purposes and props
- Function parameters and return values
- API route endpoints and request/response formats
- Type definitions and enums

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running
- Check database exists and user has proper permissions

### Authentication Issues

- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches your application URL
- Clear browser cookies if experiencing session issues

### Build Errors

- Run `npm run db:generate` if Prisma Client is missing
- Clear `.next` directory and rebuild
- Ensure all environment variables are set

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Name/Team]

## 🔗 References

- [Better-Auth Documentation](https://www.better-auth.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Twilio API Documentation](https://www.twilio.com/docs)

---

**Note**: This is the initial implementation focusing on authentication, database setup, and core UI. Twilio integration, AMD strategies, and WebSocket support will be added in subsequent phases.
