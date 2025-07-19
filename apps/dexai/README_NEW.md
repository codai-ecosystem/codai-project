# DEXAI - Intelligent Romanian Dictionary & Language Platform 📚

**AI-Enhanced Romanian Dictionary with Advanced Language Learning & Translation**

DEXAI revolutionizes Romanian language learning and dictionary services by combining comprehensive linguistic data with cutting-edge AI technology. Designed for native speakers, learners, translators, and researchers to explore, understand, and master the Romanian language with intelligent assistance.

## 🚀 Key Features

### Comprehensive Romanian Dictionary
- **Complete DEX Integration**: Full Romanian Academy Dictionary (DEX) with 150,000+ words
- **Advanced Search**: Intelligent search with fuzzy matching, phonetic similarity, and morphological analysis
- **Etymology & History**: Detailed word origins, historical evolution, and linguistic connections
- **Pronunciation Guide**: Audio pronunciations with IPA transcription and regional variations
- **Usage Examples**: Real-world examples, literary quotes, and contemporary usage

### AI-Powered Language Assistant
- **Intelligent Definitions**: AI-generated explanations for complex concepts and modern terms
- **Contextual Understanding**: Smart context analysis for ambiguous words and expressions
- **Translation Services**: Advanced Romanian ↔ English/French/German translation with cultural context
- **Grammar Analysis**: Detailed grammatical analysis, conjugation, and declension patterns
- **Language Generation**: AI-powered text generation and writing assistance in Romanian

### Advanced Learning Tools
- **Adaptive Learning**: Personalized vocabulary building based on proficiency level
- **Interactive Exercises**: Gamified learning with quizzes, word games, and challenges
- **Progress Tracking**: Comprehensive learning analytics and achievement system
- **Study Plans**: Customized learning paths for different goals and time commitments
- **Spaced Repetition**: Scientifically-backed memory retention techniques

### Research & Analysis Features
- **Linguistic Research**: Advanced corpus analysis and language pattern recognition
- **Historical Analysis**: Track word evolution and usage changes over time
- **Regional Variations**: Explore dialectal differences and regional expressions
- **Frequency Analysis**: Word frequency data and usage statistics
- **Academic Tools**: Citation support and research collaboration features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Modern web browser
- Internet connection for AI features

### Installation
```bash
# Clone and navigate to DEXAI
cd apps/dexai

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Development URLs
- **Main Dictionary**: http://localhost:3000
- **Learning Hub**: http://localhost:3000/learn
- **Translator**: http://localhost:3000/translate
- **Research Tools**: http://localhost:3000/research
- **User Dashboard**: http://localhost:3000/dashboard

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 + React 19
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Elasticsearch (search)
- **AI/ML**: OpenAI API + Custom NLP models
- **Authentication**: Firebase Auth
- **UI Framework**: Tailwind CSS + Framer Motion
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Testing**: Playwright + Jest + React Testing Library

### Core Components
```
dexai/
├── app/                    # Next.js app directory
├── components/            # UI components and dictionary interface
│   ├── dictionary/       # Dictionary search and display components
│   ├── learning/         # Learning tools and exercises
│   ├── translator/       # Translation interface components
│   ├── research/         # Research and analysis tools
│   └── shared/           # Shared UI components
├── lib/                  # Utility libraries and helpers
├── services/             # Dictionary and AI services
├── data/                 # Dictionary data and linguistic resources
├── api/                  # Backend API routes
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores for state management
├── types/                # TypeScript definitions
├── config/               # Configuration files
└── tests/                # Test suites
```

### Language Processing Architecture
1. **Data Layer**: Comprehensive Romanian linguistic database
2. **Search Engine**: Advanced search with Elasticsearch and AI ranking
3. **NLP Layer**: Natural language processing for understanding and generation
4. **AI Layer**: Machine learning models for translation and analysis
5. **User Interface**: Responsive and intuitive dictionary interface

## 🔧 Development

### Environment Setup
```bash
# Development environment
cp .env.example .env.local

# Required environment variables
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://user:password@localhost:5432/dexai
ELASTICSEARCH_URL=http://localhost:9200
OPENAI_API_KEY=your_openai_key
FIREBASE_CONFIG=your_firebase_config
DEEPL_API_KEY=your_deepl_key
GOOGLE_TRANSLATE_KEY=your_google_key
```

### Development Commands
```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check

# Build production
pnpm build

