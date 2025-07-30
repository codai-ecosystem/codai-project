/**
 * Timer type compatibility fix for Node.js/Browser environments
 * 
 * This resolves the TypeScript compilation errors where setInterval/setTimeout
 * return different types in Node.js (NodeJS.Timeout) vs Browser (number)
 */

// Use the correct timer types based on environment
export type TimerHandle = ReturnType<typeof setTimeout>;
export type IntervalHandle = ReturnType<typeof setInterval>;

// Helper functions to safely handle timers
export const safeSetTimeout = (callback: () => void, delay: number): TimerHandle => {
    return setTimeout(callback, delay);
};

export const safeSetInterval = (callback: () => void, interval: number): IntervalHandle => {
    return setInterval(callback, interval);
};

export const safeClearTimeout = (handle: TimerHandle): void => {
    clearTimeout(handle);
};

export const safeClearInterval = (handle: IntervalHandle): void => {
    clearInterval(handle);
};
