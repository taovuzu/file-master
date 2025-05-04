import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const isProduction = mode === 'production';
  const proxy_url = process.env.VITE_API_BASE_URL || process.env.VITE_BACKEND_SERVER || 'http://localhost:8080/';

  const config = {
    plugins: [
      react({
        babel: {
          plugins: isProduction 
            ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] 
            : [],
        },
      }),
      tailwindcss(),
    ],
    resolve: {
      base: '/',
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };

  if (isProduction) {
    config.build = {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
      cssCodeSplit: true,
      treeshake: true,
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux'],
            'ui-vendor': ['antd', '@ant-design/icons', '@ant-design/pro-layout'],
            'pdf-vendor': ['pdf-lib', 'pdfjs-dist', 'react-pdf'],
            'utils-vendor': ['axios', 'fabric', 'react-dropzone', 'react-window'],
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    };
  } else {
    config.server = {
      port: 3000,
      hmr: {
        host: 'localhost',
        port: 3000,
        protocol: 'ws',
      },
      proxy: {
        '/api': {
          target: proxy_url,
          changeOrigin: true,
          secure: false,
        },
      },
    };
    config.optimizeDeps = {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'antd',
        '@ant-design/icons',
      ],
      exclude: ['@vite/client', '@vite/env'],
    };
    config.esbuild = {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    };
  }

  return defineConfig(config);
};