# Lint code
pnpm lint

# Mobile development
pnpm dev:mobile
```

### Dictionary Development
```bash
# Import dictionary data
npm run import:dex --source=official --format=xml

# Update search index
npm run reindex:search --force

# Train language models
npm run train:models --type=pronunciation

# Generate pronunciations
npm run generate:audio --lang=ro --voice=female
```

## 🔗 Integration

### DEXAI Dictionary SDK
```typescript
// DEXAI platform integration
import { DexaiClient } from '@codai/dexai';

const dexai = new DexaiClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://dexai.codai.ro/api'
});

// Search dictionary
const results = await dexai.search({
  query: 'înțelepciune',
  includeEtymology: true,
  includeExamples: true,
  includeAudio: true
});

// Get word details
const word = await dexai.getWord({
  word: 'dragoste',
  includeConjugation: true,
  includeRelated: true
});

// AI-powered translation
const translation = await dexai.translate({
  text: 'Limba română este frumoasă',
  from: 'ro',
  to: 'en',
  includeContext: true
});
```

### Learning Integration
```typescript
// Learning tools and progress tracking
import { DexaiLearning } from '@codai/dexai-learning';

const learning = new DexaiLearning({
  userId: 'user-123',
  level: 'intermediate'
});

// Create study session
const session = await learning.createSession({
  type: 'vocabulary',
  duration: 30, // minutes
  topics: ['verbs', 'adjectives'],
  difficulty: 'medium'
});

// Track learning progress
await learning.trackProgress({
  wordId: 'word-123',
  action: 'mastered',
  timeSpent: 45000, // milliseconds
  attempts: 3
});

// Get personalized recommendations
const recommendations = await learning.getRecommendations({
  count: 10,
  focusAreas: ['pronunciation', 'grammar']
});
```

### AI Translation API
```typescript
// Advanced translation with context
import { DexaiTranslator } from '@codai/dexai-translator';

const translator = new DexaiTranslator({
  model: 'advanced',
  preserveFormatting: true
});

// Context-aware translation
const translation = await translator.translate({
  text: 'Am luat o hotărâre importantă.',
  sourceLanguage: 'ro',
  targetLanguage: 'en',
  context: {
    domain: 'formal',
    tone: 'serious',
    audience: 'professional'
  }
});

// Batch translation
const batchTranslation = await translator.translateBatch({
  texts: ['Bună dimineața!', 'Cum te simți?', 'Pe curând!'],
  sourceLanguage: 'ro',
  targetLanguage: 'en',
  preserveOrder: true
});
```

## 🛣️ Roadmap

### Phase 1: Core Dictionary (Q1 2025)
- ✅ Complete DEX integration and search
- ✅ Basic AI translation features
- ✅ Audio pronunciation system
- ⏳ Advanced learning tools
- ⏳ Research and analysis features

### Phase 2: AI Enhancement (Q2 2025)
- 🔄 Advanced NLP and understanding
- 🔄 Personalized learning algorithms
- 🔄 Context-aware translations
- ⏳ Voice recognition and speaking practice
- ⏳ Advanced grammar analysis

### Phase 3: Community Features (Q3 2025)
- ⏳ Community contributions and corrections
- ⏳ Collaborative learning features
- ⏳ Regional dialect support
- ⏳ Academic research collaboration
- ⏳ Mobile app with offline capabilities

### Phase 4: Advanced AI (Q4 2025)
- ⏳ Natural language query interface
- ⏳ AI-powered language generation
- ⏳ Advanced linguistic analysis
- ⏳ Real-time conversation assistance
- ⏳ Integration with academic databases

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../docs/CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `pnpm install`
4. Set up local databases (PostgreSQL, Elasticsearch)
5. Make your changes
6. Run tests: `pnpm test`
7. Submit a pull request

## 📞 Support

- **Documentation**: [docs.dexai.codai.ro](https://docs.dexai.codai.ro)
- **API Reference**: [api.dexai.codai.ro](https://api.dexai.codai.ro)
- **Community**: [Discord](https://discord.gg/codai-ecosystem)
- **Email Support**: support@dexai.codai.ro
- **Academic Support**: research@dexai.codai.ro

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**DEXAI** - Intelligent Romanian Dictionary & Language Platform for comprehensive language mastery.

*Part of the [CODAI Ecosystem](https://codai.ro) - Building the future of AI-native applications.*
