import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, MemoryRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

/**
 * HashRouter works on any static host with no server config.
 * Swap to BrowserRouter once the host rewrites unknown paths to index.html.
 * The single-file preview build uses MemoryRouter (VITE_ROUTER=memory).
 */
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : HashRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
