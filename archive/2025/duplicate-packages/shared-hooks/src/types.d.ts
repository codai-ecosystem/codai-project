// Temporary type fix for browser environment
declare global {
    interface Window {
        localStorage: Storage;
        addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
        removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
    }
    interface Navigator {
        onLine: boolean;
    }
    const window: Window;
    const navigator: Navigator;
}

export { };
