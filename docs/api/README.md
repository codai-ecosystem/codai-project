# 🌐 Universal REST API Documentation

**Complete REST API reference for all CODAI ecosystem services - standardized, secure, and developer-friendly APIs.**

## 📋 Overview

The CODAI ecosystem provides comprehensive REST APIs for all services:
- **Standardized Design**: Consistent REST patterns across all services
- **OpenAPI Specifications**: Complete API documentation with interactive testing
- **Authentication**: Unified JWT-based authentication across all endpoints
- **Rate Limiting**: Built-in rate limiting and quota management
- **Versioning**: Semantic versioning with backward compatibility
- **Error Handling**: Consistent error responses and status codes

## 🏗️ API Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │────│   API Gateway   │────│  CODAI Service  │
│  (Web/Mobile)   │    │   Port 4000     │    │  (Microservice) │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Authentication  │    │  Load Balancer  │    │   Rate Limiter  │
│ JWT Tokens      │    │  Circuit Breaker│    │   Monitoring    │
│ Request Signing │    │  Retry Logic    │    │   Logging       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Base URLs

### Production Environment
```
https://api.codai.ro         # API Gateway
https://auth.codai.ro        # Authentication (ID Service)
https://memorai.codai.ro     # Database & Storage
https://hub.codai.ro         # Service Discovery
https://logs.codai.ro        # Logging Service
```

### Development Environment
```
http://localhost:4000        # API Gateway
http://localhost:4001        # ID Service
http://localhost:4002        # MEMORAI Service
http://localhost:4003        # HUB Service
http://localhost:4004        # LOGAI Service
```

## 🔐 Authentication

### JWT Token Authentication

All API requests require authentication via JWT tokens:

```http
Authorization: Bearer <jwt_token>
```

### Login to Get Token

```http
POST /auth/login
Content-Type: application/json
Host: auth.codai.ro

{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"]
  }
}
```

### API Key Authentication

For server-to-server communication:

```http
Authorization: ApiKey <api_key>
X-API-Key: <api_key>
```

## 📊 Standard API Patterns

### Request Format

```http
GET /api/v1/resource
POST /api/v1/resource
PUT /api/v1/resource/{id}
PATCH /api/v1/resource/{id}
DELETE /api/v1/resource/{id}

# Headers
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
X-Request-ID: <unique_request_id>
X-API-Version: v1
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Resource Name",
    "createdAt": "2025-07-19T12:00:00Z",
    "updatedAt": "2025-07-19T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-07-19T12:00:00Z",
    "version": "v1",
    "requestId": "req_123456789"
  }
}
```

### Pagination

```http
GET /api/v1/resources?page=2&limit=20&sort=createdAt&order=desc

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    },
    "timestamp": "2025-07-19T12:00:00Z",
    "requestId": "req_123456789"
  }
}
```

## 🔌 Core Service APIs

### Authentication Service (ID)

#### Base URL: `https://auth.codai.ro/api/v1`

#### Authentication Endpoints

```http
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
```

#### User Management

```http
GET    /users                    # List users
POST   /users                    # Create user  
GET    /users/{id}               # Get user
PUT    /users/{id}               # Update user
DELETE /users/{id}               # Delete user
GET    /users/profile            # Get current user profile
PUT    /users/profile            # Update current user profile
```

#### Example: Get Current User Profile

```http
GET /users/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe", 
    "avatar": "https://cdn.codai.ro/avatars/user123.jpg",
    "roles": ["user"],
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "lastLogin": "2025-07-19T12:00:00Z"
  }
}
```

### Database Service (MEMORAI)

#### Base URL: `https://memorai.codai.ro/api/v1`

#### Entity Operations

```http
GET    /entities/{type}          # List entities
POST   /entities/{type}          # Create entity
GET    /entities/{type}/{id}     # Get entity
PUT    /entities/{type}/{id}     # Update entity
DELETE /entities/{type}/{id}     # Delete entity
POST   /entities/search          # Search entities
```

#### Example: Create Entity

```http
POST /entities/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Awesome Project",
  "description": "A revolutionary web application",
  "type": "web-application",
  "status": "active",
  "metadata": {
    "framework": "Next.js",
    "database": "PostgreSQL"
  },
  "tags": ["web", "javascript", "react"]
}

Response:
{
  "success": true,
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "entityType": "projects",
    "name": "My Awesome Project",
    "description": "A revolutionary web application",
    "status": "active",
    "metadata": {
      "framework": "Next.js",
      "database": "PostgreSQL"
    },
    "tags": ["web", "javascript", "react"],
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2025-07-19T12:00:00Z",
    "updatedAt": "2025-07-19T12:00:00Z",
    "version": 1
  }
}
```

