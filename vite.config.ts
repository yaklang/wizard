// vite.config.ts
import UnoCSS from 'unocss/vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const isIRify = mode.includes('irify');
    const basicAuthUser = env.VITE_BASIC_AUTH_USER || '';
    const basicAuthPassword = env.VITE_BASIC_AUTH_PASSWORD || '';
    const proxyTarget = (() => {
        if (!env.VITE_BASE_URL) return env.VITE_BASE_URL;
        if (!basicAuthUser || !basicAuthPassword) return env.VITE_BASE_URL;
        try {
            const url = new URL(env.VITE_BASE_URL);
            url.username = basicAuthUser;
            url.password = basicAuthPassword;
            return url.toString();
        } catch {
            return env.VITE_BASE_URL;
        }
    })();

    return {
        base: './',
        plugins: [
            react(),
            UnoCSS({
                configFile: './uno.config.ts',
            }),
            // HTML transform plugin for title and favicon
            {
                name: 'html-transform',
                transformIndexHtml: {
                    order: 'pre',
                    handler(html) {
                        const title = env.VITE_APP_TITLE || '自动化渗透系统';
                        let result = html.replace(
                            /<title>.*?<\/title>/,
                            `<title>${title}</title>`,
                        );

                        if (isIRify) {
                            result = result.replace(
                                /<link\s+rel="icon"[\s\S]*?\/>/,
                                `<link rel="icon" type="image/svg+xml" href="./irify-favicon.svg" />`,
                            );
                        }
                        return result;
                    },
                },
            },
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
                    target: proxyTarget,
                    changeOrigin: true,
                    ws: true,
                    rewrite: (path) => path,
                },
            },
            host: '0.0.0.0',
            hmr: true,
        },
        build: {
            sourcemap: mode.includes('development'),
            outDir: isIRify ? 'dist-irify' : 'dist',
        },
    };
});
