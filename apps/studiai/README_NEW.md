# StudiAI - AI Education Platform

![StudiAI Logo](./public/favicon.ico)

**StudiAI** is an innovative AI-powered educational platform that revolutionizes online learning through personalized artificial intelligence, adaptive curriculum, and intelligent tutoring systems. Part of the CODAI ecosystem, StudiAI combines cutting-edge AI technology with pedagogical excellence to deliver personalized, engaging, and effective learning experiences for students of all ages and backgrounds.

## 🎓 Key Features

### 🤖 AI-Powered Learning
- **Personalized AI Tutors**: Individual AI assistants tailored to each student's learning style
- **Adaptive Curriculum**: AI-driven course paths that adjust based on progress and performance
- **Intelligent Assessment**: Real-time evaluation and feedback using advanced AI algorithms
- **Learning Analytics**: Deep insights into learning patterns and knowledge gaps

### 📚 Comprehensive Course Platform
- **Multi-Format Content**: Video lectures, interactive exercises, quizzes, and AI-generated content
- **Course Marketplace**: Browse, purchase, and access premium educational content
- **Progress Tracking**: Detailed analytics on learning progress and achievement milestones
- **Certification System**: AI-verified certificates and digital badges

### 🎯 Personalized Learning Experience
- **Learning Style Detection**: AI analysis of individual learning preferences
- **Difficulty Adaptation**: Real-time adjustment of content complexity
- **Knowledge Gap Analysis**: Identify and address specific learning deficiencies
- **Motivation Tracking**: AI-powered engagement and motivation enhancement

### 💬 Interactive Learning Features
- **AI Teaching Assistant**: 24/7 intelligent support for questions and explanations
- **Peer Collaboration**: AI-facilitated study groups and collaborative projects
- **Real-time Feedback**: Instant AI-powered corrections and suggestions
- **Voice Interaction**: Speech-enabled learning for accessibility and convenience

### 📊 Advanced Analytics
- **Learning Insights**: Comprehensive dashboards for students, teachers, and administrators
- **Performance Prediction**: AI forecasting of learning outcomes and success probability
- **Engagement Metrics**: Detailed tracking of interaction and participation
- **Comparative Analysis**: Benchmarking against peer groups and standards

### 🔒 Privacy & Security
- **Educational Data Protection**: COPPA and FERPA compliant data handling
- **Safe AI Interactions**: Monitored and filtered AI responses for appropriate content
- **Parental Controls**: Comprehensive oversight tools for younger learners
- **Secure Authentication**: Multi-factor authentication and secure session management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm package manager
- Firebase account (for authentication and storage)
- Azure account (for Speech Service)
- Stripe account (for payments)

### Installation

1. **Clone and Install**
   ```bash
   cd apps/studiai
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Environment Variables**
   ```env
   # Application
   NEXTAUTH_URL=http://localhost:5001
   NEXTAUTH_SECRET=your-secure-secret-key
   
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # Azure Speech Service
   NEXT_PUBLIC_AZURE_SPEECH_API_KEY=your_azure_speech_key
   NEXT_PUBLIC_AZURE_SPEECH_API_REGION=your_azure_region
   
   # AI Services
   OPENAI_API_KEY=your-openai-api-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   
   # Payment Processing
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   
   # Database
   DATABASE_URL=postgresql://user:password@localhost/studiai
   ```

4. **Firebase Setup**
   ```bash
   # Install Firebase tools
   npm install -g firebase-tools
   
   # Login and initialize
   firebase login
   firebase init
   
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   ```

5. **Database Setup**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

6. **Start Development Server**
   ```bash
   pnpm dev
   ```

7. **Access the Application**
   - Student Portal: http://localhost:5001
   - Teacher Dashboard: http://localhost:5001/teacher
   - Admin Panel: http://localhost:5001/admin
   - API Documentation: http://localhost:5001/api/docs

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + HeroUI + Framer Motion
- **Backend**: Next.js API Routes + tRPC
- **Database**: PostgreSQL + Prisma ORM + Firebase Firestore
- **Authentication**: NextAuth.js + Firebase Auth
- **AI Integration**: OpenAI GPT, Anthropic Claude APIs
- **Speech Services**: Azure Speech Service
- **Payment Processing**: Stripe + Firebase Extensions
- **Real-time**: Firebase Real-time Database + WebSockets
- **Testing**: Vitest + React Testing Library + Playwright

### System Architecture

```mermaid
graph TB
    A[Student] --> B[StudiAI Web App]
    B --> C[AI Learning Engine]
    B --> D[Course Management]
    B --> E[Assessment System]
    
    C --> F[Personalization AI]
    C --> G[Tutoring AI]
    C --> H[Content Generation AI]
    
    D --> I[Firebase Storage]
    D --> J[Course Database]
    D --> K[Progress Tracking]
    
    E --> L[AI Assessment]
    E --> M[Analytics Engine]
    E --> N[Certification System]
    
    F --> O[Learning Style Detection]
    F --> P[Adaptive Algorithms]
    
    G --> Q[Question Answering]
    G --> R[Explanation Generation]
    
    H --> S[Exercise Creation]
    H --> T[Content Adaptation]
