import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/router', () => ({
    useRouter: () => ({
        push: vi.fn(),
        pathname: '/',
        query: {},
        asPath: '/'
    })
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams()
}))

// Mock Next.js Image
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
        return React.createElement("img", { src, alt, ...props })
    },
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
    default: vi.fn(({ children }) => children)
}))
