// store/organization/index.ts

import { defineStore } from 'pinia'
import type {
  OrganizationState,
  OrganizationUser,
  Organization,
  OrganizationResponse,
} from './types'

export const useUsersStore = defineStore('usersStore', {
  state: (): OrganizationState => ({
    loading: true,
    error: null,
    users: [],
    roles: [],
    userLoading: false,
    userError: null,
  }),

  getters: {
    isLoading: (state): boolean => state.loading,
    getError: (state): string | null => state.error,
    getRoles: (state) => state.roles,
    getUsers: (state) => state.users,
    isUserLoading: (state) => state.userLoading,
    getUserError: (state): string | null => state.userError,
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
      this.userError = null
      showSuccess(message)
    },

    mapOrganization(org: OrganizationResponse): Organization {
      return {
        id: org.org_id,
        name: org.org_name,
        docs_uploaded: org.docs_uploaded,
        users_count: org.users_count,
        total_tokens: org.total_tokens,
        org_plan: [
          {
            name: org.name,
            expire_at: org.expire_at,
            status: org.status,
          },
        ],
      }
    },

    // small helper for token headers
    getAuthHeaders(extra: Record<string, string> = {}) {
      let token: string | null = null
      if (process.client) {
        token = localStorage.getItem('authToken')
      }
      if (!token) {
        const authCookie = useCookie('authToken')
        token = authCookie.value || null
      }

      return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
      }
    },

    async handleAuthError(err: any): Promise<boolean> {
      if (err?.statusCode === 401 || err?.response?.status === 401) {
        if (process.client) {
          localStorage.removeItem('authUser')
          localStorage.removeItem('authToken')

          // Use setTimeout to ensure router is initialized
          setTimeout(() => {
            navigateTo('/login')
          }, 500)
        }
        const authCookie = useCookie('authToken')
        authCookie.value = null
        return true
      }
      return false
    },

    async fetchRoles() {
      this.loading = true
      try {
        const data = await $fetch<{ data: any[] }>('/api/users/roles', {
          headers: this.getAuthHeaders(),
        })
        this.roles = data.data || []
      } catch (err: any) {
        console.error('Fetch roles error:', err)

        if (!this.handleAuthError(err)) {
          this.userError = this.handleError(err, 'Failed to fetch roles')
        }
      } finally {
        this.loading = false
      }
    },

    async fetchUsers() {
      this.userLoading = true
      try {
        const data = await $fetch<{ data: OrganizationUser[] }>('/api/users/all', {
          headers: this.getAuthHeaders(),
        })
        this.users = data.data || []
      } catch (err: any) {
        console.error('Fetch users error:', err)
        if (!this.handleAuthError(err)) {
          this.userError = this.handleError(err, 'Failed to fetch users')
        }
      } finally {
        this.userLoading = false
      }
    },

    async createUser(user: Partial<OrganizationUser>) {
      this.loading = true
      try {
        await $fetch('/api/users/create', {
          method: 'POST' as any,
          body: user,
          headers: this.getAuthHeaders(),
        })
        this.handleSuccess('User added successfully!')
        await this.fetchUsers()
      } catch (err: any) {
        if (!this.handleAuthError(err)) {
          this.userError = this.handleError(err, 'Error creating user')
        }
      } finally {
        this.loading = false
      }
    },

    async editUser(id: string, user: Partial<OrganizationUser>, silent = false) {
      try {
        await $fetch(`/api/users/${id}`, {
          method: 'PUT',
          body: user,
          headers: this.getAuthHeaders(),
        })

        if (!silent) this.handleSuccess('User edited successfully!')
        await this.fetchUsers()
      } catch (err: any) {
        if (!this.handleAuthError(err)) {
          this.userError = this.handleError(err, 'Error editing user')
        }
      }
    },

    async deleteUser(id: string) {
      try {
        await $fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        })

        this.handleSuccess('User deleted successfully!')
        await this.fetchUsers()
      } catch (err: any) {
        if (!this.handleAuthError(err)) {
          this.userError = this.handleError(err, 'Error deleting user')
        }
      }
    },

    async createBulkUsers(jsonData: OrganizationUser) {
      this.userLoading = true
      try {
        const data = await $fetch<{
          status: boolean
          message: string
          errors?: any[]
        }>('/api/users/bulk-users', {
          method: 'POST' as any,
          body: jsonData,
          headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        })

        this.handleSuccess('Bulk users added successfully!')
        await this.fetchUsers()

        return { status: data.status, message: data.message, errors: data.errors || [] }
      } catch (err: any) {
        if (!this.handleAuthError(err)) {
          const message = this.handleError(err, 'Error uploading bulk users')
          return { status: false, message, errors: err?.response?.data?.errors || [] }
        }
        return { status: false, message: 'Unauthorized', errors: [] }
      } finally {
        this.userLoading = false
      }
    },

    async uploadAndValidateJson(jsonData: OrganizationUser) {
      this.userLoading = true
      try {
        const data = await $fetch<{
          status: boolean
          message: string
          data?: any
          errors?: any[]
        }>('/api/users/upload-json', {
          method: 'POST',
          body: jsonData,
          headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        })

        return {
          status: data.status,
          message: data.message,
          data: data.data || null,
          errors: data.errors || [],
        }
      } catch (err: any) {
        // 🔎 If it's a validation error (422), unwrap and return cleanly
        if (err?.response?.status === 422 && err?.response?._data) {
          const data = err.response._data
          return {
            status: false,
            message: data.message || 'Validation failed',
            data: null,
            errors: data.errors || [],
          }
        }

        if (this.handleAuthError(err)) {
          return { status: false, message: 'Unauthorized', errors: [] }
        }

        const message = this.handleError(err, 'Error validating JSON')
        return { status: false, message, errors: [] }
      } finally {
        this.userLoading = false
      }
    },
  },
})
