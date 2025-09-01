import { useAuthStore } from '~/stores/auth/index'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Initialize auth store if not already done
  if (process.client) {
    authStore.initializeStore()
  }

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
