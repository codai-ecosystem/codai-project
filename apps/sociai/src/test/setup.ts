import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: 'div',
        nav: 'nav',
        main: 'main',
        article: 'article',
        button: 'button',
        textarea: 'textarea',
        img: 'img',
        span: 'span',
        p: 'p',
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next/image
vi.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        return `<img src="${props.src}" alt="${props.alt || ''}" />`
    },
}))
