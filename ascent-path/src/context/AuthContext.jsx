import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)        // { id, username, email, first_name, ... }
    const [token, setToken] = useState(null)       // access token
    const [loading, setLoading] = useState(true)   // true while checking stored session

    // ── Fetch user profile ────────────────────────────────────────────────────
    const fetchProfile = useCallback(async (accessToken) => {
        try {
            const res = await fetch(`${API}/api/auth/me/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            if (!res.ok) throw new Error('Unauthorized')
            const data = await res.json()
            setUser(data)
            return true
        } catch {
            return false
        }
    }, [])

    // ── Refresh access token using stored refresh token ────────────────────────
    const refreshAccessToken = useCallback(async () => {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) return null
        try {
            const res = await fetch(`${API}/api/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
            })
            if (!res.ok) throw new Error('Refresh failed')
            const data = await res.json()
            localStorage.setItem('access_token', data.access)
            setToken(data.access)
            return data.access
        } catch {
            // Refresh token expired — force logout
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            setUser(null)
            setToken(null)
            return null
        }
    }, [])

    // ── On app load — restore session from localStorage ────────────────────────
    useEffect(() => {
        const restore = async () => {
            const stored = localStorage.getItem('access_token')
            if (!stored) { setLoading(false); return }

            setToken(stored)
            const ok = await fetchProfile(stored)
            if (!ok) {
                // Try refresh
                const newToken = await refreshAccessToken()
                if (newToken) await fetchProfile(newToken)
            }
            setLoading(false)
        }
        restore()
    }, [fetchProfile, refreshAccessToken])

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback((accessToken, refreshToken, userData) => {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        setToken(accessToken)
        setUser(userData)
    }, [])

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setToken(null)
        setUser(null)
    }, [])

    // ── isAuthenticated shorthand ─────────────────────────────────────────────
    const isAuthenticated = !!token && !!user

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            login, logout, refreshAccessToken, fetchProfile,
            isAuthenticated,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
