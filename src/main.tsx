// import React from 'react';

import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import locale from 'antd/locale/zh_CN';

import 'virtual:uno.css';

import 'dayjs/locale/zh-cn';

import './index.scss';

import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
    <HashRouter>
        <ConfigProvider locale={locale}>
            <App />
        </ConfigProvider>
    </HashRouter>,
    // </React.StrictMode>,
);
