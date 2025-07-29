const { TestEnvironment } = require('jest-environment-jsdom');

/**
 * A custom environment to handle canvas issues and Web Speech API mocking
 */
class CustomJSDOMEnvironment extends TestEnvironment {
    constructor(...args) {
        const [config, context] = args;

        // Configure JSDOM to prevent canvas.node loading issues
        const testEnvironmentOptions = {
            ...config.testEnvironmentOptions,
            pretendToBeVisual: false,
            resources: 'usable',
            canvas: {
                // Disable canvas to prevent native module loading
                enable: false
            }
        };

        super({ ...config, testEnvironmentOptions }, context);
    }

    async setup() {
        await super.setup();

        // Mock Web Speech API
        this.global.SpeechRecognition = jest.fn(() => ({
            start: jest.fn(),
            stop: jest.fn(),
            abort: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            continuous: false,
            interimResults: false,
            lang: 'en-US'
        }));

        this.global.webkitSpeechRecognition = this.global.SpeechRecognition;

        this.global.SpeechSynthesis = jest.fn(() => ({
            speak: jest.fn(),
            cancel: jest.fn(),
            pause: jest.fn(),
            resume: jest.fn(),
            getVoices: jest.fn(() => []),
            addEventListener: jest.fn()
        }));

        this.global.speechSynthesis = new this.global.SpeechSynthesis();

        this.global.SpeechSynthesisUtterance = jest.fn((text) => ({
            text: text || '',
            voice: null,
            volume: 1,
            rate: 1,
            pitch: 1,
            lang: 'en-US',
            addEventListener: jest.fn()
        }));

        // Mock canvas elements
        if (this.global.HTMLCanvasElement) {
            this.global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
                fillRect: jest.fn(),
                clearRect: jest.fn(),
                drawImage: jest.fn(),
                getImageData: jest.fn(() => ({
                    data: new Uint8ClampedArray(4)
                })),
                canvas: {
                    width: 0,
                    height: 0
                }
            }));

            this.global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,');
        }

        // Mock Audio API
        this.global.AudioContext = jest.fn(() => ({
            createAnalyser: jest.fn(() => ({
                connect: jest.fn(),
                disconnect: jest.fn(),
                getByteFrequencyData: jest.fn(),
                fftSize: 2048,
                frequencyBinCount: 1024
            })),
            createMediaStreamSource: jest.fn(() => ({
                connect: jest.fn(),
                disconnect: jest.fn()
            })),
            close: jest.fn(),
            resume: jest.fn()
        }));

        this.global.webkitAudioContext = this.global.AudioContext;

        // Mock navigator.mediaDevices
        this.global.navigator.mediaDevices = {
            getUserMedia: jest.fn(() => Promise.resolve({
                getTracks: jest.fn(() => []),
                getAudioTracks: jest.fn(() => []),
                getVideoTracks: jest.fn(() => [])
            }))
        };
    }
}

module.exports = CustomJSDOMEnvironment;
