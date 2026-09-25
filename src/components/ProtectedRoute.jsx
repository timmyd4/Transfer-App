import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Wrap any page that should only be visible while logged in.
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="page-loading">Loading...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
