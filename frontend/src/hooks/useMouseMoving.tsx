import * as React from 'react';
import { useEffect, useState, useRef } from 'react';

const useMouseMoving = (nodeRef: React.MutableRefObject<HTMLElement | null>, delay = 1000) => {
    const [mouseMoving, setMouseMoving] = useState(false);

    const mouseMoveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const mouseMove = () => {
        if (mouseMoveTimeout.current) {
            clearTimeout(mouseMoveTimeout.current);
        }

        if (!mouseMoving) setMouseMoving(true);

        mouseMoveTimeout.current = setTimeout(() => {
            if (mouseMoveTimeout.current) {
                clearTimeout(mouseMoveTimeout.current);
            }

            mouseMoveTimeout.current = null;
            return setMouseMoving(false);
        }, delay);
    };

    const mouseLeave = () => {
        // console.log('mouse leave')
        if (mouseMoveTimeout.current) {
            clearTimeout(mouseMoveTimeout.current);
        }

        mouseMoveTimeout.current = null;
        return setMouseMoving(false);
    };

    useEffect(() => {
        const target = nodeRef.current;
        if (!target) return;

        target.addEventListener('mousemove', mouseMove);
        target.addEventListener('mouseleave', mouseLeave);

        return () => {
            if (mouseMoveTimeout.current) {
                clearTimeout(mouseMoveTimeout.current);

            }
            mouseMoveTimeout.current = null;

            target.removeEventListener('mousemove', mouseMove);
            target.removeEventListener('mouseleave ', mouseLeave);
        };
    }, [nodeRef, delay]);

    return mouseMoving;
};

export { useMouseMoving };
