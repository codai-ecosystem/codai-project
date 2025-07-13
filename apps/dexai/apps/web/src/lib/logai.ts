/**
 * LogAI Integration for DexAI
 * Centralized logging for Romanian Dictionary operations
 */

interface LogEvent {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp?: Date;
}

class DexAILogger {
  private appName = 'DexAI';
  private version = '2.0.0';

  constructor() {
    this.log('info', 'DexAI Logger initialized', { version: this.version });
  }

  log(level: LogEvent['level'], message: string, context?: Record<string, any>) {
    const logEvent: LogEvent = {
      level,
      message,
      context: {
        app: this.appName,
        version: this.version,
        timestamp: new Date().toISOString(),
        ...context
      },
      timestamp: new Date()
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${this.appName}: ${message}`, context);
    }

    // TODO: When LogAI SDK is available, send to centralized logging
    // await LogAI.track(logEvent);
  }

  // Dictionary search logging
  searchWord(word: string, results: number) {
    this.log('info', 'Dictionary search performed', {
      action: 'search',
      word,
      resultsCount: results
    });
  }

  // AI assistance logging
  aiAssistance(query: string, responseType: string) {
    this.log('info', 'AI assistance requested', {
      action: 'ai_assistance',
      query,
      responseType
    });
  }

  // Text-to-speech logging
  textToSpeech(text: string, language: string) {
    this.log('info', 'Text-to-speech generated', {
      action: 'tts',
      textLength: text.length,
      language
    });
  }

  // Error logging
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, {
      error: error?.message,
      stack: error?.stack,
      ...context
    });
  }

  // Performance logging
  performance(action: string, duration: number, context?: Record<string, any>) {
    this.log('info', `Performance: ${action}`, {
      action: 'performance',
      operation: action,
      duration,
      ...context
    });
  }
}

// Export singleton instance
export const dexaiLogger = new DexAILogger();
export default dexaiLogger;
