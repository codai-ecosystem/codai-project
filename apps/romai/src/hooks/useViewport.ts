import { useState, useEffect } from 'react';

export function useViewport() {
    const [viewport, setViewport] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateViewport = () => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    return {
        ...viewport,
        isMobile: viewport.width < 768,
        isTablet: viewport.width >= 768 && viewport.width < 1024,
        isDesktop: viewport.width >= 1024
    };
}