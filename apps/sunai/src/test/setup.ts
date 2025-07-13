import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
}

vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
    Mic: vi.fn(() => 'Mic Icon'),
    MicOff: vi.fn(() => 'MicOff Icon'),
    Video: vi.fn(() => 'Video Icon'),
    VideoOff: vi.fn(() => 'VideoOff Icon'),
    Phone: vi.fn(() => 'Phone Icon'),
    PhoneOff: vi.fn(() => 'PhoneOff Icon'),
    MessageCircle: vi.fn(() => 'MessageCircle Icon'),
    Send: vi.fn(() => 'Send Icon'),
    Languages: vi.fn(() => 'Languages Icon'),
    Globe: vi.fn(() => 'Globe Icon'),
    Sun: vi.fn(() => 'Sun Icon'),
    Settings: vi.fn(() => 'Settings Icon'),
    Volume2: vi.fn(() => 'Volume2 Icon'),
    VolumeX: vi.fn(() => 'VolumeX Icon'),
    Users: vi.fn(() => 'Users Icon'),
    Zap: vi.fn(() => 'Zap Icon'),
}))

// Mock WebRTC APIs
global.RTCPeerConnection = vi.fn().mockImplementation(() => ({
    createOffer: vi.fn(),
    createAnswer: vi.fn(),
    setLocalDescription: vi.fn(),
    setRemoteDescription: vi.fn(),
    addIceCandidate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
}))

global.navigator.mediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue({
        getTracks: vi.fn().mockReturnValue([]),
    }),
    enumerateDevices: vi.fn().mockResolvedValue([]),
} as any

// Mock Speech Recognition API
global.SpeechRecognition = vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
}))

global.webkitSpeechRecognition = global.SpeechRecognition

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

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
