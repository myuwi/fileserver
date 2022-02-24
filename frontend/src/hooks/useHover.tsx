import { useEffect, useState, useRef } from 'react';

export const useHover = <T extends HTMLElement>() => {
    const [value, setValue] = useState(false);

    const ref = useRef<T>(null);

    const handleMouseOver = () => setValue(true);
    const handleMouseOut = () => setValue(false);

    useEffect(() => {
        const node = ref.current;

        if (node) {
            node.addEventListener('mouseover', handleMouseOver);
            node.addEventListener('mouseout', handleMouseOut);

            return () => {
                node.removeEventListener('mouseover', handleMouseOver);
                node.removeEventListener('mouseout', handleMouseOut);
            };
        }
    }, []);

    return [ref, value] as [React.RefObject<T>, boolean];
};
