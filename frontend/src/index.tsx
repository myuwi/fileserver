/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as ReactDOM from 'react-dom';
import './index.css';
import { App } from './App';

ReactDOM.render(<App />, document.getElementById('root'));

// @ts-ignore
if (module['hot']) {
    // @ts-ignore
    module['hot'].accept();
}