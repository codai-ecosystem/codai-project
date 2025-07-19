# CurtAI - AI-Powered Soulmate Discovery Platform 💕

**Next Generation AI-Powered Soulmate Discovery and Relationship Intelligence Platform**

CurtAI revolutionizes the dating and relationship landscape by leveraging advanced AI algorithms to create meaningful, lasting connections. Our platform goes beyond traditional matching to understand deep compatibility, emotional intelligence, and relationship potential through sophisticated psychological profiling and behavioral analysis.

## 🚀 Key Features

### Advanced AI Matching Intelligence
- **Deep Compatibility Analysis**: Multi-dimensional personality and compatibility assessment
- **Emotional Intelligence Matching**: AI-powered emotional compatibility scoring
- **Behavioral Pattern Recognition**: Analysis of communication styles and relationship patterns
- **Predictive Relationship Success**: AI models that predict long-term relationship potential
- **Dynamic Profile Learning**: Continuous learning and refinement of user preferences

### Psychological Profiling & Assessment
- **Personality Analysis**: Comprehensive psychological profiling using validated models
- **Values Alignment**: Deep assessment of core values and life goals compatibility
- **Communication Style Mapping**: Analysis of preferred communication patterns
- **Attachment Style Recognition**: Understanding of attachment patterns and compatibility
- **Relationship Readiness Assessment**: Evaluation of emotional readiness for commitment

### Intelligent Conversation Features
- **AI Conversation Starters**: Personalized, context-aware conversation suggestions
- **Compatibility Insights**: Real-time analysis of conversation compatibility
- **Emotional Tone Analysis**: Understanding of emotional undertones in communication
- **Conversation Flow Optimization**: AI-guided conversation enhancement
- **Video Call Intelligence**: AI analysis of non-verbal communication cues

### Safety & Trust Features
- **Identity Verification**: Multi-layer identity authentication and verification
- **Behavioral Safety Monitoring**: AI-powered detection of inappropriate behavior
- **Privacy Protection**: Advanced privacy controls and data protection
- **Report & Block System**: Comprehensive safety reporting and moderation
- **Background Check Integration**: Optional enhanced safety verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Modern browser with WebRTC support
- Camera/microphone for video features

### Installation
```bash
# Clone and navigate to CurtAI
cd apps/curtai

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Development URLs
- **Dating App**: http://localhost:3000
- **Profile Builder**: http://localhost:3000/profile
- **Matching Dashboard**: http://localhost:3000/matches
- **Admin Panel**: http://localhost:3000/admin

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 + React 19
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Redis (matching cache)
- **AI/ML**: TensorFlow, PyTorch, OpenAI GPT
- **Real-time**: Socket.io for live messaging
- **Media**: WebRTC for video calls
- **Testing**: Vitest + Playwright
- **Internationalization**: i18next for multi-language support

### Core Components
```
curtai/
├── app/                    # Next.js app directory
├── components/            # UI components and matching widgets
├── lib/                  # Utility libraries and AI helpers
├── api/                  # Backend API routes
├── services/             # Matching and AI services
├── hooks/                # Custom React hooks
├── stores/               # Zustand state management
├── types/                # TypeScript definitions
├── locales/              # i18n translation files
├── config/               # Configuration files
└── tests/                # Test suites
```

### AI Matching Pipeline
1. **Profile Analysis**: Deep learning analysis of user profiles and preferences
2. **Compatibility Scoring**: Multi-dimensional compatibility calculation
3. **Behavioral Learning**: Continuous learning from user interactions
4. **Match Ranking**: AI-powered ranking of potential matches
5. **Relationship Prediction**: Long-term compatibility forecasting

## 🔧 Development

### Environment Setup
```bash
# Development environment
cp .env.example .env.local

# Required environment variables
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://user:password@localhost:5432/curtai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key
SOCKET_IO_SECRET=your_socket_secret
IDENTITY_VERIFICATION_API=your_verification_api
MEDIA_STORAGE_URL=your_media_storage
```

### Development Commands
```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Build production
pnpm build
```

### Testing Strategy
```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# AI model tests
pnpm test:ai

# E2E tests with Playwright
pnpm test:e2e
```

## 🔗 Integration

### AI Matching API
```typescript
// CurtAI matching SDK
import { CurtAIClient } from '@codai/curtai';

const client = new CurtAIClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.curtai.ro'
});

// Get AI-powered matches
const matches = await client.getMatches({
  userId: 'user123',
  limit: 10,
  includeCompatibilityScore: true,
  includeReasons: true
});
```

### Real-time Communication
```typescript
// Socket.io integration for real-time messaging
import { io } from 'socket.io-client';

const socket = io('https://api.curtai.ro', {
  auth: {
    token: userAuthToken
  }
});

// Handle real-time match notifications
socket.on('new_match', (match) => {
  displayMatchNotification(match);
});

// Handle real-time messages
socket.on('new_message', (message) => {
  updateConversation(message);
});
```

### Video Call Integration
```typescript
// WebRTC video call setup
const videoCallConfig = {
  iceServers: [
    { urls: 'stun:stun.curtai.ro:3478' },
    { 
      urls: 'turn:turn.curtai.ro:3478',
      username: 'curtai',
      credential: 'secure_credential'
    }
  ]
};

// Initialize video call
const peerConnection = new RTCPeerConnection(videoCallConfig);
```

## 🛣️ Roadmap

### Phase 1: Core Platform (Q1 2025)
- ✅ User registration and profile creation
- ✅ Basic AI matching algorithm
- ✅ Real-time messaging system
- ⏳ Video call functionality
- ⏳ Mobile app development

### Phase 2: Advanced AI (Q2 2025)
- 🔄 Deep compatibility analysis
- 🔄 Emotional intelligence matching
- 🔄 Behavioral pattern recognition
- ⏳ Predictive relationship modeling
- ⏳ Advanced conversation AI

### Phase 3: Safety & Trust (Q3 2025)
- ⏳ Enhanced identity verification
- ⏳ AI-powered safety monitoring
- ⏳ Background check integration
- ⏳ Community moderation tools
- ⏳ Privacy enhancement features

### Phase 4: Relationship Intelligence (Q4 2025)
- ⏳ Relationship coaching AI
- ⏳ Compatibility insights dashboard
- ⏳ Long-term relationship tracking
- ⏳ Success prediction analytics
- ⏳ Personalized dating advice

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../docs/CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `pnpm install`
4. Make your changes
5. Run tests: `pnpm test`
6. Submit a pull request

## 📞 Support

- **Documentation**: [docs.curtai.ro](https://docs.curtai.ro)
- **API Reference**: [api.curtai.ro](https://api.curtai.ro)
- **Community**: [Discord](https://discord.gg/codai-ecosystem)
- **Email Support**: support@curtai.ro
- **Safety Team**: safety@curtai.ro

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**CurtAI** - Revolutionizing relationships through AI-powered soulmate discovery.

*Part of the [CODAI Ecosystem](https://codai.ro) - Building the future of AI-native applications.*
