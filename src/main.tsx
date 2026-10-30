import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

/**
 * Routers:
 *  - default: BrowserRouter, clean URLs (/about) that search engines index.
 *    Needs a host that serves index.html for unknown paths (Cloudflare Pages does).
 *  - VITE_ROUTER=hash: /#/about URLs, for hosts with no rewrite support.
 *  - VITE_ROUTER=memory: the single-file preview build.
 */
const mode = import.meta.env.VITE_ROUTER
const Router = mode === 'memory' ? MemoryRouter : mode === 'hash' ? HashRouter : BrowserRouter

// Old links like /#/about (from the earlier hash URLs) move to /about.
if (mode !== 'memory' && mode !== 'hash' && window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router basename={mode === 'memory' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <App />
    </Router>
  </StrictMode>,
)
