export const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
};

export const isTablet = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
};

export const getViewportSize = () => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
};