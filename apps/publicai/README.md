# PublicAI - Public AI Services

PublicAI provides open and accessible AI services for the Codai ecosystem.

## Features

- **Public API Access**: Open AI endpoints for community use
- **Multiple AI Models**: Support for various AI models and providers
- **Rate Limiting**: Fair usage policies for public access
- **Documentation**: Comprehensive API documentation
- **Examples**: Code samples and usage examples

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth authentication
- `POST /api/auth/register` - User registration

### AI Services
- `POST /api/ai` - AI completion requests
- `GET /api/ai` - Available models and capabilities

### User Management
- `GET /api/user` - Get current user
- `PUT /api/user` - Update user profile
- `DELETE /api/user` - Delete user account

### Workspace
- `GET /api/workspace` - List user workspaces
- `POST /api/workspace` - Create new workspace

## Environment Variables

```env
NEXTAUTH_URL=http://localhost:4010
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DATABASE_URL=your-database-url
OPENAI_API_KEY=your-openai-api-key
```

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Initialize database:
   ```bash
   pnpm db:push
   ```

4. Start development server:
   ```bash
   pnpm dev
   ```

## Usage Examples

### AI Completion Request

```javascript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    message: "Hello, AI!",
    model: "gpt-3.5-turbo",
    maxTokens: 150
  })
});

const data = await response.json();
console.log(data.response);
```

### User Registration

```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    password: "securepassword123"
  })
});

const data = await response.json();
console.log(data.user);
```

## Contributing

PublicAI is part of the Codai ecosystem. Please see the main project documentation for contribution guidelines.

## License

Part of the Codai ecosystem. See LICENSE file for details.
