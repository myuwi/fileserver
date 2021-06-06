import { useRef } from 'react';

type MouseEventFn = (e: React.MouseEvent) => void;

const useLongPress = (onClick: MouseEventFn, onDoubleClick: MouseEventFn, onLongPress: MouseEventFn) => {
    // console.log('useLongPress render')
    const longPressTriggered = useRef(false);

    const doubleClickDelay = 200;
    const doubleClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const longPressDelay = 500;
    const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startCoords = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const shouldTriggerClick = useRef(false);

    const checkMove = ({ x, y }: { x: number, y: number }) => {
        if (!shouldTriggerClick.current) return;

        // console.log(coords.current)
        // console.log(startCoords.current)

        const movedX = Math.abs(startCoords.current.x - x) > 20;
        const movedY = Math.abs(startCoords.current.y - y) > 20;
        // console.log(movedX, movedY)

        if (movedX || movedY) {
            // console.log('[Debug] Moved too far, canceling click event.')
            clear(null, true);
        }
    };

    const start = (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        // console.log(e.buttons)

        if (!e.buttons || e.buttons & 1) {
            shouldTriggerClick.current = true;

            switch (e.type) {
                case 'mousedown':
                    startCoords.current = {
                        x: e.clientX,
                        y: e.clientY
                    };
                    break;
                case 'touchstart':
                    startCoords.current = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };
                    break;
            }

            longPressTimeout.current = setTimeout(() => {
                if (shouldTriggerClick.current) {
                    onLongPress(e);
                    longPressTriggered.current = true;
                }
            }, longPressDelay);
        }
    };

    const move = (e: any) => {
        if (!shouldTriggerClick.current || !longPressTimeout.current || longPressTriggered.current) return;
        // console.log('move')
        // console.log(e.type)

        switch (e.type) {
            case 'mousemove':
                if (e.buttons === 1) {
                    checkMove({
                        x: e.clientX,
                        y: e.clientY
                    });
                }
                break;
            case 'touchmove':
                checkMove({
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                });
                break;
        }
    };

    const clear = (e: any, disableClick = false) => {
        if (e) {
            if (e.cancelable) {
                e.preventDefault();
            }
            e.stopPropagation();
        }

        // console.log('clear')

        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }

        if (!disableClick && shouldTriggerClick.current && !longPressTriggered.current) {
            if (doubleClickTimeout.current !== null) {
                clearTimeout(doubleClickTimeout.current);
                doubleClickTimeout.current = null;
                onDoubleClick(e);
            } else {
                onClick(e);

                // if (typeof onDoubleClick === 'function') {
                doubleClickTimeout.current = setTimeout(() => {
                    if (doubleClickTimeout.current) {
                        clearTimeout(doubleClickTimeout.current);
                    }

                    doubleClickTimeout.current = null;
                }, doubleClickDelay);
                // }
            }
        }

        shouldTriggerClick.current = false;
        longPressTriggered.current = false;
    };

    return {
        onMouseDown: (e: React.MouseEvent) => start(e),
        onMouseMove: (e: React.MouseEvent) => move(e),
        onMouseUp: (e: React.MouseEvent) => clear(e),
        // onMouseLeave: e => clear(e, true),
        onTouchStart: (e: React.TouchEvent) => start(e),
        onTouchMove: (e: React.TouchEvent) => move(e),
        onTouchEnd: (e: React.TouchEvent) => clear(e)
    };
};

export { useLongPress };