import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Add React 19 compatibility fixes
Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', {
  writable: true,
  value: true,
})

// Fix React DOM issue with undefined check
Object.defineProperty(global, 'navigator', {
  writable: true,
  value: {
    ...global.navigator,
    userAgent: 'node.js'
  },
})

// Mock environment variables for React compatibility
vi.stubEnv('NODE_ENV', 'test')

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Web Speech API
const mockSpeechRecognition = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  grammars: null,
  maxAlternatives: 1,
  serviceURI: '',
  onaudiostart: null,
  onaudioend: null,
  onend: null,
  onerror: null,
  onnomatch: null,
  onresult: null,
  onsoundstart: null,
  onsoundend: null,
  onspeechstart: null,
  onspeechend: null,
  onstart: null,
}))

  // Mock Speech Recognition global
  ; (global as any).SpeechRecognition = mockSpeechRecognition
  ; (global as any).webkitSpeechRecognition = mockSpeechRecognition

  // Mock Speech Synthesis
  ; (global as any).speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    onvoiceschanged: null,
    paused: false,
    pending: false,
    speaking: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }

  // Mock SpeechSynthesisUtterance
  ; (global as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({
    text,
    lang: 'en-US',
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1,
    onstart: null,
    onend: null,
    onerror: null,
    onpause: null,
    onresume: null,
    onmark: null,
    onboundary: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  // Mock AudioContext
  ; (global as any).AudioContext = vi.fn().mockImplementation(() => ({
    createAnalyser: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
      getFloatFrequencyData: vi.fn(),
      getFloatTimeDomainData: vi.fn(),
      minDecibels: -100,
      maxDecibels: -30,
      smoothingTimeConstant: 0.8,
    }),
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 1 },
    }),
    createMediaStreamSource: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
    createScriptProcessor: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      onaudioprocess: null,
    }),
    destination: {},
    sampleRate: 44100,
    currentTime: 0,
    listener: {},
    state: 'running',
    suspend: vi.fn(),
    resume: vi.fn(),
    close: vi.fn(),
    createBuffer: vi.fn(),
    createBufferSource: vi.fn(),
    createOscillator: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  // Mock webkitAudioContext
  ; (global as any).webkitAudioContext = (global as any).AudioContext

// Mock getUserMedia
global.navigator = {
  ...global.navigator,
  mediaDevices: {
    ...global.navigator?.mediaDevices,
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([]),
      getAudioTracks: vi.fn().mockReturnValue([{
        stop: vi.fn(),
        enabled: true,
        kind: 'audio',
        label: 'Mock Audio Track',
        id: 'mock-audio-track-id'
      }]),
      getVideoTracks: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
    enumerateDevices: vi.fn().mockResolvedValue([
      {
        deviceId: 'default',
        kind: 'audioinput',
        label: 'Default Microphone',
        groupId: 'group1'
      },
      {
        deviceId: 'speaker1',
        kind: 'audiooutput',
        label: 'Default Speaker',
        groupId: 'group2'
      }
    ]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Element.scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock fetch for API calls
global.fetch = vi.fn()

  // Mock WebSocket for Azure OpenAI Realtime
  ; (global as any).WebSocket = vi.fn().mockImplementation(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }))

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn().mockReturnValue(Date.now()),
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})