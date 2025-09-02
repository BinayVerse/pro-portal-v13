import { useAuthStore } from '~/stores/auth/index'

export const useAuth = () => {
  const authStore = useAuthStore()

  // Computed properties
  const user = computed(() => authStore.user)
  const token = computed(() => authStore.token)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)

  // Actions
  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const result = await authStore.signIn(credentials)
    return result
  }

  const logout = async () => {
    await authStore.signOut()
  }

  const register = async (data: any) => {
    return await authStore.signup(data)
  }

  const checkAuth = async () => {
    if (authStore.token && !authStore.user) {
      await authStore.fetchCurrentUser()
    }
  }

  const requireAuth = () => {
    if (!isAuthenticated.value) {
      navigateTo('/login')
      return false
    }
    return true
  }

  const requireAdmin = () => {
    if (!isAuthenticated.value) {
      navigateTo('/login')
      return false
    }

    if (!isAdmin.value) {
      navigateTo('/') // Redirect to home if not admin
      return false
    }

    return true
  }

  // Initialize auth on client-side
  onMounted(async () => {
    await authStore.initializeAuth()
    await checkAuth()
  })

  return {
    // State
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    error,

    // Actions
    login,
    logout,
    register,
    checkAuth,
    requireAuth,
    requireAdmin
  }
}
