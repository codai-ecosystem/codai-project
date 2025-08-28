// Mock for framer-motion to prevent testing issues
const mockMotion = {
  div: 'div',
  span: 'span',
  a: 'a',
  button: 'button',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  p: 'p',
  section: 'section',
  header: 'header',
  nav: 'nav',
  main: 'main',
  footer: 'footer',
  article: 'article',
  aside: 'aside',
};

// Create a mock component factory
const createMockComponent = (tag) => {
  const MockComponent = ({ children, ...props }) => {
    const React = require('react');
    return React.createElement(tag, props, children);
  };
  MockComponent.displayName = `motion.${tag}`;
  return MockComponent;
};

// Apply mock components to motion object
Object.keys(mockMotion).forEach(key => {
  mockMotion[key] = createMockComponent(mockMotion[key]);
});

module.exports = {
  motion: mockMotion,
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useMotionValue: (initialValue) => ({
    get: () => initialValue,
    set: jest.fn(),
    on: jest.fn(),
  }),
  useTransform: () => ({
    get: () => 0,
    set: jest.fn(),
  }),
  useSpring: (value) => value,
  useCycle: (first) => [first, jest.fn()],
  usePresence: () => [true, jest.fn()],
  useReducedMotion: () => false,
  useScroll: () => ({
    scrollX: { get: () => 0 },
    scrollY: { get: () => 0 },
    scrollXProgress: { get: () => 0 },
    scrollYProgress: { get: () => 0 },
  }),
  useTime: () => 0,
  useVelocity: () => ({ get: () => 0 }),
  useViewportScroll: () => ({
    scrollX: { get: () => 0 },
    scrollY: { get: () => 0 },
    scrollXProgress: { get: () => 0 },
    scrollYProgress: { get: () => 0 },
  }),
  useElementScroll: () => ({
    scrollX: { get: () => 0 },
    scrollY: { get: () => 0 },
    scrollXProgress: { get: () => 0 },
    scrollYProgress: { get: () => 0 },
  }),
  useInView: () => true,
  useDragControls: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
};