import path from 'path';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'


export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const proxy_url = process.env.VITE_API_BASE_URL || process.env.VITE_BACKEND_SERVER || 'http://localhost:8080/';

  const isProduction = mode === 'production';

  const config = {
    plugins: [
      react({
        // Enable React Fast Refresh for better DX
        fastRefresh: true,
        // Optimize JSX runtime
        jsxRuntime: 'automatic',
        // Enable babel optimization
        babel: {
          plugins: isProduction ? [
            // Remove console logs in production
            ['transform-remove-console', { exclude: ['error', 'warn'] }]
          ] : []
        }
      }), 
      tailwindcss()
    ],
    resolve: {
      base: '/',
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: proxy_url,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      // Optimize build output
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: !isProduction,
      
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          // Separate vendor chunks for better caching
          manualChunks: {
            // React ecosystem
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Redux ecosystem
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux'],
            // UI libraries
            'ui-vendor': ['antd', '@ant-design/icons', '@ant-design/pro-layout'],
            // PDF libraries
            'pdf-vendor': ['pdf-lib', 'pdfjs-dist', 'react-pdf'],
            // Utility libraries
            'utils-vendor': ['axios', 'fabric', 'react-dropzone', 'react-window']
          },
          // Optimize chunk file names for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
            return `assets/[name]-[hash].js`;
          },
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      
      // Optimize bundle size
      chunkSizeWarningLimit: 1000,
      
      // Enable CSS code splitting
      cssCodeSplit: true,
      
      // Optimize asset handling
      assetsInlineLimit: 4096,
      
      // Enable tree shaking
      treeshake: true
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'antd',
        '@ant-design/icons'
      ],
      exclude: ['@vite/client', '@vite/env']
    },
    
    // Enable esbuild for faster builds
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  };
  return defineConfig(config);
};