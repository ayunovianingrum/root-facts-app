import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
  assetsInclude: ['**/*.onnx', '**/*.wasm'],
  worker: {
    format: 'es',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['model/**/*', '**/*.onnx', '**/*.wasm'],

      workbox: {
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,wasm,onnx}',
          'model/**/*',
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/huggingface\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hf-models-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn-lfs.*\.huggingface\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hf-models-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Root Facts - AI Vegetables Recognition',
        short_name: 'Root Facts',
        description:
          'An AI-powered web app that uses your camera to instantly recognize vegetables and reveal fun, surprising facts about them in real time.',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-icon-x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/maskable-icon-x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/root-facts-001.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide',
            label:
              'Meet Root Fact — point your camera to discover vegetables in real time.',
          },
          {
            src: '/screenshots/root-facts-002.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide',
            label:
              'Live AI vision in action — scanning and recognizing vegetables instantly.',
          },
          {
            src: '/screenshots/root-facts-003.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide',
            label:
              'Detected! Get instant AI fun facts and surprising insights about your food.',
          },
          {
            src: '/screenshots/root-facts-004.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow',
            label:
              'Meet Root Fact — point your camera to discover vegetables in real time.',
          },
          {
            src: '/screenshots/root-facts-005.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow',
            label:
              'Live AI vision in action — scanning and recognizing vegetables instantly.',
          },
          {
            src: '/screenshots/root-facts-006.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow',
            label:
              'Detected! Get instant AI fun facts and surprising insights about your food.',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          tensorflow: ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-webgpu'],
          transformers: ['@huggingface/transformers'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
