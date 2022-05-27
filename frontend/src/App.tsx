import { useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FileSystem } from './views/FileSystem';
import { useWindowSize } from './hooks/useWindowSize';

import { MobileProvider } from './context/MobileProvider';

export const App = () => {
    const windowSize = useWindowSize();

    const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    useEffect(() => {
        setVh();

        window.addEventListener('resize', setVh);

        return () => {
            window.removeEventListener('resize', setVh);
        };
    }, [windowSize]);

    return (
        <MobileProvider>
            <Router>
                <Routes>
                    <Route index element={<FileSystem />} />
                    <Route path=":id" element={<FileSystem />} />
                </Routes>
            </Router>
        </MobileProvider>
    );
};
