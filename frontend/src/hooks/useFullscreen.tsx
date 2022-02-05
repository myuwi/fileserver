import { useEffect, useState } from 'react';

export const useFullscreen = (nodeRef: React.MutableRefObject<HTMLElement | null>): [boolean, (state: boolean) => void, () => void] => {
    const [fullscreen, setFullscreenState] = useState(false);

    const toggleFullScreen = () => {
        const target = nodeRef.current;
        if (!target) return;

        if (!document.fullscreenElement) {
            target.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const setFullscreen = (state: boolean) => {
        const target = nodeRef.current;
        if (!target) return;

        if (state) {
            target.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleFullscreenToggle = () => {
        if (document.fullscreenElement) {
            setFullscreenState(true);
        } else {
            setFullscreenState(false);
        }
    };

    useEffect(() => {
        const target = nodeRef.current;
        if (!target) return;

        target.addEventListener('webkitfullscreenchange', handleFullscreenToggle);
        target.addEventListener('mozfullscreenchange', handleFullscreenToggle);
        target.addEventListener('msfullscreenchange', handleFullscreenToggle);
        target.addEventListener('fullscreenchange', handleFullscreenToggle);

        return () => {
            target.removeEventListener('webkitfullscreenchange', handleFullscreenToggle);
            target.removeEventListener('mozfullscreenchange', handleFullscreenToggle);
            target.removeEventListener('msfullscreenchange', handleFullscreenToggle);
            target.removeEventListener('fullscreenchange', handleFullscreenToggle);
        };
    }, [nodeRef]);


    return [fullscreen, setFullscreen, toggleFullScreen];
};
