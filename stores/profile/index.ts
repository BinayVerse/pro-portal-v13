// stores/profile/index.ts
import { defineStore } from 'pinia'
import type { UserProfileState, UserProfile } from './types'
import { useNotification } from '~/composables/useNotification'

export const useProfileStore = defineStore('userStore', {
  state: (): UserProfileState => ({
    userProfile: {
      user_id: 0,
      name: '',
      email: '',
      company: '',
      whatsappNumber: '',
      primary_contact: false,
      createdAt: '',
      updatedAt: '',
    } as UserProfile,
    profileStatus: '',
    profileMessage: '',
    loading: true,
  }),

  getters: {
    getUserProfile(state) {
      return state.userProfile
    },
    getProfileStatus(state) {
      return state.profileStatus
    },
    getProfileMessage(state) {
      return state.profileMessage
    },
    getProfileLoading(state) {
      return state.loading
    },
  },

  actions: {
    handleError(error: any, defaultMessage: string, silent: boolean = false): string {
      const { showError } = useNotification()
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?._data?.message ||
        error?.data?.message ||
        error?.message ||
        defaultMessage
      if (!silent) {
        showError(errorMessage)
      }
      return errorMessage
    },

    handleSuccess(message: string): void {
      const { showSuccess } = useNotification()
      this.profileMessage = null
      showSuccess(message)
    },

    async handleApiError(err: any) {
      const normalized = {
        statusCode: err?.statusCode || err?.response?.status || 500,
        message:
          err?.response?._data?.statusMessage ||
          err?.response?._data?.message ||
          err?.message ||
          'An unexpected error occurred',
        errors: err?.response?._data?.errors || [],
      }

      // Auto-logout on 401
      if (normalized.statusCode === 401) {
        localStorage.removeItem('authUser')
        localStorage.removeItem('authToken')

        // Clear all toasts using the clear function from useNotification
        const { clear, showInfo } = useNotification()
        clear()
        showInfo('You have been logged out due to session timeout.')

        // Navigate to login after delay
        setTimeout(() => {
          navigateTo('/login')
        }, 2000)
      }

      return normalized
    },

    async fetchUserProfile() {
      try {
        this.loading = true
        const token = localStorage.getItem('authToken')

        const data = await $fetch<{
          status: string
          message: string
          data: UserProfile
        }>('/api/auth/profile', {
          method: 'GET',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })

        this.userProfile = data.data
        this.profileStatus = data.status
        this.profileMessage = null
      } catch (error: any) {
        console.error('Error fetching user profile:', error)
        const normalizedError = await this.handleApiError(error)
        this.userProfile = null
        this.profileStatus = 'incomplete'
        this.profileMessage = normalizedError.message || 'Error fetching user data.'
        throw new Error(normalizedError.message)
      } finally {
        this.loading = false
      }
    },

    async updateProfile(profile: any) {
      try {
        const token = localStorage.getItem('authToken')

        const data = await $fetch<{
          status: string
          message: string
          authToken?: string
        }>('/api/auth/profile-update', {
          method: 'PUT',
          body: profile,
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })

        if (data?.authToken) {
          localStorage.setItem('authToken', data.authToken)
        }

        this.handleSuccess(data?.message || 'Profile updated successfully.')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await this.fetchUserProfile()
      } catch (error: any) {
        console.error('Error updating profile:', error)
        const normalizedError = await this.handleApiError(error)
        this.profileMessage = this.handleError(normalizedError, 'Error updating profile')
        throw new Error(normalizedError.message)
      }
    },

    async downloadTemplate() {
      try {
        const blob = await useSafeBlobFetch('/api/users/csv-template', {
          method: 'GET',
        })

        if (blob.type !== 'text/csv') {
          throw new Error(`Unexpected Blob type: ${blob.type}`)
        }

        return blob
      } catch (error: any) {
        console.error('Download failed:', error)
        throw new Error(error.message || 'Failed to download template.')
      }
    },
  },
})
