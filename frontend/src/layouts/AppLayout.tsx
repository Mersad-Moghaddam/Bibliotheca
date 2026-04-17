import { type CSSProperties, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { DesktopSidebar } from './components/desktop-sidebar'
import { MobileDrawer } from './components/mobile-drawer'
import { MobileHeader } from './components/mobile-header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const mobileHeaderVars = {
    '--mobile-header-vpad': 'max(0.6rem, env(safe-area-inset-top))',
    '--mobile-header-offset': 'calc(2.5rem + (var(--mobile-header-vpad) * 2))'
  } as CSSProperties

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false)
      }
    }

    if (desktopQuery.matches) {
      setOpen(false)
    }

    desktopQuery.addEventListener('change', onDesktop)
    return () => desktopQuery.removeEventListener('change', onDesktop)
  }, [])

  return (
    <div className="app-shell" style={mobileHeaderVars}>
      <div className="container mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-3 px-3 pb-4 pt-[var(--mobile-header-offset)] sm:px-4 sm:pb-4 sm:pt-[var(--mobile-header-offset)] lg:grid-cols-[268px_minmax(0,1fr)] lg:gap-5 lg:px-6 lg:py-5">
        <MobileDrawer open={open} onClose={() => setOpen(false)} />
        <DesktopSidebar />

        <main className="min-w-0 space-y-4 pb-6 page-enter lg:space-y-5 lg:pb-8">
          <MobileHeader onMenuClick={() => setOpen(true)} />
          {children}
        </main>
      </div>
    </div>
  )
}
