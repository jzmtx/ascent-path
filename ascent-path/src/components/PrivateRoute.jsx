import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps any route that requires authentication.
 * Redirects to /login if the user is not authenticated.
 * Shows a spinner while auth state is being restored from localStorage.
 */
export default function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Restoring session...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        // Save the attempted URL so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}
