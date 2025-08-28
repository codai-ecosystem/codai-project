import { vi } from 'vitest'
import React from 'react'
import '@testing-library/jest-dom'

// Mock Next.js components and functionality
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return React.createElement('img', { src, alt, ...props })
    }
}))

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => {
        return React.createElement('a', { href, ...props }, children)
    }
}))

vi.mock('next/router', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
        pathname: '/',
        route: '/',
        query: {},
        asPath: '/',
        events: {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn()
        }
    })
}))

// Mock Framer Motion to avoid complex animations in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => React.createElement('div', props, children),
        section: ({ children, ...props }: any) => React.createElement('section', props, children),
        header: ({ children, ...props }: any) => React.createElement('header', props, children),
        nav: ({ children, ...props }: any) => React.createElement('nav', props, children),
        button: ({ children, ...props }: any) => React.createElement('button', props, children),
        ul: ({ children, ...props }: any) => React.createElement('ul', props, children),
        li: ({ children, ...props }: any) => React.createElement('li', props, children),
        h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
        h2: ({ children, ...props }: any) => React.createElement('h2', props, children),
        h3: ({ children, ...props }: any) => React.createElement('h3', props, children),
        p: ({ children, ...props }: any) => React.createElement('p', props, children),
        span: ({ children, ...props }: any) => React.createElement('span', props, children),
        a: ({ children, ...props }: any) => React.createElement('a', props, children)
    },
    AnimatePresence: ({ children }: any) => children,
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn()
    }),
    useInView: () => [vi.fn(), true],
    useScroll: () => ({
        scrollY: { get: () => 0 },
        scrollX: { get: () => 0 }
    }),
    useTransform: () => 0,
    useSpring: () => 0
}))

