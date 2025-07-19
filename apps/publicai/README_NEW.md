# PublicAI - Civic AI & Transparency Tools

![PublicAI Logo](./public/favicon.ico)

**PublicAI** is a revolutionary civic AI and transparency platform that democratizes artificial intelligence for public service, government transparency, and citizen engagement. Part of the CODAI ecosystem, PublicAI provides open, accessible AI tools designed to enhance civic participation, promote government accountability, and bridge the digital divide in public services.

## 🏛️ Key Features

### 🔓 Open AI Services
- **Public API Access**: Free and open AI endpoints for community use
- **Multiple AI Models**: Support for GPT, Claude, Gemini, and other leading AI models
- **Rate Limiting**: Fair usage policies ensuring equitable access
- **No-Barrier Access**: Free tier for citizens and civic organizations

### 🏛️ Government Transparency
- **Document Analysis**: AI-powered analysis of government documents and policies
- **Budget Transparency**: Automated budget analysis and visualization
- **Meeting Transcription**: Real-time transcription and summarization of public meetings
- **FOIA Assistance**: AI-powered Freedom of Information Act request generation

### 👥 Citizen Engagement
- **Civic Chatbot**: AI assistant for government services and information
- **Policy Translator**: Simplify complex policies into plain language
- **Voter Information**: AI-powered candidate and ballot information
- **Community Forums**: AI-moderated discussion platforms

### 📊 Data Democracy
- **Open Data Portal**: Centralized access to government datasets
- **Data Visualization**: AI-generated charts and insights from public data
- **Trend Analysis**: Identify patterns in civic and government data
- **Predictive Analytics**: Forecast civic needs and resource allocation

### 🔒 Privacy & Security
- **Privacy-First Design**: No personal data retention for public services
- **Transparent Algorithms**: Open-source AI models where possible
- **Audit Trails**: Complete logging of AI decisions and recommendations
- **Bias Detection**: Active monitoring for algorithmic bias

### 🌐 Accessibility
- **Multi-Language Support**: AI translation for diverse communities
- **Screen Reader Compatible**: Full accessibility compliance
- **Mobile-First Design**: Optimized for all devices
- **Offline Capabilities**: Core features work without internet

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm package manager
- PostgreSQL database (optional, uses SQLite in development)

### Installation

1. **Clone and Install**
   ```bash
   cd apps/publicai
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Environment Variables**
   ```env
   # Application
   NEXTAUTH_URL=http://localhost:4010
   NEXTAUTH_SECRET=your-secure-secret-key
   
   # Database
   DATABASE_URL=postgresql://user:password@localhost/publicai
   
   # AI Providers
   OPENAI_API_KEY=your-openai-api-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   
   # Authentication Providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Government APIs
   DATA_GOV_API_KEY=your-data-gov-api-key
   CONGRESS_API_KEY=your-congress-api-key
   ```

4. **Database Setup**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

6. **Access the Application**
   - Web App: http://localhost:4010
   - API Documentation: http://localhost:4010/api/docs
   - Admin Dashboard: http://localhost:4010/admin

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Next.js API Routes + tRPC
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js + OAuth providers
- **AI Integration**: OpenAI, Anthropic, Google AI APIs
- **Real-time**: WebSockets + Server-Sent Events
- **Testing**: Vitest + React Testing Library + Playwright

### System Architecture

```mermaid
graph TB
    A[Citizen/User] --> B[PublicAI Web App]
    B --> C[API Gateway]
    C --> D[AI Services]
    C --> E[Government APIs]
    C --> F[Database]
    
    D --> G[OpenAI GPT]
    D --> H[Anthropic Claude]
    D --> I[Google Gemini]
    
    E --> J[Data.gov]
    E --> K[Congress API]
    E --> L[Local Gov APIs]
    
    F --> M[PostgreSQL]
    F --> N[Vector Store]
    F --> O[Analytics DB]
```

### Core Components

#### AI Service Layer
```typescript
// AI service with multiple providers
export class AIService {
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const provider = this.selectProvider(request.type);
    return await provider.complete(request);
  }
  
  async analyzeDocument(document: Document): Promise<Analysis> {
    // Document analysis with transparency focus
  }
  
  async translatePolicy(policy: Policy): Promise<SimplifiedPolicy> {
    // Policy simplification for citizens
  }
}
```

#### Government Data Integration
```typescript
// Government API integration
export class GovDataService {
  async fetchBudgetData(jurisdiction: string): Promise<BudgetData> {
    const data = await this.dataGovAPI.getBudget(jurisdiction);
    return this.aiService.analyzeBudget(data);
  }
  
  async processPublicRecords(records: Record[]): Promise<ProcessedRecords> {
    // AI-powered record processing and analysis
  }
}
```

### API Structure

#### Public AI Endpoints
- `POST /api/ai/complete` - AI completion requests
- `POST /api/ai/analyze-document` - Document analysis
- `POST /api/ai/translate-policy` - Policy translation
- `GET /api/ai/models` - Available AI models

#### Government Data Endpoints
- `GET /api/gov/budget/:jurisdiction` - Budget data and analysis
- `GET /api/gov/meetings` - Public meeting transcripts
- `POST /api/gov/foia` - FOIA request generation
- `GET /api/gov/candidates/:district` - Election information

#### Civic Engagement Endpoints
- `POST /api/civic/chat` - Civic assistance chatbot
- `GET /api/civic/services` - Government services directory
- `POST /api/civic/feedback` - Citizen feedback submission
- `GET /api/civic/forums` - Community discussion forums

## 🛠️ Development

### Project Structure
```
apps/publicai/
├── app/                    # Next.js 13+ app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Admin dashboard
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── civic/             # Civic-specific components
│   ├── gov/               # Government data components
│   └── ai/                # AI interface components
├── lib/                   # Utility libraries
│   ├── ai/                # AI service providers
│   ├── gov/               # Government API integrations
│   ├── auth/              # Authentication logic
│   └── utils/             # Helper functions
├── types/                 # TypeScript definitions
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── tests/                 # Test files
```

### Running Tests
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Key Development Commands
```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed development data

