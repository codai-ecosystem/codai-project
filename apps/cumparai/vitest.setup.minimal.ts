import { expect, vi } from 'vitest'

// Mock React JSX runtime first (critical for React 19)
vi.mock('react/jsx-dev-runtime', () => ({
  jsxDEV: vi.fn(() => 'mocked-jsx-element'),
  Fragment: 'fragment',
}))

vi.mock('react/jsx-runtime', () => ({
  jsx: vi.fn(() => 'mocked-jsx-element'),
  jsxs: vi.fn(() => 'mocked-jsx-element'),
  Fragment: 'fragment',
}))

// Mock React for workspace compatibility (must be first)
vi.mock('react', () => ({
  default: {
    createElement: vi.fn(() => 'mocked-element'),
    Fragment: 'fragment',
  },
  createElement: vi.fn(() => 'mocked-element'),
  Fragment: 'fragment',
  useState: vi.fn(() => [null, vi.fn()]),
  useEffect: vi.fn(),
  useContext: vi.fn(),
  useRef: vi.fn(() => ({ current: null })),
  forwardRef: vi.fn((fn) => fn),
  memo: vi.fn((component) => component),
}))

// Mock react-dom
vi.mock('react-dom', () => ({
  default: { render: vi.fn() },
  render: vi.fn(),
  unmountComponentAtNode: vi.fn(),
}))

// Mock @testing-library/react with safe imports
vi.mock('@testing-library/react', () => ({
  render: vi.fn(() => ({
    container: document.createElement('div'),
    getByText: vi.fn(),
    getByTestId: vi.fn(),
    queryByText: vi.fn(),
    queryByTestId: vi.fn(),
  })),
  screen: {
    getByText: vi.fn(),
    getByTestId: vi.fn(),
    queryByText: vi.fn(),
    queryByTestId: vi.fn(),
    getByRole: vi.fn(),
    queryByRole: vi.fn(),
    findByText: vi.fn(),
    findByTestId: vi.fn(),
  },
  fireEvent: {
    click: vi.fn(),
    change: vi.fn(),
    submit: vi.fn(),
  },
  waitFor: vi.fn((fn) => Promise.resolve(fn())),
  act: vi.fn((fn) => fn()),
  cleanup: vi.fn(),
}))

