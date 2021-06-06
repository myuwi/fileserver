import { useState, useEffect } from 'react';
import { LOGGER } from '../LOGGER';

export const useWindowSize = () => {
    const isClient = typeof window === 'object';

    const getSize = () => {
        return {
            width: isClient ? window.innerWidth : undefined,
            height: isClient ? window.innerHeight : undefined
        };
    };

    const [windowSize, setWindowSize] = useState(getSize);

    const handleResize = () => {
        setWindowSize(getSize());
        LOGGER.debug('getSize()', getSize());
    };

    useEffect(() => {
        if (!isClient) {
            return;
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowSize;
};