```

### Core Components

#### AI Learning Engine
```typescript
// Personalized AI tutoring system
export class AILearningEngine {
  async personalizeContent(studentId: string, content: Content): Promise<PersonalizedContent> {
    const learningProfile = await this.getLearningProfile(studentId);
    const adaptedContent = await this.aiService.adaptContent(content, learningProfile);
    return adaptedContent;
  }
  
  async provideExplanation(question: string, context: LearningContext): Promise<Explanation> {
    // AI-powered explanations tailored to student level
  }
  
  async assessUnderstanding(responses: Response[]): Promise<Assessment> {
    // Real-time understanding assessment
  }
}
```

#### Adaptive Learning System
```typescript
// Dynamic curriculum adaptation
export class AdaptiveLearningSystem {
  async generateLearningPath(studentId: string, subject: string): Promise<LearningPath> {
    const currentLevel = await this.assessCurrentLevel(studentId, subject);
    const learningGoals = await this.getLearningGoals(studentId);
    
    return this.aiService.generateOptimalPath(currentLevel, learningGoals);
  }
  
  async adjustDifficulty(studentId: string, performance: Performance): Promise<DifficultyAdjustment> {
    // Real-time difficulty adaptation based on performance
  }
}
```

### API Structure

#### Student Learning Endpoints
- `GET /api/student/dashboard` - Personalized learning dashboard
- `POST /api/student/lesson/start` - Begin lesson with AI personalization
- `POST /api/student/question` - Ask AI tutor questions
- `GET /api/student/progress` - Learning progress and analytics

#### AI Tutoring Endpoints
- `POST /api/ai/tutor/chat` - AI tutor conversation
- `POST /api/ai/tutor/explain` - Concept explanations
- `POST /api/ai/tutor/hint` - Learning hints and guidance
- `POST /api/ai/assessment/evaluate` - AI-powered assessment

#### Course Management Endpoints
- `GET /api/courses` - Available courses and content
- `POST /api/courses/enroll` - Course enrollment
- `GET /api/courses/:id/content` - Course content and materials
- `POST /api/courses/:id/complete` - Mark course completion

#### Analytics Endpoints
- `GET /api/analytics/student/:id` - Individual student analytics
- `GET /api/analytics/course/:id` - Course performance analytics
- `GET /api/analytics/engagement` - Platform engagement metrics
- `POST /api/analytics/track` - Learning event tracking

## 🛠️ Development

### Project Structure
```
apps/studiai/
├── app/                    # Next.js 13+ app directory
│   ├── (student)/         # Student-facing pages
│   ├── (teacher)/         # Teacher dashboard
│   ├── (admin)/           # Admin panel
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── learning/          # Learning-specific components
│   ├── ai/                # AI interaction components
│   └── analytics/         # Analytics and reporting
├── lib/                   # Utility libraries
│   ├── ai/                # AI service integrations
│   ├── learning/          # Learning algorithms
│   ├── analytics/         # Analytics processing
│   └── utils/             # Helper functions
├── types/                 # TypeScript definitions
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── tests/                 # Test files
└── docs/                  # Documentation
```

### Running Tests
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests with AI simulation
pnpm test:e2e

# Coverage report
pnpm test:coverage

# AI model testing
pnpm test:ai
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

# Firebase
pnpm firebase:deploy  # Deploy Firebase rules and functions
pnpm firebase:emulate # Start Firebase emulators

# AI Services
pnpm ai:train         # Train custom AI models
pnpm ai:validate      # Validate AI responses
pnpm ai:benchmark     # Benchmark AI performance

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

export class StudiAIIntegration {
  async enhanceWithCodai(learningContent: LearningContent) {
    // Use CODAI for programming education modules
    const codingExercises = await this.codaiClient.generateExercises(learningContent);
    
    // Store learning progress in Memorai
    await this.memoraiClient.store({
      type: 'learning_progress',
      studentId: learningContent.studentId,
      content: codingExercises,
      timestamp: new Date()
    });
    
    return codingExercises;
  }
}
```

