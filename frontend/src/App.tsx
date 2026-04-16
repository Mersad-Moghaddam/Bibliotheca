import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { Card } from './components/ui/card'
import AppLayout from './layouts/AppLayout'
import { useToast } from './shared/toast/toast-provider'
import { Protected } from './utils/hooks'

const Landing = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Landing })))
const Login = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Login })))
const Register = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Register })))
const Dashboard = lazy(() => import('./pages/AppPages').then((m) => ({ default: m.Dashboard })))
const Library = lazy(() => import('./pages/AppPages').then((m) => ({ default: m.Library })))
const Reading = lazy(() => import('./pages/AppPages').then((m) => ({ default: m.Reading })))
const Finished = lazy(() => import('./pages/AppPages').then((m) => ({ default: m.Finished })))
const Next = lazy(() => import('./pages/AppPages').then((m) => ({ default: m.Next })))
const Wishlist = lazy(() => import('./pages/AppPages').then((m) => ({ default: m.Wishlist })))
const BookDetails = lazy(() => import('./pages/AppPages').then((m) => ({ default: m.BookDetails })))
const Profile = lazy(() => import('./pages/AppPages').then((m) => ({ default: m.Profile })))

const PageLoader = () => (
  <div className="mx-auto max-w-6xl p-6">
    <Card className="p-8 text-sm text-mutedForeground">Loading page…</Card>
  </div>
)

const BookDetailsRoute = () => {
  const { id = '' } = useParams()
  return <BookDetails id={id} />
}

const AppProtectedPage = ({ children }: { children: ReactNode }) => (
  <Protected>
    <AppLayout>{children}</AppLayout>
  </Protected>
)

function NetworkStateToasts() {
  const toast = useToast()

  useEffect(() => {
    const onOffline = () => {
      toast.error('You are offline. Some actions may not work until connection is restored.', {
        dedupeKey: 'offline-state'
      })
    }

    const onOnline = () => {
      toast.success('Back online. Libro is connected again.', {
        dedupeKey: 'online-state',
        durationMs: 2500
      })
    }

    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)

    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [toast])

  return null
}

export default function App() {
  return (
    <>
      <NetworkStateToasts />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <AppProtectedPage>
                <Dashboard />
              </AppProtectedPage>
            }
          />
          <Route
            path="/library"
            element={
              <AppProtectedPage>
                <Library />
              </AppProtectedPage>
            }
          />
          <Route
            path="/reading"
            element={
              <AppProtectedPage>
                <Reading />
              </AppProtectedPage>
            }
          />
          <Route
            path="/finished"
            element={
              <AppProtectedPage>
                <Finished />
              </AppProtectedPage>
            }
          />
          <Route
            path="/next"
            element={
              <AppProtectedPage>
                <Next />
              </AppProtectedPage>
            }
          />
          <Route
            path="/wishlist"
            element={
              <AppProtectedPage>
                <Wishlist />
              </AppProtectedPage>
            }
          />
          <Route
            path="/books/:id"
            element={
              <AppProtectedPage>
                <BookDetailsRoute />
              </AppProtectedPage>
            }
          />
          <Route
            path="/profile"
            element={
              <AppProtectedPage>
                <Profile />
              </AppProtectedPage>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  )
}