# Code Quality
pnpm lint             # ESLint checking
pnpm type-check       # TypeScript validation
pnpm format           # Prettier formatting
```

## 🔗 Integration

### With CODAI Ecosystem
```typescript
// Integration with other CODAI services
import { CodaiClient } from '@codai/sdk';
import { MemoraiClient } from '@memorai/sdk';

export class PublicAIIntegration {
  async enhanceWithCodai(request: PublicRequest) {
    // Leverage CODAI's coding capabilities for technical policy analysis
    const technicalAnalysis = await this.codaiClient.analyzeCode(request.policy);
    
    // Store insights in Memorai for future reference
    await this.memoraiClient.store({
      type: 'civic_analysis',
      content: technicalAnalysis,
      metadata: { jurisdiction: request.jurisdiction }
    });
    
    return technicalAnalysis;
  }
}
```

### Government API Integration
```typescript
// Example: Budget transparency integration
export class BudgetTransparencyService {
  async analyzeBudget(jurisdiction: string) {
    const budgetData = await this.fetchBudgetData(jurisdiction);
    const aiAnalysis = await this.aiService.analyzeBudget(budgetData);
    
    return {
      summary: aiAnalysis.summary,
      insights: aiAnalysis.insights,
      recommendations: aiAnalysis.recommendations,
      visualizations: this.generateCharts(budgetData)
    };
  }
}
```

### Third-Party Services
- **Data.gov**: Federal government data access
- **Congress API**: Legislative information
- **Local Government APIs**: Municipal data integration
- **Voting Information APIs**: Election and candidate data
- **Public Records APIs**: FOIA and transparency data

## 🗺️ Roadmap

### Phase 1: Foundation (Current)
- ✅ Core AI services infrastructure
- ✅ Basic government data integration
- ✅ Public API with rate limiting
- ✅ Civic chatbot functionality
- 🔄 Multi-language support

### Phase 2: Enhanced Transparency (Q2 2024)
- 📋 Advanced document analysis
- 📋 Real-time meeting transcription
- 📋 Budget visualization tools
- 📋 FOIA request automation
- 📋 Policy impact prediction

### Phase 3: Citizen Engagement (Q3 2024)
- 📋 Community forum platform
- 📋 Voter education tools
- 📋 Petition management system
- 📋 Civic event coordination
- 📋 Government service directory

### Phase 4: Advanced Analytics (Q4 2024)
- 📋 Predictive civic analytics
- 📋 Resource allocation optimization
- 📋 Sentiment analysis on civic issues
- 📋 Performance dashboards for officials
- 📋 AI-powered policy recommendations

### Phase 5: Platform Expansion (2025)
- 📋 Mobile applications
- 📋 Voice interfaces for accessibility
- 📋 Blockchain voting integration
- 📋 Smart city IoT integration
- 📋 International expansion

## 🤝 Contributing

PublicAI is committed to open civic technology. We welcome contributions from:

### How to Contribute
1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/civic-enhancement
   ```
3. **Make Changes** with focus on:
   - Government transparency
   - Citizen accessibility
   - AI fairness and bias reduction
   - Privacy protection
4. **Test Thoroughly**
   ```bash
   pnpm test
   pnpm test:e2e
   ```
5. **Submit Pull Request**

### Contribution Areas
- 🏛️ **Government Integrations**: New API connections
- 🤖 **AI Models**: Bias detection and fairness improvements
- 🌐 **Accessibility**: Screen reader and mobile enhancements
- 🔒 **Security**: Privacy and data protection features
- 📊 **Analytics**: Civic data visualization
- 🌍 **Internationalization**: Multi-language support

### Code Standards
- Follow accessibility guidelines (WCAG 2.1 AA)
- Implement privacy-by-design principles
- Ensure algorithmic transparency
- Include comprehensive tests
- Document public-facing APIs

## 📞 Support

### Community Resources
- **Documentation**: https://docs.codai.dev/publicai
- **Community Forum**: https://community.codai.dev/publicai
- **Discord**: #publicai channel
- **GitHub Issues**: Bug reports and feature requests

### Civic Support
- **Citizen Helpdesk**: support@publicai.dev
- **Government Partnerships**: gov-relations@publicai.dev
- **Accessibility Support**: accessibility@publicai.dev
- **Privacy Concerns**: privacy@publicai.dev

### Technical Support
- **API Documentation**: https://api.publicai.dev/docs
- **Developer Guide**: https://developers.publicai.dev
- **Status Page**: https://status.publicai.dev
- **Security Reports**: security@publicai.dev

## 📄 License

PublicAI is part of the CODAI ecosystem and is licensed under the MIT License. This ensures maximum accessibility and adoption for civic technology initiatives.

```
MIT License - Open for civic good
Copyright (c) 2024 CODAI Ecosystem
```

For detailed license information, see the [LICENSE](../LICENSE) file in the repository root.

---

**🏛️ Built for Citizens, by Citizens - Democratizing AI for Public Good 🤖**

*PublicAI: Where Artificial Intelligence meets Civic Intelligence*
