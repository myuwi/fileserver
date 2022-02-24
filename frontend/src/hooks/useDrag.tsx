import { useEffect, useState, useRef } from 'react';

export const useDrag = (nodeRef: React.MutableRefObject<HTMLElement | null>) => {
    const [dragging, setDragging] = useState(false);

    const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

    const events = {
        mouse: {
            start: 'mousedown',
            move: 'mousemove',
            end: 'mouseup',
        },
        touch: {
            start: 'touchstart',
            move: 'touchmove',
            end: 'touchend',
        },
    };

    const inputType = useRef<'mouse' | 'touch'>('mouse');

    const handleDragStart = (e: MouseEvent | TouchEvent) => {
        // if (e.type === 'touchstart' && e.cancelable) {
        if (e.cancelable) {
            e.preventDefault();
        }

        setDragging(true);

        document.addEventListener(events[inputType.current].move, handleDrag);
        document.addEventListener(events[inputType.current].end, handleDragStop);
    };

    const handleDrag = (e: Event) => {
        if (e.type === 'mousemove' && !((e as MouseEvent).buttons & 1)) return;

        setCoords({
            x: (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX,
            y: (e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY,
        });
    };

    const handleDragStop = (e: Event) => {
        setDragging(false);

        document.removeEventListener(events[inputType.current].move, handleDrag);
        document.removeEventListener(events[inputType.current].end, handleDragStop);
    };

    const onMouseDown = (e: MouseEvent) => {
        inputType.current = 'mouse';
        return handleDragStart(e);
    };

    const onMouseUp = (e: MouseEvent) => {
        return handleDragStop(e);
    };

    const onTouchStart = (e: TouchEvent) => {
        inputType.current = 'touch';
        return handleDragStart(e);
    };

    const onTouchEnd = (e: TouchEvent) => {
        return handleDragStop(e);
    };

    useEffect(() => {
        const target = nodeRef.current;
        if (!target) return;

        target.addEventListener('touchstart', onTouchStart, { passive: false });
        target.addEventListener('mousedown', onMouseDown);

        target.addEventListener('touchend', onTouchEnd);
        target.addEventListener('mouseup', onMouseUp);

        // document.addEventListener('mousemove', handleDrag)

        return () => {
            target.removeEventListener('touchstart', onTouchStart);
            target.removeEventListener('mousedown', onMouseDown);

            target.removeEventListener('touchend', onTouchEnd);
            target.removeEventListener('mouseup', onMouseUp);

            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('touchmove', handleDrag);
        };
    }, []);

    return { coords, dragging };
};