// Mock framer-motion for animation components
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => children),
    span: vi.fn(({ children, ...props }) => children),
    button: vi.fn(({ children, ...props }) => children),
    section: vi.fn(({ children, ...props }) => children),
    h1: vi.fn(({ children, ...props }) => children),
    h2: vi.fn(({ children, ...props }) => children),
    h3: vi.fn(({ children, ...props }) => children),
    p: vi.fn(({ children, ...props }) => children),
    img: vi.fn(({ children, ...props }) => children),
  },
  AnimatePresence: vi.fn(({ children }) => children),
  useAnimation: vi.fn(() => ({})),
  useMotionValue: vi.fn(() => ({})),
  useSpring: vi.fn(() => ({})),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: vi.fn(() => 'Search'),
  ShoppingCart: vi.fn(() => 'ShoppingCart'),
  Filter: vi.fn(() => 'Filter'),
  Star: vi.fn(() => 'Star'),
  Heart: vi.fn(() => 'Heart'),
  Share: vi.fn(() => 'Share'),
  Eye: vi.fn(() => 'Eye'),
  ThumbsUp: vi.fn(() => 'ThumbsUp'),
  Check: vi.fn(() => 'Check'),
  X: vi.fn(() => 'X'),
  ChevronDown: vi.fn(() => 'ChevronDown'),
  ChevronUp: vi.fn(() => 'ChevronUp'),
  ChevronLeft: vi.fn(() => 'ChevronLeft'),
  ChevronRight: vi.fn(() => 'ChevronRight'),
  Menu: vi.fn(() => 'Menu'),
  User: vi.fn(() => 'User'),
  Settings: vi.fn(() => 'Settings'),
  Plus: vi.fn(() => 'Plus'),
  Minus: vi.fn(() => 'Minus'),
  Edit: vi.fn(() => 'Edit'),
  Trash: vi.fn(() => 'Trash'),
  Bell: vi.fn(() => 'Bell'),
  Home: vi.fn(() => 'Home'),
  Building: vi.fn(() => 'Building'),
  Globe: vi.fn(() => 'Globe'),
  Mail: vi.fn(() => 'Mail'),
  Phone: vi.fn(() => 'Phone'),
  Calendar: vi.fn(() => 'Calendar'),
  Clock: vi.fn(() => 'Clock'),
  Download: vi.fn(() => 'Download'),
  Upload: vi.fn(() => 'Upload'),
  Camera: vi.fn(() => 'Camera'),
  Image: vi.fn(() => 'Image'),
  Video: vi.fn(() => 'Video'),
  Play: vi.fn(() => 'Play'),
  Pause: vi.fn(() => 'Pause'),
  Stop: vi.fn(() => 'Stop'),
  SkipForward: vi.fn(() => 'SkipForward'),
  SkipBack: vi.fn(() => 'SkipBack'),
  Volume2: vi.fn(() => 'Volume2'),
  VolumeX: vi.fn(() => 'VolumeX'),
  Wifi: vi.fn(() => 'Wifi'),
  WifiOff: vi.fn(() => 'WifiOff'),
  Battery: vi.fn(() => 'Battery'),
  Bluetooth: vi.fn(() => 'Bluetooth'),
  Smartphone: vi.fn(() => 'Smartphone'),
  Laptop: vi.fn(() => 'Laptop'),
  Monitor: vi.fn(() => 'Monitor'),
  Printer: vi.fn(() => 'Printer'),
  Headphones: vi.fn(() => 'Headphones'),
  Speaker: vi.fn(() => 'Speaker'),
  Microphone: vi.fn(() => 'Microphone'),
  MicrophoneOff: vi.fn(() => 'MicrophoneOff'),
  Sparkles: vi.fn(() => 'Sparkles'),
  Zap: vi.fn(() => 'Zap'),
  Bolt: vi.fn(() => 'Bolt'),
  Target: vi.fn(() => 'Target'),
  Award: vi.fn(() => 'Award'),
  Trophy: vi.fn(() => 'Trophy'),
  Gift: vi.fn(() => 'Gift'),
  Package: vi.fn(() => 'Package'),
  Truck: vi.fn(() => 'Truck'),
  MapPin: vi.fn(() => 'MapPin'),
  Navigation: vi.fn(() => 'Navigation'),
  Compass: vi.fn(() => 'Compass'),
  Map: vi.fn(() => 'Map'),
  Globe2: vi.fn(() => 'Globe2'),
  Sun: vi.fn(() => 'Sun'),
  Moon: vi.fn(() => 'Moon'),
  Cloud: vi.fn(() => 'Cloud'),
  CloudRain: vi.fn(() => 'CloudRain'),
  CloudSnow: vi.fn(() => 'CloudSnow'),
  Umbrella: vi.fn(() => 'Umbrella'),
  Thermometer: vi.fn(() => 'Thermometer'),
  Wind: vi.fn(() => 'Wind'),
  Flame: vi.fn(() => 'Flame'),
  Droplets: vi.fn(() => 'Droplets'),
  Leaf: vi.fn(() => 'Leaf'),
  Tree: vi.fn(() => 'Tree'),
  Flower: vi.fn(() => 'Flower'),
  Flower2: vi.fn(() => 'Flower2'),
  Bug: vi.fn(() => 'Bug'),
  Fish: vi.fn(() => 'Fish'),
  Bird: vi.fn(() => 'Bird'),
  Cat: vi.fn(() => 'Cat'),
  Dog: vi.fn(() => 'Dog'),
  Rabbit: vi.fn(() => 'Rabbit'),
  Squirrel: vi.fn(() => 'Squirrel'),
  default: vi.fn(() => 'DefaultIcon'),
}))

// Mock window APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