#### File Operations

```http
POST   /files/upload             # Upload file
GET    /files/{id}               # Download file
DELETE /files/{id}               # Delete file
GET    /files/{id}/metadata      # Get file metadata
PUT    /files/{id}/metadata      # Update file metadata
```

#### Example: Upload File

```http
POST /files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form data:
# file: <file_binary>
# entityId: "456e7890-e89b-12d3-a456-426614174000"
# entityType: "projects"
# field: "attachments"
# metadata: {"purpose": "documentation"}

Response:
{
  "success": true,
  "data": {
    "id": "789f0123-e89b-12d3-a456-426614174000",
    "filename": "document_789f0123.pdf",
    "originalName": "project-spec.pdf",
    "mimeType": "application/pdf",
    "fileSize": 1048576,
    "url": "https://files.codai.ro/789f0123.pdf",
    "entityId": "456e7890-e89b-12d3-a456-426614174000",
    "createdAt": "2025-07-19T12:00:00Z"
  }
}
```

## 💼 Business Service APIs

### Main Platform (CODAI)

#### Base URL: `https://api.codai.ro/codai/api/v1`

#### Project Management

```http
GET    /projects                 # List projects
POST   /projects                 # Create project
GET    /projects/{id}            # Get project
PUT    /projects/{id}            # Update project
DELETE /projects/{id}            # Delete project
POST   /projects/{id}/deploy     # Deploy project
GET    /projects/{id}/builds     # Get build history
```

#### Code Generation

```http
POST   /ai/generate/component    # Generate component
POST   /ai/generate/api          # Generate API
POST   /ai/generate/page         # Generate page
POST   /ai/optimize/code         # Optimize code
POST   /ai/analyze/security      # Security analysis
```

#### Example: Generate React Component

```http
POST /ai/generate/component
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "react",
  "description": "User profile card with avatar, name, and stats",
  "props": {
    "user": "User",
    "showStats": "boolean",
    "onEdit": "function"
  },
  "style": "tailwind",
  "typescript": true
}

Response:
{
  "success": true,
  "data": {
    "componentName": "UserProfileCard",
    "code": "import React from 'react';\n\ninterface UserProfileCardProps {\n  user: User;\n  showStats?: boolean;\n  onEdit?: () => void;\n}\n\nexport const UserProfileCard: React.FC<UserProfileCardProps> = ({\n  user,\n  showStats = false,\n  onEdit\n}) => {\n  return (\n    <div className=\"bg-white rounded-lg shadow-md p-6\">\n      <div className=\"flex items-center space-x-4\">\n        <img \n          src={user.avatar} \n          alt={user.name}\n          className=\"w-16 h-16 rounded-full\"\n        />\n        <div>\n          <h3 className=\"text-xl font-semibold\">{user.name}</h3>\n          <p className=\"text-gray-600\">{user.email}</p>\n        </div>\n        {onEdit && (\n          <button \n            onClick={onEdit}\n            className=\"ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600\"\n          >\n            Edit\n          </button>\n        )}\n      </div>\n      {showStats && (\n        <div className=\"mt-4 grid grid-cols-3 gap-4\">\n          <div className=\"text-center\">\n            <div className=\"text-2xl font-bold\">{user.projectsCount}</div>\n            <div className=\"text-gray-500\">Projects</div>\n          </div>\n          <div className=\"text-center\">\n            <div className=\"text-2xl font-bold\">{user.followersCount}</div>\n            <div className=\"text-gray-500\">Followers</div>\n          </div>\n          <div className=\"text-center\">\n            <div className=\"text-2xl font-bold\">{user.contributionsCount}</div>\n            <div className=\"text-gray-500\">Contributions</div>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n};",
    "tests": "import { render, screen } from '@testing-library/react';\nimport { UserProfileCard } from './UserProfileCard';\n\nconst mockUser = {\n  id: '1',\n  name: 'John Doe',\n  email: 'john@example.com',\n  avatar: 'https://example.com/avatar.jpg',\n  projectsCount: 5,\n  followersCount: 100,\n  contributionsCount: 250\n};\n\ndescribe('UserProfileCard', () => {\n  it('renders user information', () => {\n    render(<UserProfileCard user={mockUser} />);\n    expect(screen.getByText('John Doe')).toBeInTheDocument();\n    expect(screen.getByText('john@example.com')).toBeInTheDocument();\n  });\n\n  it('shows stats when showStats is true', () => {\n    render(<UserProfileCard user={mockUser} showStats />);\n    expect(screen.getByText('Projects')).toBeInTheDocument();\n    expect(screen.getByText('5')).toBeInTheDocument();\n  });\n});",
    "dependencies": ["react", "@types/react", "tailwindcss"],
    "generatedAt": "2025-07-19T12:00:00Z"
  }
}
```

