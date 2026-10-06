import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

// The cloudflare() plugin runs the Worker (worker/index.js) inside the Vite
// dev server, so the React app and /api/* share one local address.
export default defineConfig({
  plugins: [react(), cloudflare()],
});
