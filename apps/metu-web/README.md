# METU-WEB - Voice AI Web Application 🎤

**Advanced Voice AI Platform for Natural Language Interaction & Audio Processing**

METU-WEB is the web-based interface for the METU Voice AI platform, providing sophisticated voice recognition, natural language processing, and audio generation capabilities. Designed to enable seamless voice-first interactions across the CODAI ecosystem with enterprise-grade accuracy and performance.

## 🚀 Key Features

### Advanced Voice Recognition
- **Multi-Language Support**: Support for Romanian, English, and 50+ languages with high accuracy
- **Real-Time Processing**: Low-latency voice-to-text conversion with streaming capabilities
- **Noise Cancellation**: Advanced audio preprocessing for clear recognition in noisy environments
- **Speaker Identification**: Multi-speaker recognition and voice profiling
- **Custom Vocabulary**: Domain-specific vocabulary training for specialized applications

### Natural Language Processing
- **Intent Recognition**: Advanced NLP for understanding user intentions and context
- **Sentiment Analysis**: Real-time emotion and sentiment detection from voice
- **Conversation Management**: Sophisticated dialogue state tracking and management
- **Language Understanding**: Deep semantic understanding with context preservation
- **Multi-Turn Conversations**: Support for complex, multi-step voice interactions

### Voice Synthesis & Generation
- **Neural Text-to-Speech**: High-quality voice synthesis with natural intonation
- **Voice Cloning**: Custom voice model training and cloning capabilities
- **Emotion Synthesis**: Emotional voice generation with adjustable parameters
- **SSML Support**: Advanced speech synthesis markup for precise control
- **Multi-Voice Support**: Multiple voice personalities and speaking styles

### Enterprise Integration
- **API-First Architecture**: Comprehensive REST and WebSocket APIs for integration
- **Real-Time Streaming**: Low-latency audio streaming for live applications
- **Scalable Infrastructure**: Cloud-native architecture supporting high concurrency
- **Security & Privacy**: End-to-end encryption and data privacy compliance
- **Analytics Dashboard**: Comprehensive usage analytics and performance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Microphone access for voice features
- Modern web browser with WebRTC support

### Installation
```bash
# Clone and navigate to METU-WEB
cd apps/metu-web

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Development URLs
- **Main Application**: http://localhost:5064
- **Voice Studio**: http://localhost:5064/studio
- **API Playground**: http://localhost:5064/playground
- **Analytics Dashboard**: http://localhost:5064/analytics
- **Admin Panel**: http://localhost:5064/admin

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 + React 19
- **Voice Processing**: Web Audio API + WebRTC
- **UI Framework**: Tailwind CSS + Framer Motion
- **State Management**: React Context + Custom hooks
- **Real-time**: WebSocket + Server-Sent Events
- **Audio Libraries**: Web Audio API + MediaRecorder
- **Integration**: CODAI ecosystem packages
- **Testing**: Vitest + React Testing Library

### Core Components
```
metu-web/
├── app/                    # Next.js app directory
├── components/            # UI components and voice interfaces
│   ├── voice/            # Voice recognition components
│   ├── synthesis/        # Text-to-speech components
│   ├── studio/           # Voice studio interface
│   ├── playground/       # API testing playground
│   └── shared/           # Shared UI components
├── lib/                  # Utility libraries and helpers
├── services/             # Voice processing services
├── hooks/                # Custom React hooks for voice
├── api/                  # Backend API routes
├── types/                # TypeScript definitions
├── config/               # Configuration files
└── tests/                # Test suites
```

### Voice Processing Architecture
1. **Audio Capture**: Browser-based audio capture with preprocessing
2. **Voice Recognition**: Real-time speech-to-text with streaming
3. **NLP Processing**: Natural language understanding and intent recognition
4. **Response Generation**: AI-powered response generation and synthesis
5. **Audio Output**: High-quality text-to-speech with voice customization

## 🔧 Development

### Environment Setup
```bash
# Development environment
cp .env.example .env.local

# Required environment variables
NEXT_PUBLIC_API_URL=http://localhost:5064/api
NEXT_PUBLIC_WS_URL=ws://localhost:5064/ws
OPENAI_API_KEY=your_openai_key
GOOGLE_SPEECH_API_KEY=your_google_key
AZURE_SPEECH_KEY=your_azure_key
ELEVENLABS_API_KEY=your_elevenlabs_key
LOGAI_API_URL=http://localhost:3000/api
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

# Start production server
pnpm start
```

### Voice Development
```bash
# Test voice recognition
npm run test:voice --input=microphone --language=ro

