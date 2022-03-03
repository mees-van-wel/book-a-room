import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import shimReactPdf from 'vite-plugin-shim-react-pdf';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), shimReactPdf(), tsconfigPaths()],
});
