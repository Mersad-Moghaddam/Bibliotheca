import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import {
  Dashboard,
  Library,
  Reading,
  Finished,
  Next,
  Wishlist,
  BookDetails,
  Profile
} from './pages/AppPages'
import { Landing, Login, Register } from './pages/AuthPages'
import { Protected } from './utils/hooks'

const BookDetailsRoute = () => {
  const { id = '' } = useParams()
  return <BookDetails id={id} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/library"
        element={
          <Protected>
            <AppLayout>
              <Library />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/reading"
        element={
          <Protected>
            <AppLayout>
              <Reading />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/finished"
        element={
          <Protected>
            <AppLayout>
              <Finished />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/next"
        element={
          <Protected>
            <AppLayout>
              <Next />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/wishlist"
        element={
          <Protected>
            <AppLayout>
              <Wishlist />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/books/:id"
        element={
          <Protected>
            <AppLayout>
              <BookDetailsRoute />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <AppLayout>
              <Profile />
            </AppLayout>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
