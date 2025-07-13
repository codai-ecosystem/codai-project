/**
 * Utility functions for METU
 */

// Class name utility (similar to clsx)
export function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(' ');
}

// Format timestamp for display
export function formatTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
}

// Format duration in seconds to human readable
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Audio utility functions
export function normalizeAudioData(data: Float32Array): number[] {
    const normalized = [];
    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        if (value !== undefined) {
            normalized.push(Math.abs(value));
        }
    }
    return normalized;
}

// Check if browser supports speech recognition
export function isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Check if browser supports speech synthesis
export function isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
}
