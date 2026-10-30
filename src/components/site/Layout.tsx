import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MyPickDrawer } from '../MyPickDrawer'
import { Footer } from './Footer'
import { Header } from './Header'
import { RevealManager } from './Reveal'
import { WhatsAppFloat } from './WhatsAppFloat'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])
  return null
}

export function Layout() {
  return (
    <>
      <ScrollManager />
      <RevealManager />
      <Header />
      <main id="main" className="relative">
        <Outlet />
      </main>
      <Footer />
      <MyPickDrawer />
      <WhatsAppFloat />
    </>
  )
}
