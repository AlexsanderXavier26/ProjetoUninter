import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@app': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/app'),
            '@routes': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/routes'),
            '@layouts': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/layouts'),
            '@contexts': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/contexts'),
            '@components': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/components'),
            '@modules': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/modules'),
            '@services': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/services'),
            '@styles': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/styles'),
        },
    },
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:9999',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
