// import React from 'react';

import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { ThemeProvider } from './theme';

import 'virtual:uno.css';

import 'dayjs/locale/zh-cn';

import './index.scss';

import App from './App.tsx';

// Conditionally load IRify styles
const APP_MODE = import.meta.env.VITE_APP_MODE;
if (APP_MODE === 'irify') {
    import('./styles/irify.scss');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
    <HashRouter>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </HashRouter>,
    // </React.StrictMode>,
);
