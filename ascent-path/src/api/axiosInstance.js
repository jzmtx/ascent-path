import axios from 'axios'

const API = 'http://localhost:8000'

const axiosInstance = axios.create({
    baseURL: API,
    headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach access token ─────────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)

// ── Response interceptor — auto-refresh on 401 ───────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error)
        else prom.resolve(token)
    })
    failedQueue = []
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        if (error.response?.status === 401 && !original._retry) {
            if (isRefreshing) {
                // Queue up requests while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            original.headers.Authorization = `Bearer ${token}`
                            resolve(axiosInstance(original))
                        },
                        reject: (err) => reject(err),
                    })
                })
            }

            original._retry = true
            isRefreshing = true

            const refresh = localStorage.getItem('refresh_token')
            if (!refresh) {
                isRefreshing = false
                // No refresh token — force logout via page redirect
                localStorage.removeItem('access_token')
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const res = await axios.post(`${API}/api/auth/token/refresh/`, { refresh })
                const { access } = res.data
                localStorage.setItem('access_token', access)
                axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`
                processQueue(null, access)
                original.headers.Authorization = `Bearer ${access}`
                return axiosInstance(original)
            } catch (refreshError) {
                processQueue(refreshError, null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
