# 📚 ROMAI API Documentation

Complete API reference for the ROMAI Central Intelligence System.

## Base URL

```
Production: https://api.romai.ro
Development: http://localhost:8000
```

## Authentication

ROMAI uses JWT (JSON Web Token) authentication for API access.

### Login Endpoint

```http
POST /auth/login
Content-Type: application/json

{
  "username": "romai",
  "password": "romai2025"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### Using the Token

Include the JWT token in the Authorization header for all authenticated requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Core Endpoints

### 1. Health Check

Check system health and status.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-07T10:00:00.000Z",
  "details": {
    "azureOpenAI": "connected",
    "memory": "available",
    "uptime": "2h 30m"
  }
}
```

### 2. Intelligence Processing

Process general intelligence requests.

```http
POST /intelligence
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "query": "Care sunt principalele avantaje ale inteligenței artificiale?",
  "language": "ro",
  "domain": "technology",
  "context": "Educational discussion about AI benefits"
}
```

**Request Schema:**
- `query` (string, required): The question or request (1-10000 characters)
- `language` (string, optional): Language code ("ro" or "en", default: "ro")
- `domain` (string, optional): Domain context for specialized responses
- `context` (string, optional): Additional context for the request

**Response:**
```json
{
  "response": "Inteligența artificială oferă multe avantaje...",
  "confidence": 0.95,
  "sources": ["knowledge_base", "azure_openai"],
  "relatedTopics": ["machine learning", "automation", "efficiency"],
  "suggestions": ["Vrei să afli despre riscurile AI?", "Interesează-te aplicațiile practice?"]
}
```

### 3. Romanian Expert

Get specialized Romanian cultural and contextual expertise.

```http
POST /romanian-expert
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "query": "Explică-mi tradițiile de Crăciun din România",
  "category": "culture"
}
```

**Request Schema:**
- `query` (string, required): Question about Romanian culture/context
- `category` (string, optional): Category like "culture", "history", "language", "food", "traditions"

**Response:**
```json
{
  "response": "Tradițiile de Crăciun din România sunt bogate și diverse...",
  "confidence": 0.98,
  "sources": ["romanian_cultural_database", "historical_records"],
  "relatedTopics": ["Moș Nicolae", "Colinde", "Steaua"],
  "suggestions": ["Vrei să afli despre mâncărurile tradiționale?"]
}
```

### 4. Chat Interface

Direct conversation with the AI system.

```http
POST /chat
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Salut! Cum te cheamă?"
    }
  ],
  "model": "gpt-4o",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Request Schema:**
- `messages` (array, required): Conversation history
  - `role` (string): "system", "user", or "assistant"
  - `content` (string): Message content
- `model` (string, optional): AI model to use
- `temperature` (number, optional): Creativity level (0-2)
- `maxTokens` (number, optional): Maximum response length (1-4000)

**Response:**
```json
{
  "message": {
    "id": "msg-123",
    "role": "assistant",
    "content": "Salut! Eu sunt ROMAI, sistemul central de inteligență artificială românesc. Cum te pot ajuta astăzi?",
    "timestamp": "2025-07-07T10:00:00.000Z"
  },
  "usage": {
    "promptTokens": 15,
    "completionTokens": 35,
    "totalTokens": 50
  }
}
```

## API Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Endpoint not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Error Response Format

```json
{
  "error": "Invalid request format",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "query",
      "message": "String must contain at least 1 character(s)"
    }
  ],
  "timestamp": "2025-07-07T10:00:00.000Z"
}
```

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Default Limit**: 100 requests per 15 minutes per IP
- **Authenticated Users**: 200 requests per 15 minutes per token
- **Premium Plans**: Higher limits available

Rate limit headers included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

class RomaiClient {
  private token: string;
  private baseURL = 'http://localhost:8000';

  async login(username: string, password: string) {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      username,
      password
    });
    this.token = response.data.token;
    return this.token;
  }

  async askIntelligence(query: string, language = 'ro') {
    const response = await axios.post(`${this.baseURL}/intelligence`, {
      query,
      language
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  async romanianExpert(query: string, category?: string) {
    const response = await axios.post(`${this.baseURL}/romanian-expert`, {
      query,
      category
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }
}

// Usage
const client = new RomaiClient();
await client.login('romai', 'romai2025');

const response = await client.askIntelligence(
  'Care sunt cele mai importante orașe din România?'
);
console.log(response.response);
```

### Python

```python
import requests
import json

class RomaiClient:
    def __init__(self, base_url='http://localhost:8000'):
        self.base_url = base_url
        self.token = None
    
    def login(self, username, password):
        response = requests.post(f'{self.base_url}/auth/login', json={
            'username': username,
            'password': password
        })
        response.raise_for_status()
        self.token = response.json()['token']
        return self.token
    
    def _headers(self):
        return {'Authorization': f'Bearer {self.token}'}
    
    def ask_intelligence(self, query, language='ro'):
        response = requests.post(f'{self.base_url}/intelligence', 
            json={'query': query, 'language': language},
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()
    
    def romanian_expert(self, query, category=None):
        data = {'query': query}
        if category:
            data['category'] = category
            
        response = requests.post(f'{self.base_url}/romanian-expert',
            json=data,
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()

# Usage
client = RomaiClient()
client.login('romai', 'romai2025')

response = client.ask_intelligence('Ce este inteligența artificială?')
print(response['response'])
```

### cURL Examples

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"romai","password":"romai2025"}' | \
  jq -r '.token')

# Intelligence request
curl -X POST http://localhost:8000/intelligence \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explică-mi cum funcționează mașinile de învățat",
    "language": "ro",
    "domain": "technology"
  }'

# Romanian expert
curl -X POST http://localhost:8000/romanian-expert \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Ce mâncăruri tradiționale românești sunt specifice sărbătorilor?",
    "category": "food"
  }'

# Chat
curl -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Poți să-mi recomanzi cărți românești clasice?"}
    ]
  }'
```

## Webhooks (Coming Soon)

ROMAI will support webhooks for real-time notifications:

```http
POST /webhooks
Authorization: Bearer YOUR_JWT_TOKEN

{
  "url": "https://your-app.com/romai-webhook",
  "events": ["intelligence.completed", "expert.response"],
  "secret": "your-webhook-secret"
}
```

## OpenAPI Specification

Complete OpenAPI 3.0 specification available at:
- Interactive docs: `http://localhost:8000/docs`
- JSON spec: `http://localhost:8000/docs/json`

## Support

- **API Issues**: Create an issue on GitHub
- **Documentation**: Check `/docs` endpoint
- **Email Support**: api-support@codai.ro
- **Status Page**: status.romai.ro (coming soon)

## Changelog

### v0.1.0 (Current)
- Initial API release
- Authentication system
- Intelligence processing
- Romanian expert system
- Chat interface
- Health monitoring

### Upcoming Features
- Webhook support
- Batch processing
- Advanced analytics
- Multi-language support expansion
- Custom model training
