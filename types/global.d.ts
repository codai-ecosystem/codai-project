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

      // Azure AI Services
      AZURE_AI_FOUNDRY_ENDPOINT?: string;
      AZURE_AI_FOUNDRY_KEY?: string;
      AZURE_OPENAI_ENDPOINT?: string;
      AZURE_OPENAI_KEY?: string;
      AZURE_OPENAI_API_VERSION?: string;
      AZURE_SEARCH_ENDPOINT?: string;
      AZURE_SEARCH_KEY?: string;

      // Azure AI Resource Information
      AZURE_RESOURCE_GROUP?: string;
      AZURE_LOCATION?: string;
      AZURE_SUBSCRIPTION_ID?: string;
      AZURE_AI_FOUNDRY_NAME?: string;
      AZURE_AI_HUB_NAME?: string;
      AZURE_OPENAI_NAME?: string;
      AZURE_SEARCH_NAME?: string;

      // Azure OpenAI Model Deployments
      AZURE_OPENAI_MODELS?: string;
      AZURE_OPENAI_GPT4O_DEPLOYMENT?: string;
      AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT?: string;
      AZURE_OPENAI_WHISPER_DEPLOYMENT?: string;
      AZURE_OPENAI_GPT35_DEPLOYMENT?: string;

      // Voice and Speech Configuration
      VOICE_PROVIDER?: string;
      AZURE_SPEECH_KEY?: string;
      AZURE_SPEECH_REGION?: string;
      VOICE_MODEL?: string;
      SPEECH_TO_TEXT_MODEL?: string;
      TEXT_TO_SPEECH_MODEL?: string;

      // Language Configuration
      DEFAULT_LANGUAGE?: string;
      SUPPORTED_LANGUAGES?: string;
      AUTO_DETECT_LANGUAGE?: string;
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
      interface Matchers<R = void> extends TestingLibraryMatchers<typeof expect.stringContaining, R> { }
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

export { };