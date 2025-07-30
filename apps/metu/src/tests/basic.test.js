// Basic test to verify Jest configuration works
describe('METU Basic Tests', () => {
    test('Jest configuration is working', () => {
        expect(1 + 1).toBe(2);
    });

    test('Environment is properly set up', () => {
        expect(typeof window).toBe('object');
        expect(typeof document).toBe('object');
    });

    test('Web APIs are mocked', () => {
        expect(global.SpeechRecognition).toBeDefined();
        expect(global.speechSynthesis).toBeDefined();
        expect(global.AudioContext).toBeDefined();
    });
});
