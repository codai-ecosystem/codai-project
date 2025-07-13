# METU - Revolutionary Voice AI Application

🎤 **World's first truly seamless voice AI interaction with continuous listening and natural interruption handling.**

## 🚀 Revolutionary Features

METU solves the fundamental problem of natural voice conversation by eliminating awkward pauses and enabling truly seamless interaction:

### ✨ Core Innovations

- **🔄 Continuous Listening**: METU listens even while speaking, enabling natural conversation flow
- **🎯 Smart Interruption Detection**: Detects polite, urgent, correction, and question interruptions
- **⚡ Zero Conversation Delays**: No more waiting for silence to speak
- **🧠 Context Preservation**: Maintains conversation context across interruptions
- **🎛️ Real-time Voice Processing**: Advanced voice activity detection and audio processing

### 🎨 User Experience

- **Modern Glass UI**: Beautiful glassmorphism design with Tailwind CSS
- **Voice Visualization**: Real-time voice activity and conversation flow display
- **Status Indicators**: Clear visual feedback for listening, speaking, and processing states
- **Cross-platform**: Built with Electron for Windows, macOS, and Linux

## 🏗️ Architecture

### Voice Engine Components

```
VoiceEngine (Main Orchestrator)
├── SpeechRecognition (Continuous listening with Web Speech API)
├── TextToSpeech (Interruptible speech synthesis)
├── InterruptionManager (Natural conversation flow)
├── VoiceActivityDetector (Real-time voice detection)
└── AudioProcessor (Echo cancellation & noise suppression)
```

### Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron with secure preload scripts
- **Voice**: Web Speech API with Azure Speech Services fallback
- **Audio**: Web Audio API for real-time processing
- **Testing**: Vitest + Playwright for comprehensive testing
- **Build**: Vite for fast development and optimized builds

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- pnpm (for package management)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

### Project Structure

```
apps/metu/
├── src/
│   ├── components/        # React UI components
│   │   └── VoiceInterface.tsx
│   ├── voice/            # Voice engine components
│   │   ├── VoiceEngine.ts
│   │   ├── SpeechRecognition.ts
│   │   ├── TextToSpeech.ts
│   │   ├── InterruptionManager.ts
│   │   ├── VoiceActivityDetector.ts
│   │   └── AudioProcessor.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── voice.ts
│   │   ├── ai.ts
│   │   └── app.ts
│   ├── main/             # Electron main process
│   │   └── index.ts
│   ├── preload/          # Electron preload scripts
│   │   └── index.ts
│   ├── App.tsx           # Main React component
│   └── main.tsx          # React entry point
├── tests/                # Test suites
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🎤 Voice Engine Features

### Continuous Recognition
- Always listening, even during AI speech
- Real-time transcript updates with interim results
- High accuracy speech recognition with confidence scoring
- Automatic error recovery and reconnection

### Intelligent Interruptions
- **Polite**: "Sorry to interrupt, but..."
- **Urgent**: "STOP!", "Emergency!", "Wait!"
- **Correction**: "No, I meant...", "Actually..."
- **Question**: "What about...?", "Can you explain...?"

### Audio Processing
- Echo cancellation to prevent feedback loops
- Noise suppression for clean input
- Voice activity detection during speech synthesis
- Real-time audio level monitoring

### Speech Synthesis
- High-quality text-to-speech with multiple voices
- Immediate interruption capability
- Configurable rate, pitch, and volume
- Emotion and style support (cheerful, friendly, etc.)

## 🔧 Configuration

### Voice Engine Config
```typescript
const config: VoiceConfig = {
  continuous: true,              // Continuous listening
  interimResults: true,          // Real-time transcription
  maxAlternatives: 3,           // Recognition alternatives
  sampleRate: 44100,            // Audio sample rate
  channels: 1,                  // Mono audio
  bitDepth: 16,                 // Audio bit depth
  maxLatency: 100,              // Max acceptable latency (ms)
  recognitionAccuracy: 0.8,     // Minimum confidence threshold
  interruptionDetectionTime: 500 // Interruption detection window (ms)
}
```

### Audio Processor Config
```typescript
const audioConfig: AudioProcessorConfig = {
  sampleRate: 44100,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  inputGain: 1.0,
  outputGain: 0.8,
  compressionThreshold: -24,
  compressionRatio: 4,
  highpassFrequency: 80,
  lowpassFrequency: 8000,
  delayTime: 0.005
}
```

## 🔐 Security

METU implements comprehensive security measures:

- **Context Isolation**: Secure Electron preload scripts
- **CSP Headers**: Content Security Policy protection
- **Sandboxing**: Restricted renderer process capabilities
- **Input Validation**: All user inputs sanitized
- **Secure Communication**: IPC between main/renderer processes

## 🧪 Testing

### Unit Tests
```bash
pnpm test                    # Run all unit tests
pnpm test:watch             # Watch mode for development
pnpm test:coverage          # Generate coverage report
```

### E2E Tests
```bash
pnpm test:e2e               # Run Playwright E2E tests
pnpm test:e2e:ui            # Interactive E2E test runner
```

### Voice Engine Tests
- Speech recognition accuracy testing
- Interruption detection scenarios
- Audio processing pipeline validation
- Performance and latency benchmarks

## 📱 Usage

1. **Launch METU**: Double-click the application icon
2. **Grant Permissions**: Allow microphone access when prompted
3. **Start Listening**: Click "Start Listening" or press Space
4. **Natural Conversation**: Speak naturally, interrupt as needed
5. **Monitor Status**: Watch real-time indicators for voice activity

### Keyboard Shortcuts
- `Space`: Start/resume listening
- `Escape`: Stop listening
- `Cmd/Ctrl + K`: Clear conversation
- `Cmd/Ctrl + ,`: Open preferences

## 🌟 Revolutionary Impact

METU represents a breakthrough in human-AI voice interaction:

- **Eliminates Awkward Pauses**: No more waiting for the AI to finish
- **Natural Conversation Flow**: Interrupt and respond like human conversation
- **Reduced Cognitive Load**: Focus on content, not conversation mechanics
- **Accessibility**: Makes AI more accessible for voice-first users
- **Efficiency**: Faster communication through natural interruption patterns

## 🔮 Future Enhancements

- **Multi-language Support**: Real-time language detection and switching
- **Voice Cloning**: Personalized AI voice synthesis
- **Emotion Recognition**: Detect user emotional state from voice
- **Meeting Mode**: Multi-participant voice AI interactions
- **Plugin System**: Extensible voice command capabilities

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines.

## 🐛 Issue Reporting

Found a bug or have a feature request? Please open an issue on GitHub with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Environment information (OS, browser, etc.)

---

**Built with ❤️ by the CODAI Project Team**

*Revolutionizing human-AI interaction, one conversation at a time.*