# Train custom voice model
npm run train:voice --dataset=voice-samples --epochs=100

# Generate voice samples
npm run generate:voice --text="Hello world" --voice=custom

# Benchmark performance
npm run benchmark:voice --duration=60s --concurrent=10
```

## 🔗 Integration

### METU Voice SDK
```typescript
// METU voice platform integration
import { MetuClient } from '@codai/metu-web';

const metu = new MetuClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://metu.codai.ro/api'
});

// Start voice recognition
const recognition = await metu.startRecognition({
  language: 'ro-RO',
  realTime: true,
  includeConfidence: true,
  customVocabulary: ['codai', 'bancai', 'memorai']
});

// Handle recognition results
recognition.onResult((result) => {
  console.log('Transcription:', result.text);
  console.log('Confidence:', result.confidence);
});

// Text-to-speech synthesis
const synthesis = await metu.synthesize({
  text: 'Bună ziua! Cum vă pot ajuta astăzi?',
  voice: 'romanian-female',
  emotion: 'friendly',
  speed: 1.0
});
```

### Voice Studio Integration
```typescript
// Voice studio and training
import { MetuStudio } from '@codai/metu-studio';

const studio = new MetuStudio({
  projectId: 'voice-project-123'
});

// Create custom voice model
const voiceModel = await studio.createVoiceModel({
  name: 'Custom Romanian Voice',
  language: 'ro-RO',
  audioSamples: voiceSampleFiles,
  trainingOptions: {
    epochs: 500,
    learningRate: 0.001,
    batchSize: 32
  }
});

// Train speech recognition model
const recognitionModel = await studio.trainRecognition({
  name: 'Domain Specific Model',
  baseModel: 'whisper-large',
  trainingData: transcriptionDataset,
  vocabulary: customVocabulary
});

// Deploy model for production
const deployment = await studio.deployModel({
  modelId: voiceModel.id,
  environment: 'production',
  scalingPolicy: 'auto'
});
```

### Real-Time Voice Processing
```typescript
// Real-time voice interaction
import { MetuRealTime } from '@codai/metu-realtime';

const realtime = new MetuRealTime({
  websocketUrl: 'wss://metu.codai.ro/ws'
});

// Start real-time conversation
const conversation = await realtime.startConversation({
  language: 'ro-RO',
  conversationMode: 'voice-to-voice',
  responseGeneration: 'ai-powered'
});

// Handle real-time audio stream
conversation.onAudioStream((audioChunk) => {
  // Process incoming audio
  processAudioChunk(audioChunk);
});

// Send voice command
await conversation.sendVoiceCommand({
  audio: audioBuffer,
  format: 'wav',
  sampleRate: 16000
});
```

## 🛣️ Roadmap

### Phase 1: Core Platform (Q1 2025)
- ✅ Basic voice recognition and synthesis
- ✅ Web interface and API
- ✅ Multi-language support
- ⏳ Real-time streaming capabilities
- ⏳ Voice studio interface

### Phase 2: Advanced AI (Q2 2025)
- 🔄 Custom voice model training
- 🔄 Advanced NLP and intent recognition
- 🔄 Emotion and sentiment analysis
- ⏳ Conversation management system
- ⏳ Voice cloning capabilities

### Phase 3: Enterprise Features (Q3 2025)
- ⏳ Enterprise SSO integration
- ⏳ Advanced analytics and monitoring
- ⏳ Multi-tenant voice services
- ⏳ Compliance and security features
- ⏳ API marketplace integration

### Phase 4: AI Enhancement (Q4 2025)
- ⏳ Neural voice synthesis
- ⏳ Advanced conversation AI
- ⏳ Predictive voice interfaces
- ⏳ Cross-language voice transfer
- ⏳ Contextual voice adaptation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../docs/CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `pnpm install`
4. Set up audio development environment
5. Make your changes
6. Run tests: `pnpm test`
7. Submit a pull request

## 📞 Support

- **Documentation**: [docs.metu.codai.ro](https://docs.metu.codai.ro)
- **API Reference**: [api.metu.codai.ro](https://api.metu.codai.ro)
- **Community**: [Discord](https://discord.gg/codai-ecosystem)
- **Email Support**: support@metu.codai.ro
- **Voice Studio**: studio@metu.codai.ro

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**METU-WEB** - Voice AI Web Application for natural language interaction and audio processing.

*Part of the [CODAI Ecosystem](https://codai.ro) - Building the future of AI-native applications.*
