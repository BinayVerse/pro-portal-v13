export const useAuth = () => {
  const authStore = useAuthStore()

  // Computed properties
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)

  // Actions
  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const result = await authStore.login(credentials)
    return result
  }

  const logout = async () => {
    await authStore.logout()
    await navigateTo('/login')
  }

  const register = async (data: any) => {
    return await authStore.register(data)
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
  onMounted(() => {
    authStore.initializeAuth()
    checkAuth()
  })

  return {
    // State
    user,
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