// Mock Lucide React icons comprehensively
vi.mock('lucide-react', () => {
    const createIcon = (name: string) => () =>
        React.createElement('div', { 'data-testid': `${name.toLowerCase()}-icon`, 'aria-label': name });

    return {
        // Navigation & UI icons
        Menu: createIcon('menu'),
        X: createIcon('x'),
        ChevronDown: createIcon('chevron-down'),
        ChevronUp: createIcon('chevron-up'),
        ChevronLeft: createIcon('chevron-left'),
        ChevronRight: createIcon('chevron-right'),
        ExternalLink: createIcon('external-link'),
        Filter: createIcon('filter'),
        Search: createIcon('search'),
        Grid: createIcon('grid'),
        List: createIcon('list'),
        Sun: createIcon('sun'),
        Moon: createIcon('moon'),

        // Project category icons
        Brain: createIcon('brain'),
        Code: createIcon('code'),
        Database: createIcon('database'),
        Cloud: createIcon('cloud'),
        Smartphone: createIcon('smartphone'),
        Globe: createIcon('globe'),
        Shield: createIcon('shield'),
        Zap: createIcon('zap'),
        Users: createIcon('users'),
        MessageCircle: createIcon('message-circle'),
        CreditCard: createIcon('credit-card'),
        BookOpen: createIcon('book-open'),
        Music: createIcon('music'),
        Camera: createIcon('camera'),
        FileText: createIcon('file-text'),
        BarChart: createIcon('bar-chart'),
        Settings: createIcon('settings'),
        Lock: createIcon('lock'),
        Wallet: createIcon('wallet'),
        Briefcase: createIcon('briefcase'),
        Heart: createIcon('heart'),
        TrendingUp: createIcon('trending-up'),
        Award: createIcon('award'),
        Target: createIcon('target'),
        Layers: createIcon('layers'),
        Package: createIcon('package'),
        Cpu: createIcon('cpu'),
        Network: createIcon('network'),
        Monitor: createIcon('monitor'),
        Server: createIcon('server'),
        HardDrive: createIcon('hard-drive'),
        Terminal: createIcon('terminal'),
        GitBranch: createIcon('git-branch'),
        Puzzle: createIcon('puzzle'),
        Compass: createIcon('compass'),
        Rocket: createIcon('rocket'),
        Star: createIcon('star'),
        Lightning: createIcon('lightning'),
        Flame: createIcon('flame'),
        Gem: createIcon('gem'),
        Crown: createIcon('crown'),
        Diamond: createIcon('diamond'),
        Sparkles: createIcon('sparkles'),

        // Additional missing icons
        Building2: createIcon('building2'),
        Building: createIcon('building'),
        Home: createIcon('home'),
        Factory: createIcon('factory'),
        Store: createIcon('store'),
        Warehouse: createIcon('warehouse'),
        School: createIcon('school'),
        Hospital: createIcon('hospital'),
        ShoppingCart: createIcon('shopping-cart'),
        Car: createIcon('car'),
        Truck: createIcon('truck'),
        Plane: createIcon('plane'),
        Ship: createIcon('ship'),
        Train: createIcon('train'),
        Bike: createIcon('bike'),
        Activity: createIcon('activity'),
        Analytics: createIcon('analytics'),
        ArrowRight: createIcon('arrow-right'),
        ArrowLeft: createIcon('arrow-left'),
        ArrowUp: createIcon('arrow-up'),
        ArrowDown: createIcon('arrow-down'),
        Check: createIcon('check'),
        CheckCircle: createIcon('check-circle'),
        AlertCircle: createIcon('alert-circle'),
        AlertTriangle: createIcon('alert-triangle'),
        Info: createIcon('info'),
        Plus: createIcon('plus'),
        Minus: createIcon('minus'),
        Edit: createIcon('edit'),
        Trash: createIcon('trash'),
        Download: createIcon('download'),
        Upload: createIcon('upload'),
        Share: createIcon('share'),
        Copy: createIcon('copy'),
        Save: createIcon('save'),
        Print: createIcon('print'),
        Mail: createIcon('mail'),
        Phone: createIcon('phone'),
        Calendar: createIcon('calendar'),
        Clock: createIcon('clock'),
        MapPin: createIcon('map-pin'),
        Image: createIcon('image'),
        Video: createIcon('video'),
        Play: createIcon('play'),
        Pause: createIcon('pause'),
        Stop: createIcon('stop'),
        SkipForward: createIcon('skip-forward'),
        SkipBack: createIcon('skip-back'),
        Volume: createIcon('volume'),
        VolumeX: createIcon('volume-x'),
        Mic: createIcon('mic'),
        MicOff: createIcon('mic-off'),
        Eye: createIcon('eye'),
        EyeOff: createIcon('eye-off'),
        ThumbsUp: createIcon('thumbs-up'),
        ThumbsDown: createIcon('thumbs-down'),
        Flag: createIcon('flag'),
        Bookmark: createIcon('bookmark'),
        Tag: createIcon('tag'),
        Hash: createIcon('hash'),
        AtSign: createIcon('at-sign'),
        Percent: createIcon('percent'),
        DollarSign: createIcon('dollar-sign'),
        Euro: createIcon('euro'),
        PoundSterling: createIcon('pound-sterling'),

        // Education and learning icons
        GraduationCap: createIcon('graduation-cap'),
        Book: createIcon('book'),
        BookMark: createIcon('book-mark'),
        Pencil: createIcon('pencil'),
        PenTool: createIcon('pen-tool'),

        // Action and interface icons
        RefreshCw: createIcon('refresh-cw'),
        Refresh: createIcon('refresh'),
        RotateCw: createIcon('rotate-cw'),
        RotateCcw: createIcon('rotate-ccw'),
        Repeat: createIcon('repeat'),
        Loader: createIcon('loader'),
        LoaderCircle: createIcon('loader-circle'),

        // Additional commonly used icons
        ChevronFirst: createIcon('chevron-first'),
        ChevronLast: createIcon('chevron-last'),
        ChevronsUp: createIcon('chevrons-up'),
        ChevronsDown: createIcon('chevrons-down'),
        ChevronsLeft: createIcon('chevrons-left'),
        ChevronsRight: createIcon('chevrons-right'),

        // Tech and development
        Cog: createIcon('cog'),
        Gear: createIcon('gear'),
        Wrench: createIcon('wrench'),
        Tool: createIcon('tool'),
        Hammer: createIcon('hammer'),
        Screwdriver: createIcon('screwdriver'),

        // Project-specific icons from projects.ts
        Utensils: createIcon('utensils'),
        HelpCircle: createIcon('help-circle'),
        Gavel: createIcon('gavel'),
        User: createIcon('user'),
        BarChart3: createIcon('bar-chart3'),
        Fingerprint: createIcon('fingerprint'),
        Gamepad2: createIcon('gamepad2'),
        TrendingDown: createIcon('trending-down'),
        Gift: createIcon('gift'),
        Presentation: createIcon('presentation'),
        UserCheck: createIcon('user-check'),
        Palette: createIcon('palette'),
        Coffee: createIcon('coffee'),
        Calculator: createIcon('calculator'),
        Battery: createIcon('battery'),
        Laptop: createIcon('laptop'),
        Tablet: createIcon('tablet'),
        Watch: createIcon('watch'),
        Headphones: createIcon('headphones'),
        Speaker: createIcon('speaker'),
        Keyboard: createIcon('keyboard'),
        Mouse: createIcon('mouse'),
        Printer: createIcon('printer'),
        MemoryStick: createIcon('memory-stick'),
        Router: createIcon('router'),
        Ear: createIcon('ear'),
        Lightbulb: createIcon('lightbulb'),
        Thermometer: createIcon('thermometer'),
        Wind: createIcon('wind'),
        Umbrella: createIcon('umbrella'),
        Snowflake: createIcon('snowflake'),
        Droplets: createIcon('droplets'),
        Leaf: createIcon('leaf'),
        Flower: createIcon('flower'),
        Trees: createIcon('trees'),
        Mountain: createIcon('mountain'),
        Waves: createIcon('waves'),
        Sunrise: createIcon('sunrise'),
        Archive: createIcon('archive'),
        Navigation: createIcon('navigation'),
        MessageSquare: createIcon('message-square'),
        Audio: createIcon('audio'),
        Energy: createIcon('energy')
    };
});

