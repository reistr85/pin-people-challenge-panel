import { ref, computed } from 'vue'
import api from '@/api'
import {
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth as clearStorage,
} from '@/lib/authStorage'

const token = ref<string | null>(getStoredToken())
const user = ref<{ id: number; email: string } | null>(getStoredUser())

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  function setAuth(t: string, u: { id: number; email: string }) {
    token.value = t
    user.value = u
    setStoredAuth(t, u)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    clearStorage()
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<{ token: string; user: { id: number; email: string } }>(
      '/auth/sign_in',
      { session: { email, password } }
    )
    setAuth(data.token, data.user)
    return data
  }

  async function logout() {
    try {
      await api.delete('/auth/sign_out')
    } finally {
      clearAuth()
    }
  }

  async function fetchMe() {
    const { data } = await api.get<{ user: { id: number; email: string } }>('/auth/me')
    user.value = data.user
    setStoredAuth(token.value!, data.user)
    return data.user
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    fetchMe,
    clearAuth,
  }
}

