import { useAuthStore } from '~/stores/auth/index'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialize authentication on app startup
  await authStore.initializeAuth()
})