// Mock theme context
vi.mock('../src/contexts/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'dark',
        toggleTheme: vi.fn(),
        setTheme: vi.fn()
    })
}))

// Mock performance context
vi.mock('../src/contexts/PerformanceContext', () => ({
    usePerformance: () => ({
        performanceMode: 'balanced',
        setPerformanceMode: vi.fn(),
        metrics: {
            renderTime: 16,
            bundleSize: 213000,
            coreWebVitals: { fcp: 1.2, lcp: 2.1, cls: 0.1 }
        }
    })
}))

// Mock Canvas/WebGL APIs to prevent canvas-related errors
Object.defineProperty(window, 'HTMLCanvasElement', {
    value: class {
        getContext() {
            return {
                fillRect: vi.fn(),
                clearRect: vi.fn(),
                drawImage: vi.fn(),
                getImageData: vi.fn(),
                putImageData: vi.fn(),
                createImageData: vi.fn(),
                setTransform: vi.fn(),
                translate: vi.fn(),
                scale: vi.fn(),
                rotate: vi.fn(),
                save: vi.fn(),
                restore: vi.fn()
            }
        }
        toDataURL() {
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }
    }
})

// Mock window.requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
    value: (callback: FrameRequestCallback) => {
        return setTimeout(callback, 16);
    }
});

Object.defineProperty(window, 'cancelAnimationFrame', {
    value: (id: number) => {
        clearTimeout(id);
    }
});

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: vi.fn(() => []),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Mock scroll behavior
Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true
})

// Mock DOM element methods
const mockGetBoundingClientRect = vi.fn(() => ({
    top: 100,
    left: 0,
    bottom: 200,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 100
}))

// Mock document.getElementById to return a mock element
const originalGetElementById = document.getElementById
document.getElementById = vi.fn((id: string) => {
    const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect,
        getAttribute: vi.fn(() => id),
        setAttribute: vi.fn(),
        textContent: '',
        style: {},
        scrollIntoView: vi.fn()
    }
    return mockElement as any
})

// Mock window.pageYOffset
Object.defineProperty(window, 'pageYOffset', {
    value: 0,
    writable: true
})