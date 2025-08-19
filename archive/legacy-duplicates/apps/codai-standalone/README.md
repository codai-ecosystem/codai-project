# CODAI Standalone Application

Modern Next.js 15+ standalone application implementing the CODAI platform with latest best practices.

## Features

- ✨ **Next.js 15.1.8** with App Router
- ⚡ **React 19.1.0** with Server Components
- 🎯 **TypeScript 5.8.3** for type safety
- 🛡️ **Built-in Security** headers and middleware
- 🚀 **Standalone Output** for optimized deployments
- 📊 **Comprehensive APIs** for projects, agents, and collaboration
- 🔄 **Modern Architecture** following Microsoft Azure best practices

## API Endpoints

### Health Check

- `GET /api/health` - System health and status information

### Projects Management

- `GET /api/projects` - List all projects with filtering and pagination
- `POST /api/projects` - Create new project

### AI Agents

- `GET /api/agents` - List AI agents with capabilities and status
- `POST /api/agents` - Register new AI agent

### Collaboration

- `GET /api/collaboration` - List collaboration sessions
- `POST /api/collaboration` - Create new collaboration session

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

This application is configured with `output: 'standalone'` for optimal deployment to:

- **Vercel** (recommended for frontend)
- **Azure Static Web Apps**
- **AWS Lambda**
- **Docker containers**
- **Any Node.js hosting**

## Environment Variables

Create a `.env.local` file for local development:

```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Architecture

- **App Router**: Modern file-based routing with React Server Components
- **Middleware**: Security headers, CORS, and request handling
- **API Routes**: RESTful APIs with proper error handling
- **TypeScript**: Full type safety across the application
- **Standalone Build**: Optimized for deployment without external dependencies

## Security

- Content Security Policy headers
- CORS configuration for API routes
- Frame options and content type protection
- Secure referrer policy
- Static asset caching optimization

Built with modern Next.js patterns and Microsoft Azure deployment best practices.
