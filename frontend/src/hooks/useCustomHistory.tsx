import { useEffect, useState, useRef } from 'react';
import { useNavigationType, useLocation } from 'react-router-dom';
import { LOGGER } from '../LOGGER';

export const useCustomHistory = () => {
    const location = useLocation();
    const navigationType = useNavigationType();

    const lastKey = useRef<string | null>(null);

    const [canGoForward, setCanGoForward] = useState(false);
    const [canGoBack, setCanGoBack] = useState(false);

    const stack = useRef<string[] | null>(null);

    const getStack = (): string[] => {
        if (stack.current === null) {
            LOGGER.debug('Getting History Stack from Session Storage');
            const h = sessionStorage.getItem('history');

            return h ? JSON.parse(h) : [];
        }

        return stack.current;
    };

    const setStack = (newStack: string[]) => {
        LOGGER.debug('Setting stack to', newStack);
        stack.current = newStack;
        sessionStorage.setItem('history', JSON.stringify(newStack));
    };

    const [stackState, setStackState] = useState(stack.current);

    useEffect(() => {
        // Get initial stack
        if (!stack.current) {
            stack.current = getStack();
        }

        const currentKey = location.key;

        // console.log(history, location)
        // console.log('Last Key', lastKey.current)

        if (!stack.current.length) {
            setStack([currentKey]);
        }

        const currentIndex = stack.current.indexOf(lastKey.current || currentKey);
        // console.log('Current Index', currentIndex)

        const action = navigationType;
        // console.log('ACTION: %s', action)

        switch (action) {
            case 'POP':
                // Used Arrows to navigate backwards or forwards
                break;
            case 'PUSH':
                const newStack = [...stack.current.slice(0, currentIndex + 1)];
                if (location.key) newStack.push(location.key);
                // console.log(newStack)
                setStack(newStack);
                break;
            case 'REPLACE':
                const modifiedStack = [...stack.current];
                modifiedStack[currentIndex] = currentKey;

                setStack(modifiedStack);
                break;
        }

        LOGGER.debug(`Current Key: ${currentKey}`);
        // console.log('Stack', stack.current)

        if (stack.current.includes(currentKey)) {
            setCanGoBack(currentKey !== stack.current[0]);
            setCanGoForward(currentKey !== stack.current[stack.current.length - 1]);
        } else {
            setCanGoBack(false);
            setCanGoForward(false);
        }

        setStackState(stack.current);

        lastKey.current = currentKey;
    }, [location]);

    // useEffect(() => {
    //     console.log(stack)
    // }, [stack])

    return { canGoForward, canGoBack, stack: stackState };
};