### Financial Services (BANCAI)

#### Base URL: `https://api.codai.ro/bancai/api/v1`

#### Account Management

```http
GET    /accounts                 # List accounts
POST   /accounts                 # Create account
GET    /accounts/{id}            # Get account
PUT    /accounts/{id}            # Update account
GET    /accounts/{id}/balance    # Get account balance
GET    /accounts/{id}/transactions # Get transactions
```

#### Transaction Processing

```http
POST   /transactions             # Create transaction
GET    /transactions/{id}        # Get transaction
PUT    /transactions/{id}        # Update transaction status
POST   /transactions/transfer    # Transfer funds
POST   /transactions/refund      # Refund transaction
```

#### Example: Create Bank Transfer

```http
POST /transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccountId": "account_123",
  "toAccountId": "account_456", 
  "amount": 250.00,
  "currency": "USD",
  "description": "Payment for services",
  "reference": "INV-2025-001",
  "metadata": {
    "category": "business",
    "invoiceId": "inv_789"
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "txn_987654321",
    "type": "transfer",
    "fromAccountId": "account_123",
    "toAccountId": "account_456",
    "amount": 250.00,
    "currency": "USD",
    "description": "Payment for services",
    "reference": "INV-2025-001",
    "status": "completed",
    "fee": 2.50,
    "exchangeRate": null,
    "processedAt": "2025-07-19T12:00:00Z",
    "metadata": {
      "category": "business",
      "invoiceId": "inv_789"
    }
  }
}
```

### Learning Platform (STUDIAI)

#### Base URL: `https://api.codai.ro/studiai/api/v1`

#### Course Management

```http
GET    /courses                  # List courses
POST   /courses                  # Create course
GET    /courses/{id}             # Get course
PUT    /courses/{id}             # Update course
DELETE /courses/{id}             # Delete course
POST   /courses/{id}/publish     # Publish course
```

#### Student Enrollment

```http
POST   /enrollments              # Enroll student
GET    /enrollments/{id}         # Get enrollment
PUT    /enrollments/{id}/progress # Update progress
DELETE /enrollments/{id}         # Unenroll student
GET    /enrollments/{id}/certificate # Get certificate
```

#### Example: Enroll Student in Course

```http
POST /enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "course_123",
  "studentId": "student_456",
  "enrollmentType": "paid",
  "paymentMethod": "card",
  "paymentToken": "pm_1234567890",
  "metadata": {
    "source": "website",
    "discount": "student10"
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "enrollment_789",
    "courseId": "course_123", 
    "studentId": "student_456",
    "enrollmentType": "paid",
    "status": "active",
    "progress": 0,
    "completedLessons": [],
    "enrolledAt": "2025-07-19T12:00:00Z",
    "expiresAt": "2026-07-19T12:00:00Z",
    "certificateEligible": false,
    "paymentStatus": "completed",
    "amount": 99.00,
    "currency": "USD"
  }
}
```

## 🔄 Real-Time APIs

### WebSocket Connections

```javascript
// Connect to WebSocket for real-time updates
const ws = new WebSocket('wss://api.codai.ro/ws');

// Authentication
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_jwt_token'
  }));
};

// Subscribe to updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'projects',
  filter: { userId: 'your_user_id' }
}));

// Handle real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

### Server-Sent Events (SSE)

```javascript
// Connect to SSE endpoint
const eventSource = new EventSource('https://api.codai.ro/events?token=jwt_token');

// Listen for project updates
eventSource.addEventListener('project:updated', (event) => {
  const project = JSON.parse(event.data);
  console.log('Project updated:', project);
});

// Listen for deployment status
eventSource.addEventListener('deployment:status', (event) => {
  const status = JSON.parse(event.data);
  console.log('Deployment status:', status);
});
```

## ⚡ Advanced Features

### Batch Operations

```http
POST /api/v1/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "operations": [
    {
      "method": "POST",
      "path": "/projects",
      "body": { "name": "Project 1" }
    },
    {
      "method": "PUT", 
      "path": "/projects/123",
      "body": { "status": "archived" }
    },
    {
      "method": "DELETE",
      "path": "/projects/456"
    }
  ]
}

Response:
{
  "success": true,
  "results": [
    {
      "success": true,
      "data": { "id": "789", "name": "Project 1" }
    },
    {
      "success": true,
      "data": { "id": "123", "status": "archived" }
    },
    {
      "success": false,
      "error": { "code": "NOT_FOUND", "message": "Project not found" }
    }
  ]
}
```

### GraphQL API

```graphql
# GraphQL endpoint available at /graphql

