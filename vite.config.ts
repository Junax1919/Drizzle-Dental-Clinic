import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function googleSheetsProxyPlugin(): Plugin {
  return {
    name: 'google-sheets-proxy',
    configureServer(server) {
      server.middlewares.use('/api/sheets-data', async (_req, res) => {
        try {
          const webhookUrl =
            'https://script.google.com/macros/s/AKfycbwNAfiMm4EggvNQvF5eVwZ9QWUXtM-Oxisk1nfxTAp6I4Sj95YbDKxf3uCBqKSpe0c/exec?action=getData';
          const response = await fetch(webhookUrl, { redirect: 'follow' });
          const data = await response.text();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(data);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Proxy error' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), googleSheetsProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
