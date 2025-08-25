export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
        const patterns = {
            light: 10,
            medium: 50, 
            heavy: 100
        };
        navigator.vibrate(patterns[type]);
    }
};

export const preventZoom = () => {
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });
};