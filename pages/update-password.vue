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
        <h2 class="text-3xl font-bold text-white">Update your password</h2>
        <p class="mt-2 text-gray-400">Enter your new password below</p>
      </div>

      <!-- Success message -->
      <div v-if="passwordUpdated" class="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
        <div class="flex">
          <UIcon name="i-heroicons-check-circle" class="h-5 w-5 text-green-400 mt-0.5" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-400">Password updated successfully!</h3>
            <p class="mt-1 text-sm text-green-300">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <div class="mt-3">
              <NuxtLink 
                to="/login" 
                class="text-sm text-green-400 hover:text-green-300 font-medium"
              >
                Go to sign in →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Update password form -->
      <form v-if="!passwordUpdated" @submit.prevent="handleUpdatePassword" class="space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="updateForm.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input-field w-full pr-12"
              placeholder="Enter your new password"
              :disabled="loading"
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
          <!-- Password Validation Indicators -->
          <div v-if="updateForm.password" class="mt-3 space-y-2">
            <div class="text-xs font-medium text-gray-300 mb-2">Password Requirements:</div>

            <div class="space-y-1">
              <!-- Length requirement -->
              <div class="flex items-center space-x-2">
                <UIcon
                  :name="passwordValidation.hasMinLength ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="passwordValidation.hasMinLength ? 'text-green-400' : 'text-red-400'"
                  class="w-4 h-4"
                />
                <span
                  :class="passwordValidation.hasMinLength ? 'text-green-400' : 'text-gray-400'"
                  class="text-xs"
                >
                  At least 8 characters
                </span>
              </div>

              <!-- Uppercase requirement -->
              <div class="flex items-center space-x-2">
                <UIcon
                  :name="passwordValidation.hasUppercase ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="passwordValidation.hasUppercase ? 'text-green-400' : 'text-red-400'"
                  class="w-4 h-4"
                />
                <span
                  :class="passwordValidation.hasUppercase ? 'text-green-400' : 'text-gray-400'"
                  class="text-xs"
                >
                  One uppercase letter
                </span>
              </div>

              <!-- Lowercase requirement -->
              <div class="flex items-center space-x-2">
                <UIcon
                  :name="passwordValidation.hasLowercase ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="passwordValidation.hasLowercase ? 'text-green-400' : 'text-red-400'"
                  class="w-4 h-4"
                />
                <span
                  :class="passwordValidation.hasLowercase ? 'text-green-400' : 'text-gray-400'"
                  class="text-xs"
                >
                  One lowercase letter
                </span>
              </div>

              <!-- Number requirement -->
              <div class="flex items-center space-x-2">
                <UIcon
                  :name="passwordValidation.hasNumber ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="passwordValidation.hasNumber ? 'text-green-400' : 'text-red-400'"
                  class="w-4 h-4"
                />
                <span
                  :class="passwordValidation.hasNumber ? 'text-green-400' : 'text-gray-400'"
                  class="text-xs"
                >
                  One number
                </span>
              </div>

              <!-- Special character requirement -->
              <div class="flex items-center space-x-2">
                <UIcon
                  :name="passwordValidation.hasSpecialChar ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="passwordValidation.hasSpecialChar ? 'text-green-400' : 'text-red-400'"
                  class="w-4 h-4"
                />
                <span
                  :class="passwordValidation.hasSpecialChar ? 'text-green-400' : 'text-gray-400'"
                  class="text-xs"
                >
                  One special character (@$!%*?&)
                </span>
              </div>
            </div>

            <!-- Overall strength indicator -->
            <div class="mt-3 pt-2 border-t border-gray-600">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-medium text-gray-300">Strength:</span>
                <div class="flex space-x-1">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="w-6 h-1 rounded-full"
                    :class="i <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-600'"
                  ></div>
                </div>
                <span
                  class="text-xs font-medium"
                  :class="getStrengthTextColor(passwordStrength)"
                >
                  {{ getStrengthText(passwordStrength) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              v-model="updateForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="input-field w-full pr-12"
              placeholder="Confirm your new password"
              :disabled="loading"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 transition-colors"
              @click="toggleConfirmPasswordVisibility"
            >
              <UIcon
                :name="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                class="h-5 w-5"
              />
            </button>
          </div>

          <!-- Password Match Indicator -->
          <div v-if="updateForm.confirmPassword" class="mt-2">
            <div class="flex items-center space-x-2">
              <UIcon
                :name="passwordsMatch ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="passwordsMatch ? 'text-green-400' : 'text-red-400'"
                class="w-4 h-4"
              />
              <span
                :class="passwordsMatch ? 'text-green-400' : 'text-red-400'"
                class="text-xs"
              >
                Passwords match
              </span>
            </div>
          </div>
        </div>


        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <UIcon
              name="i-heroicons-arrow-path"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            />
            Updating password...
          </span>
          <span v-else>Update password</span>
        </button>
      </form>

      <!-- Error state -->
      <div v-if="tokenError" class="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
        <div class="flex">
          <UIcon name="i-heroicons-exclamation-circle" class="h-5 w-5 text-red-400 mt-0.5" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-400">Invalid or expired link</h3>
            <p class="mt-1 text-sm text-red-300">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>
            <div class="mt-3">
              <NuxtLink 
                to="/forgot-password" 
                class="text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Request new reset link →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to login -->
      <div v-if="!tokenError" class="text-center">
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

const route = useRoute()
const authStore = useAuthStore()
const { showNotification } = useNotification()

const updateForm = ref({
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const passwordUpdated = ref(false)
const tokenError = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Password visibility toggles
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Password validation reactive state
const passwordValidation = computed(() => {
  const password = updateForm.value.password
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password)
  }
})

// Password strength calculation
const passwordStrength = computed(() => {
  const validations = passwordValidation.value
  const checks = [
    validations.hasMinLength,
    validations.hasUppercase,
    validations.hasLowercase,
    validations.hasNumber,
    validations.hasSpecialChar
  ]
  return checks.filter(Boolean).length
})

// Password match validation
const passwordsMatch = computed(() => {
  return updateForm.value.password === updateForm.value.confirmPassword &&
         updateForm.value.password.length > 0 &&
         updateForm.value.confirmPassword.length > 0
})

// Form validation
const isFormValid = computed(() => {
  const passwordChecks = Object.values(passwordValidation.value).every(Boolean)
  return passwordChecks && passwordsMatch.value
})

// Helper functions for strength display
const getStrengthColor = (strength: number) => {
  if (strength <= 1) return 'bg-red-500'
  if (strength <= 2) return 'bg-orange-500'
  if (strength <= 3) return 'bg-yellow-500'
  if (strength <= 4) return 'bg-blue-500'
  return 'bg-green-500'
}

const getStrengthTextColor = (strength: number) => {
  if (strength <= 1) return 'text-red-400'
  if (strength <= 2) return 'text-orange-400'
  if (strength <= 3) return 'text-yellow-400'
  if (strength <= 4) return 'text-blue-400'
  return 'text-green-400'
}

const getStrengthText = (strength: number) => {
  if (strength <= 1) return 'Very Weak'
  if (strength <= 2) return 'Weak'
  if (strength <= 3) return 'Fair'
  if (strength <= 4) return 'Good'
  return 'Strong'
}

const handleUpdatePassword = async () => {
  const token = route.query.token as string

  if (!token) {
    tokenError.value = true
    showNotification('Invalid reset link', 'error')
    return
  }

  if (!isFormValid.value) {
    showNotification('Please ensure all password requirements are met', 'error')
    return
  }

  loading.value = true

  try {
    const result = await authStore.updatePassword({
      token,
      newPassword: updateForm.value.password
    })

    if (result?.status === 'success') {
      passwordUpdated.value = true
      showNotification(
        'Password updated successfully! You can now sign in with your new password.',
        'success',
        {
          title: 'Password Updated',
          duration: 5000,
        }
      )
      
      // Auto redirect after a few seconds
      setTimeout(() => {
        navigateTo('/login')
      }, 3000)
    }
  } catch (error: any) {
    console.error('Update password error:', error)
    
    if (error.message?.includes('Invalid token') || error.message?.includes('expired')) {
      tokenError.value = true
    }
    
    showNotification(
      error.message || 'Failed to update password. Please try again.',
      'error',
      {
        title: 'Update Failed',
      }
    )
  } finally {
    loading.value = false
  }
}

// Check token validity on mount
onMounted(() => {
  const token = route.query.token as string
  if (!token) {
    tokenError.value = true
    showNotification('Invalid reset link - no token provided', 'error')
  }
})
</script>
