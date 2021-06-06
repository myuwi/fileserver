import { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { LOGGER } from '../LOGGER';

const useCustomHistory = () => {
    const location = useLocation();
    const history = useHistory();

    const lastKey = useRef<string | null>(null);

    const [canGoForward, setCanGoForward] = useState(false);
    const [canGoBack, setCanGoBack] = useState(false);

    const stack = useRef<string[]>(['a']);

    const getStack = (): string[] => {
        LOGGER.debug('Getting History Stack from Session Storage');

        const h = sessionStorage.getItem('history');

        return h ? JSON.parse(h) : [];
    };

    const setStack = (newStack: string[]) => {
        LOGGER.debug('Setting stack to', newStack);
        stack.current = newStack;
        sessionStorage.setItem('history', JSON.stringify(newStack));
    };

    if (stack.current[0] === 'a') {
        stack.current = getStack();
    }

    const [stackState, setStackState] = useState(stack.current);

    useEffect(() => {
        // For some reason the first render of the page
        // doesn't have a key so we'll give it a key of 'aaaaaa'
        const currentKey = location.key || 'aaaaaa';

        // console.log(history, location)
        // console.log('Last Key', lastKey.current)

        if (!stack.current.length) {
            setStack([currentKey]);
        }

        const currentIndex = stack.current.indexOf(lastKey.current || currentKey);
        // console.log('Current Index', currentIndex)

        const action = history.action;
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

export { useCustomHistory };
