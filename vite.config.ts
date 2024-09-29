// vite.config.ts
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        UnoCSS({
            configFile: './uno.config.ts',
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    server: {
        // port: 8082,
        proxy: {
            '/api': {
                target: 'http://legion-4g.yaklang.com:8080/',
                // 高鹏本地
                // target: 'http://192.168.3.3:8082/',
                changeOrigin: true,
            },
        },
        host: '0.0.0.0',
        hmr: true,
    },
});

// $r2}#TqJn$5dQYB]^0(J

// rewrite: (path) => path,
// .replace(/^\/api/, ''),
// bypass(req, res, options) {
//     const proxyUrl =
//         new URL(
//             options?.rewrite(req.url) || '',
//             options.target as string,
//         ).href || '';
//     console.log(proxyUrl);
//     req.headers['x-req-proxyUrl'] = proxyUrl;
//     res.setHeader('x-res-proxyUrl', proxyUrl);
// },
