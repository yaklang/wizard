// vite.config.ts
import UnoCSS from 'unocss/vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    console.log(env.VITE_BASE_URL, 'env.VITE_BASE_URL');
    return {
        base: './',
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
                    // target: 'http://legion-4g.yaklang.com:8080/pre/',
                    target: env.VITE_BASE_URL,
                    changeOrigin: true,
                    rewrite: (path) => path,
                },
            },
            host: '0.0.0.0',
            hmr: true,
        },
    };
});

// $r2}#TqJn$5dQYB]^0(J

// rewrite: (path) => path,
// .replace(/^\/api/, ''),
// bypass: (req, res, options) => {
//     const proxyUrl =
//         new URL(
//             options?.rewrite(req.url) || '',
//             options.target as string,
//         ).href || '';
//     console.log(proxyUrl, 'xxx');
//     req.headers['x-req-proxyUrl'] = proxyUrl;
//     res.setHeader('x-res-proxyUrl', proxyUrl);
// },
