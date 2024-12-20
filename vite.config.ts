// vite.config.ts
import UnoCSS from 'unocss/vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
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
                './cptable': 'cptable', // 指向已安装的模块
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        server: {
            // port: 8082,
            proxy: {
                '/api': {
                    target: env.VITE_BASE_URL,
                    changeOrigin: true,
                    rewrite: (path) => path,
                },
            },
            host: '0.0.0.0',
            hmr: true,
        },
        build: {
            sourcemap: mode === 'development',
        },
    };
});

// $r2}#TqJn$5dQYB]^0(J
