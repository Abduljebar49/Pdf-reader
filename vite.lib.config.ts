// vite.lib.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: 'tsconfig.lib.json', // ✅ THIS is the key
      insertTypesEntry: true,
      rollupTypes: true,
    })


  ],
  css: {
    postcss: './postcss.config.js', // ✅ ensure Tailwind runs
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PDFViewer',
      fileName: 'index',
      formats: ['es', 'umd'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true, // ✅ generate a separate index.css file
    rollupOptions: {
      external: ['react', 'react-dom', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lucide-react': 'LucideReact',
        },
        assetFileNames: (assetInfo) => {
          // ✅ force naming
          if (assetInfo.name?.endsWith('.css')) {
            return 'index.css';
          }
          return assetInfo.name!;
        },
      },
    },
  },
});