### Educational Content Providers
```typescript
// Integration with educational content APIs
export class ContentIntegrationService {
  async importKhanAcademy(courseId: string) {
    const content = await this.khanAcademyAPI.getCourse(courseId);
    const aiEnhanced = await this.aiService.enhanceContent(content);
    return this.adaptForStudiAI(aiEnhanced);
  }
  
  async syncWithCoursera(userId: string) {
    // Sync progress with external platforms
  }
}
```

### AI Model Integration
```typescript
// Multiple AI provider integration
export class AIModelService {
  async getResponse(query: string, context: LearningContext) {
    const model = this.selectOptimalModel(context.subject, context.difficulty);
    
    switch (model.provider) {
      case 'openai':
        return await this.openaiClient.complete(query, context);
      case 'anthropic':
        return await this.anthropicClient.complete(query, context);
      case 'custom':
        return await this.customModel.predict(query, context);
    }
  }
}
```

## 🗺️ Roadmap

### Phase 1: Foundation (Current)
- ✅ Core AI tutoring system
- ✅ Adaptive learning algorithms
- ✅ Basic course platform
- ✅ Student progress tracking
- 🔄 AI assessment system

### Phase 2: Enhanced Personalization (Q2 2024)
- 📋 Advanced learning style detection
- 📋 Emotional intelligence in AI responses
- 📋 Multi-modal learning support (visual, auditory, kinesthetic)
- 📋 Real-time collaboration features
- 📋 Parent/teacher dashboards

### Phase 3: Advanced AI Features (Q3 2024)
- 📋 Natural language processing for homework help
- 📋 AI-generated practice problems
- 📋 Predictive learning outcome modeling
- 📋 Virtual reality learning environments
- 📋 Voice-based interactions

### Phase 4: Ecosystem Expansion (Q4 2024)
- 📋 Teacher AI assistant tools
- 📋 Automated content creation
- 📋 Integration with school management systems
- 📋 Mobile app with offline capabilities
- 📋 Gamification and social learning

### Phase 5: Advanced Intelligence (2025)
- 📋 Multimodal AI tutoring (text, voice, visual)
- 📋 Augmented reality learning experiences
- 📋 Brain-computer interface research
- 📋 Quantum computing education modules
- 📋 Global education marketplace

## 🤝 Contributing

StudiAI is committed to advancing AI-powered education. We welcome contributions from:

### How to Contribute
1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/ai-enhancement
   ```
3. **Make Changes** with focus on:
   - Educational effectiveness
   - AI accuracy and safety
   - Accessibility and inclusion
   - Student privacy protection
4. **Test Thoroughly**
   ```bash
   pnpm test
   pnpm test:ai
   pnpm test:e2e
   ```
5. **Submit Pull Request**

### Contribution Areas
- 🧠 **AI Models**: Learning algorithm improvements
- 📚 **Educational Content**: Curriculum development
- 🎨 **User Experience**: Interface and interaction design
- 📊 **Analytics**: Learning insights and reporting
- 🔒 **Privacy**: Student data protection
- 🌍 **Accessibility**: Inclusive design features

### Educational Standards
- Follow pedagogical best practices
- Ensure age-appropriate content
- Implement accessibility guidelines (WCAG 2.1 AA)
- Protect student privacy (COPPA/FERPA compliance)
- Include comprehensive educational assessments

## 📞 Support

### Educational Resources
- **Documentation**: https://docs.codai.dev/studiai
- **Teacher Training**: https://training.studiai.dev
- **Parent Guide**: https://parents.studiai.dev
- **Student Help**: https://help.studiai.dev

### Technical Support
- **Developer Resources**: https://developers.studiai.dev
- **API Documentation**: https://api.studiai.dev/docs
- **Community Forum**: https://community.codai.dev/studiai
- **Discord**: #studiai channel

### Educational Support
- **Teacher Support**: teachers@studiai.dev
- **Student Support**: students@studiai.dev
- **Parent Support**: parents@studiai.dev
- **Accessibility**: accessibility@studiai.dev

### Academic Partnerships
- **Institutional Partnerships**: partnerships@studiai.dev
- **Research Collaboration**: research@studiai.dev
- **Content Licensing**: licensing@studiai.dev
- **Privacy Concerns**: privacy@studiai.dev

## 📄 License

StudiAI is part of the CODAI ecosystem and is licensed under the MIT License with additional educational use provisions to ensure accessibility for educational institutions and students.

```
MIT License with Educational Provisions
Copyright (c) 2024 CODAI Ecosystem
```

For detailed license information, see the [LICENSE](../LICENSE) file in the repository root.

---

**🎓 Empowering Every Learner with Artificial Intelligence 🤖**

*StudiAI: Where Education meets Innovation*
