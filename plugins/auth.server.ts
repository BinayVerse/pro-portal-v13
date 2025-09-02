import { useAuthStore } from '~/stores/auth/index'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialize authentication on server startup
  // This will handle SSR authentication from cookies
  await authStore.initializeAuth()
})
