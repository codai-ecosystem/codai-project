// Global type definitions for Codai ecosystem

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL?: string;
      REDIS_HOST?: string;
      REDIS_PORT?: string;
      REDIS_PASSWORD?: string;
      JWT_SECRET?: string;
      NEXT_PUBLIC_API_URL?: string;
    }
  }

  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Module declarations for missing types
declare module '@testing-library/jest-dom' {
  import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
  
  declare global {
    namespace jest {
      interface Matchers<R = void> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
    }
  }
}

declare module 'testing-library__jest-dom' {
  export * from '@testing-library/jest-dom';
}

// Common library declarations
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

export {};