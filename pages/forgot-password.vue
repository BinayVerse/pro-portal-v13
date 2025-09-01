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
        <h2 class="text-3xl font-bold text-white">Reset your password</h2>
        <p class="mt-2 text-gray-400">Enter your email address and we'll send you a link to reset your password</p>
      </div>

      <!-- Reset password form -->
      <form @submit.prevent="handleResetPassword" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            Email address
          </label>
          <input
            id="email"
            v-model="resetForm.email"
            type="email"
            required
            class="input-field w-full"
            placeholder="Enter your email address"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || !resetForm.email"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <UIcon
              name="i-heroicons-arrow-path"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            />
            Sending reset link...
          </span>
          <span v-else>Send reset link</span>
        </button>
      </form>

      <!-- Success message -->
      <div v-if="emailSent" class="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
        <div class="flex">
          <UIcon name="i-heroicons-check-circle" class="h-5 w-5 text-green-400 mt-0.5" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-400">Email sent successfully!</h3>
            <p class="mt-1 text-sm text-green-300">
              We've sent a password reset link to {{ resetForm.email }}. Please check your inbox and follow the instructions to reset your password.
            </p>
          </div>
        </div>
      </div>

      <!-- Back to login -->
      <div class="text-center">
        <NuxtLink 
          to="/login" 
          class="inline-flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 mr-2" />
          Back to sign in
        </NuxtLink>
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

const resetForm = ref({
  email: '',
})

const loading = ref(false)
const emailSent = ref(false)

const handleResetPassword = async () => {
  if (!resetForm.value.email) {
    showNotification('Please enter your email address', 'error')
    return
  }

  loading.value = true
  emailSent.value = false

  try {
    const result = await authStore.resetPassword({
      email: resetForm.value.email
    })

    if (result?.status === 'success') {
      emailSent.value = true
      showNotification(
        'Password reset link sent successfully! Please check your email.',
        'success',
        {
          title: 'Email Sent',
          duration: 5000,
        }
      )
    }
  } catch (error: any) {
    console.error('Reset password error:', error)
    showNotification(
      error.message || 'Failed to send reset link. Please try again.',
      'error',
      {
        title: 'Reset Failed',
      }
    )
  } finally {
    loading.value = false
  }
}

// Pre-populate email if passed from login page
onMounted(() => {
  const route = useRoute()
  if (route.query.email) {
    resetForm.value.email = route.query.email as string
  }
})
</script>
