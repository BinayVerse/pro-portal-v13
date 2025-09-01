<template>
  <div class="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and header -->
      <div class="text-center">
        <NuxtLink to="/" class="inline-flex items-center space-x-3 mb-6">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fb2a7382a9c9146babd538ccc60e9d0b5%2Fbddd43caf4614f99a3fbff498927abcc?format=webp&width=800"
            alt="Provento Logo"
            class="w-10 h-10"
          />
          <span class="text-white text-2xl font-semibold">provento.ai</span>
        </NuxtLink>
        <h2 class="text-3xl font-bold text-white">Sign in to your account</h2>
        <p class="mt-2 text-gray-400">Access your artifact management dashboard</p>
      </div>

      <AuthSignInWithOAuth authView="signin" />

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-dark-700" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-black text-gray-400">or proceed with</span>
        </div>
      </div>

      <!-- Login form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            Email address
          </label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            required
            class="input-field w-full"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input-field w-full pr-12"
              placeholder="Enter your password"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 transition-colors"
              @click="togglePasswordVisibility"
            >
              <UIcon
                :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                class="h-5 w-5"
              />
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="loginForm.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-500 bg-dark-800 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label for="remember-me" class="ml-2 text-sm text-gray-300"> Remember me </label>
          </div>

          <NuxtLink
            :to="`/forgot-password?email=${loginForm.email}`"
            class="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Forgot your password?
          </NuxtLink>
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="authStore.loading" class="flex items-center justify-center">
            <UIcon
              name="i-heroicons-arrow-path"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            />
            Signing in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-dark-700" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-black text-gray-400">Don't have an account?</span>
        </div>
      </div>

      <!-- Register link -->
      <div class="text-center space-y-3">
        <NuxtLink to="/signup" class="btn-primary w-full"> Create New Account </NuxtLink>
        <NuxtLink to="/book-meeting" class="btn-outline w-full ml-3"> Book a Meeting </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth/index'

definePageMeta({
  layout: 'minimal',
})

const authStore = useAuthStore()
const { showNotification } = useNotification()

const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false,
})

// Password visibility toggle
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Clear errors when user starts typing
watch(
  loginForm,
  () => {
    if (authStore.error) {
      authStore.setError(null)
    }
  },
  { deep: true },
)

const handleLogin = async () => {
  try {
    await authStore.signIn({
      email: loginForm.value.email,
      password: loginForm.value.password,
    })

    // Show success notification
    showNotification('Welcome back! Login successful.', 'success')

    // Handle redirect through store
    await authStore.handlePostLoginRedirect()
  } catch (error: any) {
    // Show error notification
    showNotification(error?.message || 'Login failed. Please try again.', 'error')
    console.error('Login failed:', error?.message)
  }
}
</script>
