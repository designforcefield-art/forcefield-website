import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/site/Layout'
import { ToastProvider } from './components/ui/Toast'
import About from './pages/About'
import GetStarted from './pages/GetStarted'
import Discovery from './pages/Discovery'
import Home from './pages/Home'
import { Industries } from './pages/Industries'
import NotFound from './pages/NotFound'
import SolutionDetail from './pages/SolutionDetail'
import Solutions from './pages/Solutions'
import { PickProvider } from './state/PickContext'

export default function App() {
  return (
    <ToastProvider>
      <PickProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="solutions" element={<SolutionsRoute />} />
              <Route path="solutions/:id" element={<SolutionDetail />} />
              <Route path="industries" element={<Industries />} />
              {/* Industry detail pages were removed; old links land on the industries list. */}
              <Route path="industries/:id" element={<Navigate to="/industries" replace />} />
              {/* The Solution Finder was removed; old links land on the solutions page. */}
              <Route path="finder" element={<Navigate to="/solutions" replace />} />
              <Route path="discovery" element={<Discovery />} />
              <Route path="contact" element={<GetStartedRoute />} />
              <Route path="get-started" element={<GetStartedRoute />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
      </PickProvider>
    </ToastProvider>
  )
}

/** Remount when the address changes so the right tab / preselected service apply. */
function GetStartedRoute() {
  const { key } = useLocation()
  return <GetStarted key={key} />
}

/** Remount on ?industry= / ?category= changes (e.g. footer links while already on the page). */
function SolutionsRoute() {
  const { search } = useLocation()
  return <Solutions key={search} />
}
