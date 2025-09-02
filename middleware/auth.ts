import { useAuthStore } from '~/stores/auth/index'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Initialize auth store and wait for completion
  await authStore.initializeAuth()

  // Check if user is authenticated
  if (!authStore.isLoggedIn) {
    // Store the intended destination
    const redirectTo = to.fullPath

    // Redirect to login with return URL
    return navigateTo({
      path: '/login',
      query: { redirect: redirectTo },
    })
  }
})
