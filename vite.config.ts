import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' so the site works under https://<user>.github.io/<repo>/
export default defineConfig({
  plugins: [react()],
  base: './',
});
