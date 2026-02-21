import { ref, computed } from 'vue'
import api from '@/api'
import type { AuthUser } from '@/lib/authStorage'
import {
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth as clearStorage,
} from '@/lib/authStorage'

const token = ref<string | null>(getStoredToken())
const user = ref<AuthUser | null>(getStoredUser())

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isClient = computed(() => user.value?.role === 'client')
  const isCollaborator = computed(() => user.value?.role === 'collaborator')
  const canAccessClients = computed(() => isAdmin.value || isClient.value)
  const canAccessEmployees = computed(() => true)
  const canAccessSurveys = computed(() => true)
  const canEditSurveys = computed(() => isAdmin.value || isClient.value)
  const canManageEmployees = computed(() => isAdmin.value || isClient.value) // create/delete; collaborator only edit self

  function setAuth(t: string, u: AuthUser) {
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
    const { data } = await api.post<{ token: string; user: AuthUser }>(
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
    const { data } = await api.get<{ user: AuthUser }>('/auth/me')
    user.value = data.user
    setStoredAuth(token.value!, data.user)
    return data.user
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isClient,
    isCollaborator,
    canAccessClients,
    canAccessEmployees,
    canAccessSurveys,
    canEditSurveys,
    canManageEmployees,
    login,
    logout,
    fetchMe,
    clearAuth,
  }
}

