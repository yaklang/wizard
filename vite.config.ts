// vite.config.ts
import UnoCSS from 'unocss/vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const isIRify = mode.includes('irify');

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
                transformIndexHtml(html) {
                    const title = env.VITE_APP_TITLE || '自动化渗透系统';
                    let result = html.replace(
                        /<title>.*?<\/title>/,
                        `<title>${title}</title>`,
                    );

                    // Inject IRify favicon when in IRify mode
                    if (isIRify) {
                        result = result.replace(
                            /href="\.\/src\/assets\/compoments\/telecommunicationsLogo\.svg"/,
                            'href="/irify-favicon.svg"',
                        );
                    }
                    return result;
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
                    target: env.VITE_BASE_URL,
                    changeOrigin: true,
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
