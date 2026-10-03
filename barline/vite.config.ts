import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  test: { include: ['src/**/*.test.ts'] },
  // `--mode artifact`: one self-contained file (scripts/artifact.mjs inlines JS and CSS).
  build:
    mode === 'artifact'
      ? { outDir: 'dist-artifact', assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false }
      : undefined,
}));
