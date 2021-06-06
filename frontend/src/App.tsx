import { useEffect } from 'react';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { FileSystem } from './views/FileSystem';
import { useWindowSize } from './hooks/useWindowSize';

import { MobileProvider } from './context/MobileProvider';

import createPersistedState from 'use-persisted-state';
const useDarkMode = createPersistedState('darkMode');

const App = () => {
	const windowSize = useWindowSize();

	const [darkMode] = useDarkMode(false);

	useEffect(() => {
		document.documentElement.classList.toggle('theme-dark', darkMode);
	}, [darkMode]);

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
				<Switch>
					<Route path='/:id?' >
						<FileSystem />
					</Route>
				</Switch>
			</Router>
		</MobileProvider>
	);
};

export { App };
