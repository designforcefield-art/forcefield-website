import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`          → standard static build in dist/ (HashRouter, deploy anywhere)
// `npm run build:artifact` → single self-contained HTML file (MemoryRouter) for previews
export default defineConfig(({ mode }) => ({
  // Clean URLs need absolute asset paths; the preview and hash builds stay relative.
  base: mode === 'artifact' || process.env.VITE_ROUTER === 'hash' ? './' : process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss(), ...(mode === 'artifact' ? [viteSingleFile()] : [])],
  build: mode === 'artifact' ? { outDir: 'dist-artifact' } : undefined,
}))
