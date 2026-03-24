// import React from 'react';

import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './theme';

import 'virtual:uno.css';

import 'dayjs/locale/zh-cn';

import './index.scss';

import App from './App.tsx';

const APP_MODE = import.meta.env.VITE_APP_MODE;
if (APP_MODE === 'irify') {
    import('./styles/irify.scss');
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <HashRouter>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </QueryClientProvider>
    </HashRouter>,
);
