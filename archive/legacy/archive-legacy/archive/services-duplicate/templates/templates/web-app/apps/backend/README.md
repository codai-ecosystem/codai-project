# METU Backend API

This is the backend API for the METU Template project, a modern Next.js
application with Firebase integration. The backend is built with
[Fastify](https://www.fastify.io/) and utilizes Firebase Admin SDK to interact
with Firebase Authentication and Firestore.

## Features

- 🚀 **Fastify** - Fast and efficient Node.js web framework
- 🔥 **Firebase Admin** - Server-side Firebase integration
- 🛡️ **Security** - Built-in CORS, Helmet, and Rate Limiting
- 📚 **Documentation** - Auto-generated Swagger/OpenAPI docs
- 🧪 **Real Data Testing** - Tests run against actual Firebase services (no
  mocks)
- 📝 **Validation** - Zod schema validation
- 🔍 **Type Safety** - Full TypeScript support

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Firebase project with Firestore enabled

### Installation

```bash
# Install dependencies (from repository root)
pnpm install
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_API_KEY=your_firebase_api_key_here

# Optional: Path to service account key file
# GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json

# Server Configuration
PORT=8000
HOST=localhost
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000
```

### Development

```bash
# Start the development server with hot reload
pnpm dev

# Lint the code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm type-check
```

### Testing

This project uses **real data testing** - all tests run against actual Firebase
services without mocking. This ensures tests reflect real-world behavior and
catch integration issues.

#### Test Environment Setup

1. **Create a separate Firebase test project**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project for testing (e.g., "your-app-test")
   - Enable Authentication and Firestore

2. **Configure test credentials**:

   - Copy `.env.test.example` to `.env.test`
   - Replace placeholder values with your test project credentials
   - Generate a service account key for your test project

3. **Test Configuration File** (`.env.test`):

```bash
NODE_ENV=test
FIREBASE_PROJECT_ID=your-test-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-test-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
PORT=8001
HOST=localhost
LOG_LEVEL=error
ALLOWED_ORIGINS=http://localhost:3000
```

#### Running Tests

```bash
# Run all tests with real Firebase services
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

#### Test Behavior

- **With valid Firebase credentials**: Tests run against real Firebase services
  and test actual authentication, data storage, and API responses
- **Without valid credentials**: Tests use fallback behavior with warnings,
  allowing development without immediate Firebase setup
- **Data cleanup**: Tests automatically clean up test data after each run
- **Isolation**: Each test run uses unique identifiers to prevent interference

#### Test Coverage

- ✅ Authentication middleware with real JWT verification
- ✅ API routes with real Firebase integration
- ✅ Error handling with actual service errors
- ✅ Environment configuration validation
- ✅ Health checks with real service connectivity

# Run tests with coverage

pnpm test:coverage

# Run tests in watch mode

pnpm test:watch

````

#### Test Behavior

- **With valid Firebase credentials**: Tests run against real Firebase services and test actual authentication, data storage, and API responses
- **Without valid credentials**: Tests use fallback behavior with warnings, allowing development without immediate Firebase setup
- **Data cleanup**: Tests automatically clean up test data after each run
- **Isolation**: Each test run uses unique identifiers to prevent interference

#### Test Coverage

- ✅ Authentication middleware with real JWT verification
- ✅ API routes with real Firebase integration
- ✅ Error handling with actual service errors
- ✅ Environment configuration validation
- ✅ Health checks with real service connectivity

### Building for Production

```bash
# Build the project
pnpm build

# Start the production server
pnpm start
````

## API Documentation

API documentation is available at `/docs` when the server is running. For
example, http://localhost:8000/docs

## Project Structure

```
src/
├── index.ts          # Application entry point
├── app.ts           # Fastify app configuration
├── lib/              # Utilities and configurations
│   ├── env.ts        # Environment validation with Zod
│   ├── firebase-admin.ts # Firebase Admin SDK initialization
│   ├── auth-middleware.ts # JWT authentication middleware
│   └── error-handler.ts   # Global error handling
├── routes/           # API routes
│   ├── auth.ts       # Authentication routes
│   ├── health.ts     # Health check routes
│   └── users.ts      # User management routes
└── types/            # Type definitions

tests/
├── setup.ts          # Test setup (real services only)
├── test-utils.ts     # Real Firebase test helpers
├── lib/              # Library tests
│   ├── auth-middleware.test.ts
│   ├── env.test.ts
│   └── error-handler.test.ts
└── routes/           # Route tests
    ├── auth.test.ts
    └── users.test.ts
```

## Available Endpoints

### Health Routes

- `GET /api/health`: Basic health check
- `GET /api/health/ready`: Readiness check with Firebase connectivity status

### Authentication Routes

- `POST /api/auth/refresh`: Refresh authentication token
- `POST /api/auth/verify`: Verify authentication token

### User Routes (Protected)

- `GET /api/users/me`: Get current user profile
- `PUT /api/users/me`: Update current user profile
- `DELETE /api/users/me`: Delete current user account

## Firebase Integration

The backend uses Firebase Admin SDK to interact with Firebase services:

- **Firebase Authentication** for user management and JWT verification
- **Firestore** for data storage (if needed)
- **Custom token generation** for authentication flows

## Environment Variables

| Variable                         | Description                 | Required | Default                 |
| -------------------------------- | --------------------------- | -------- | ----------------------- |
| `NODE_ENV`                       | Environment mode            | No       | `development`           |
| `PORT`                           | Server port                 | No       | `8000`                  |
| `HOST`                           | Server host                 | No       | `localhost`             |
| `LOG_LEVEL`                      | Logging level               | No       | `info`                  |
| `FIREBASE_PROJECT_ID`            | Firebase project ID         | Yes      | -                       |
| `FIREBASE_CLIENT_EMAIL`          | Service account email       | No\*     | -                       |
| `FIREBASE_PRIVATE_KEY`           | Service account private key | No\*     | -                       |
| `FIREBASE_API_KEY`               | Firebase Web API key        | No       | -                       |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key | No\*     | -                       |
| `ALLOWED_ORIGINS`                | CORS allowed origins        | No       | `http://localhost:3000` |

\*Either provide `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` OR
`GOOGLE_APPLICATION_CREDENTIALS`

## Security

The API includes several security measures:

- **CORS** protection with configurable origins
- **Helmet** for security headers
- **Rate limiting** (configurable)
- **JWT token verification** for protected routes
- **Input validation** with Zod schemas
- **Error sanitization** to prevent information leakage

## Contributing

Please follow the project's code quality standards:

1. **TypeScript strict mode** - No `any` types allowed
2. **Real data testing** - Tests must use actual services, no mocking
3. **Error handling** - Comprehensive error boundaries and validation
4. **Code formatting** - Use project ESLint and Prettier configuration
5. **Test coverage** - Maintain 80%+ coverage with meaningful tests

Before contributing:

```bash
# Type check
pnpm type-check

# Lint code
pnpm lint

# Run tests
pnpm test

# Build for production
pnpm build
```

## License

This project is part of the METU template and follows the same license.
