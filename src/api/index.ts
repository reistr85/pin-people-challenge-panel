import axios from 'axios'
import router from '@/router'
import { getStoredToken, clearStoredAuth } from '@/lib/authStorage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      clearStoredAuth()
      router.replace('/login')
    }
    return Promise.reject(err)
  }
)

export default api