query GetProjectsWithStats {
  projects(limit: 10, status: "active") {
    id
    name
    status
    createdAt
    stats {
      buildCount
      deploymentCount
      lastDeployment {
        id
        status
        deployedAt
      }
    }
    owner {
      id
      name
      email
    }
  }
}
```

### API Webhooks

```http
POST /api/v1/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["project.created", "project.deployed"],
  "secret": "webhook_secret_key",
  "active": true
}

# Webhook payload example:
{
  "event": "project.deployed",
  "timestamp": "2025-07-19T12:00:00Z",
  "data": {
    "projectId": "123",
    "deploymentId": "456",
    "environment": "production",
    "status": "success"
  },
  "signature": "sha256=signature_hash"
}
```

## 🔒 Security & Rate Limiting

### Rate Limits

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Authentication | 5 requests | 1 minute |
| CRUD Operations | 100 requests | 1 minute |
| Search/Query | 50 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| AI Generation | 20 requests | 1 hour |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642694400
X-RateLimit-Window: 60
```

### Security Headers

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## 📊 Monitoring & Analytics

### Health Check Endpoints

```http
GET /health
Response:
{
  "status": "healthy",
  "timestamp": "2025-07-19T12:00:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy", 
    "storage": "healthy"
  },
  "version": "v1.0.0"
}
```

### Metrics Endpoints

```http
GET /metrics
Authorization: Bearer <token>

Response:
{
  "requests": {
    "total": 50000,
    "success": 48500,
    "errors": 1500,
    "averageResponseTime": 150
  },
  "users": {
    "active": 1250,
    "total": 5000
  },
  "resources": {
    "projects": 2500,
    "deployments": 8000
  }
}
```

## 🧪 Testing APIs

### Using cURL

```bash
# Authentication
curl -X POST https://auth.codai.ro/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Create project with token
curl -X POST https://api.codai.ro/codai/api/v1/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test Project","type":"web-application"}'
```

### Using Postman

Import the OpenAPI specification:
```
https://api.codai.ro/openapi.json
```

### API Testing Tools

```javascript
// Jest API tests
describe('CODAI API', () => {
  let authToken;

  beforeAll(async () => {
    const response = await fetch('https://auth.codai.ro/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    const data = await response.json();
    authToken = data.token;
  });

  test('should create project', async () => {
    const response = await fetch('https://api.codai.ro/codai/api/v1/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Project',
        type: 'web-application'
      })
    });

    expect(response.status).toBe(201);
    const project = await response.json();
    expect(project.data.name).toBe('Test Project');
  });
});
```

## 📝 OpenAPI Specifications

### Interactive Documentation

Access interactive API documentation:
```
https://api.codai.ro/docs          # Main API Gateway docs
https://auth.codai.ro/docs         # Authentication API docs
https://memorai.codai.ro/docs      # Database API docs
```

### OpenAPI Spec Downloads

```bash
# Download OpenAPI specs
curl https://api.codai.ro/openapi.json > codai-api.json
curl https://auth.codai.ro/openapi.json > auth-api.json
curl https://memorai.codai.ro/openapi.json > memorai-api.json
```

### Code Generation

```bash
# Generate client SDKs from OpenAPI specs
npx @openapitools/openapi-generator-cli generate \
  -i https://api.codai.ro/openapi.json \
  -g typescript-fetch \
  -o ./generated/codai-client
```

## 🐛 Error Handling

### Standard Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "Invalid email format",
      "value": "invalid-email"
    },
    "timestamp": "2025-07-19T12:00:00Z",
    "requestId": "req_123456789",
    "documentation": "https://docs.codai.ro/errors#validation-error"
  }
}
```

## 🔧 SDK Integration

### JavaScript/TypeScript

```javascript
import { CodeaiAPI } from '@codai/api';

const api = new CodeaiAPI({
  baseURL: 'https://api.codai.ro',
  apiKey: 'your-api-key'
});

const project = await api.projects.create({
  name: 'My Project',
  type: 'web-application'
});
```

### Python

```python
from codai_api import CodeaiAPI

api = CodeaiAPI(
    base_url='https://api.codai.ro',
    api_key='your-api-key'
)

project = api.projects.create({
    'name': 'My Project',
    'type': 'web-application'
})
```

### Go

```go
package main

import (
    "github.com/codai-ecosystem/codai-go"
)

func main() {
    client := codai.NewClient("https://api.codai.ro", "your-api-key")
    
    project, err := client.Projects.Create(&codai.Project{
        Name: "My Project",
        Type: "web-application",
    })
}
```

---

**Last Updated**: July 19, 2025  
**API Version**: 2.0.0  
**Status**: Production Ready ✅
