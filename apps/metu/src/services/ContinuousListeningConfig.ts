import { ContinuousListeningConfig } from './voice/ContinuousListeningService';

export const createDefaultContinuousListeningConfig = (): ContinuousListeningConfig => {
    return {
        azureOpenAI: {
            apiKey: process.env.AZURE_OPENAI_API_KEY || '',
            endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime-preview',
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview'
        },
        conversationConfig: {
            maxContextLength: 4000,
            responseTimeout: 30000,
            interruptionEnabled: true,
            autoResponse: true
        },
        audioConfig: {
            playbackVolume: 0.8,
            microphoneGain: 1.0
        },
        vadConfig: {
            sampleRate: 16000,
            frameSize: 1024,
            aggressiveness: 1,
            minSpeechLength: 300,
            maxSilenceLength: 1000,
            energyThreshold: 0.01,
            bufferSize: 4096
        }
    };
};
