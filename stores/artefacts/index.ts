import { defineStore } from 'pinia'
import type { ArtefactGoogleDriveFile, DocumentCategory } from './types'

export const useArtefactsStore = defineStore('artefacts', {
  state: () => ({
    googleDriveFiles: [] as ArtefactGoogleDriveFile[],
    isLoadingGoogleDrive: false,
    isUploadingGoogleDrive: false,
    otherFilesCount: 0,
    // Document Categories
    categories: [] as DocumentCategory[],
    newCategory: null as DocumentCategory | null,
    isCategoryLoading: false,
    categoryError: null as string | null,
    // Artefacts list and stats
    artefacts: [] as any[],
    stats: {
      totalArtefacts: 0,
      processedArtefacts: 0,
      totalCategories: 0,
      totalSize: '0 Bytes'
    },
    isLoadingArtefacts: false,
    artefactsError: null as string | null,
  }),

  getters: {
    // Category getters
    getCategories: (state): DocumentCategory[] => state.categories || [],
    getCategoryNames: (state): string[] => (state.categories || []).map(cat => cat?.name || '').filter(name => name),
    isCategoryLoadingState: (state): boolean => state.isCategoryLoading,
    getCategoryError: (state): string | null => state.categoryError,
    // Artefacts getters
    getArtefacts: (state): any[] => state.artefacts || [],
    getStats: (state) => state.stats || {
      totalArtefacts: 0,
      processedArtefacts: 0,
      totalCategories: 0,
      totalSize: '0 Bytes'
    },
    isArtefactsLoading: (state): boolean => state.isLoadingArtefacts,
    getArtefactsError: (state): string | null => state.artefactsError,
  },

  actions: {
    async fetchGoogleDriveFiles(folderUrl: string) {
      this.isLoadingGoogleDrive = true
      this.otherFilesCount = 0

      try {
        const data = await $fetch<{
          data: ArtefactGoogleDriveFile[]
          otherFiles: number
          message: string
        }>('/api/artefacts/google-drive-fetch', {
          method: 'POST',
          body: { folderUrl },
        })

        this.googleDriveFiles = data.data || []
        this.otherFilesCount = data.otherFiles || 0

        return {
          success: true,
          files: this.googleDriveFiles,
          message: data.message || 'Files fetched successfully'
        }
      } catch (error: any) {
        this.googleDriveFiles = []
        return {
          success: false,
          files: [],
          message: this.handleError(error, 'Failed to fetch Google Drive files')
        }
      } finally {
        this.isLoadingGoogleDrive = false
      }
    },

    async uploadGoogleDriveFiles(selectedFiles: ArtefactGoogleDriveFile[], category: string) {
      this.isUploadingGoogleDrive = true

      try {
        const token = localStorage.getItem('authToken')

        const data = await $fetch('/api/artefacts/google-drive', {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: {
            selectedFileDetails: selectedFiles,
            category,
          },
        })

        return {
          success: true,
          files: data.files || [],
          message: data.message || 'Files uploaded successfully'
        }
      } catch (error: any) {
        // Handle authentication errors
        if (error.statusCode === 401) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          await navigateTo('/login')
          throw new Error('Session expired. Please sign in again.')
        }

        return {
          success: false,
          files: [],
          message: this.handleError(error, 'Failed to upload Google Drive files')
        }
      } finally {
        this.isUploadingGoogleDrive = false
      }
    },

    clearGoogleDriveFiles() {
      this.googleDriveFiles = []
      this.otherFilesCount = 0
    },

    async uploadArtefact(formData: FormData) {
      try {
        const token = process.client ? localStorage.getItem('authToken') : null
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await $fetch<{
          statusCode: number
          status: string
          message: string
          data: any
        }>('/api/artefacts/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 'error') {
          throw new Error(response.message)
        }

        return {
          success: true,
          data: response.data,
          message: response.message
        }
      } catch (error: any) {
        // Handle authentication errors
        if (error.statusCode === 401 || error.response?.status === 401) {
          if (process.client) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
          }
          await navigateTo('/login')
          throw new Error('Session expired. Please log in again.')
        }

        return {
          success: false,
          data: null,
          message: this.handleError(error, 'Failed to upload artefact')
        }
      }
    },

    handleError(error: any, fallbackMessage: string): string {
      if (error?.data?.message) {
        return error.data.message
      }

      if (error?.message) {
        return error.message
      }

      return fallbackMessage
    },

    // Helper methods for categories
    handleCategoryError(error: any, defaultMessage: string, silent: boolean = false): string {
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

    handleCategorySuccess(message: string): void {
      const { showSuccess } = useNotification()
      this.categoryError = null
      showSuccess(message)
    },

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

    // Category Actions
    async fetchCategories(orgId: string) {
      try {
        this.isCategoryLoading = true
        this.categoryError = null

        const { data } = await $fetch<{ data: DocumentCategory[] }>(
          `/api/artefacts/category/${orgId}`,
          {
            headers: this.getAuthHeaders(),
          }
        )

        this.categories = data || []
        this.newCategory = null
      } catch (error: any) {
        if (!await this.handleAuthError(error)) {
          this.categoryError = this.handleCategoryError(error, 'Failed to fetch categories')
        }
      } finally {
        this.isCategoryLoading = false
      }
    },

    async createCategory(categoryName: string, orgId: string) {
      try {
        this.isCategoryLoading = true
        this.categoryError = null

        const { data, message } = await $fetch<{ data: DocumentCategory; message: string }>(
          '/api/artefacts/category/add',
          {
            method: 'POST',
            body: { name: categoryName, org_id: orgId },
            headers: this.getAuthHeaders(),
          }
        )

        this.newCategory = data || null
        this.handleCategorySuccess(message || 'Category added successfully!')

        // Refresh the categories list
        await this.fetchCategories(orgId)
      } catch (error: any) {
        if (!await this.handleAuthError(error)) {
          this.categoryError = this.handleCategoryError(error, 'Error creating category')
        }
      } finally {
        this.isCategoryLoading = false
      }
    },

    async deleteCategory(categoryId: string, orgId: string) {
      try {
        this.isCategoryLoading = true
        this.categoryError = null

        await $fetch(`/api/artefacts/category/${categoryId}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        })

        this.handleCategorySuccess('Category deleted successfully!')

        // Refresh the categories list
        await this.fetchCategories(orgId)
      } catch (error: any) {
        if (!await this.handleAuthError(error)) {
          this.categoryError = this.handleCategoryError(error, 'Error deleting category')
        }
      } finally {
        this.isCategoryLoading = false
      }
    },

    async getAllCategories() {
      try {
        this.isCategoryLoading = true
        this.categoryError = null

        const { data } = await $fetch<{ data: DocumentCategory[] }>(
          '/api/artefacts/category/all',
          {
            headers: this.getAuthHeaders(),
          }
        )

        this.categories = data || []
        return data || []
      } catch (error: any) {
        if (!await this.handleAuthError(error)) {
          this.categoryError = this.handleCategoryError(error, 'Failed to fetch categories')
        }
        return []
      } finally {
        this.isCategoryLoading = false
      }
    },

    // Clear methods
    clearCategories() {
      this.categories = []
      this.newCategory = null
      this.categoryError = null
    },

    clearCategoryError() {
      this.categoryError = null
    },

    // Artefacts Actions
    async fetchArtefacts() {
      this.isLoadingArtefacts = true
      this.artefactsError = null
      const userTimezone = process.client ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'

      try {
        const token = process.client ? localStorage.getItem('authToken') : null
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await $fetch<{
          statusCode: number
          status: string
          data: {
            artefacts: any[]
            stats: {
              totalArtefacts: number
              processedArtefacts: number
              totalCategories: number
              totalSize: string
            }
          }
          message: string
        }>('/api/artefacts/list', {
          method: 'POST',
          body: { timezone: userTimezone },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 'error') {
          throw new Error(response.message)
        }

        this.artefacts = response.data.artefacts || []
        this.stats = response.data.stats || {
          totalArtefacts: 0,
          processedArtefacts: 0,
          totalCategories: 0,
          totalSize: '0 Bytes'
        }

        return {
          success: true,
          data: response.data,
          message: response.message
        }
      } catch (error: any) {
        // Handle authentication errors
        if (error.statusCode === 401 || error.response?.status === 401) {
          if (process.client) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
          }
          await navigateTo('/login')
          throw new Error('Session expired. Please log in again.')
        }

        this.artefactsError = this.handleError(error, 'Failed to fetch artefacts')
        return {
          success: false,
          data: null,
          message: this.artefactsError
        }
      } finally {
        this.isLoadingArtefacts = false
      }
    },

    clearArtefacts() {
      this.artefacts = []
      this.stats = {
        totalArtefacts: 0,
        processedArtefacts: 0,
        totalCategories: 0,
        totalSize: '0 Bytes'
      }
      this.artefactsError = null
    },

    clearArtefactsError() {
      this.artefactsError = null
    },

    // View artefact method
    async viewArtefact(artefactId: number) {
      try {
        const token = process.client ? localStorage.getItem('authToken') : null
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await $fetch<{
          statusCode: number
          status: string
          fileUrl: string
          fileType: string
          fileCategory: string
          fileName: string
          contentType?: string
          docType?: string
        }>('/api/artefacts/view', {
          method: 'POST',
          body: { artefactId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 'error') {
          throw new Error('Failed to get document view URL')
        }

        return {
          success: true,
          data: {
            fileUrl: response.fileUrl,
            fileType: response.fileType,
            fileCategory: response.fileCategory,
            fileName: response.fileName,
            contentType: response.contentType,
            docType: response.docType
          }
        }
      } catch (error: any) {
        // Handle authentication errors
        if (error.statusCode === 401 || error.response?.status === 401) {
          if (process.client) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
          }
          await navigateTo('/login')
          throw new Error('Session expired. Please log in again.')
        }

        return {
          success: false,
          message: this.handleError(error, 'Failed to view document')
        }
      }
    },

    // Summarize artefact method
    async summarizeArtefact(artefactId: number) {
      try {
        const token = process.client ? localStorage.getItem('authToken') : null
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await $fetch<{
          statusCode: number
          status: string
          message: string
          data?: any
        }>(`/api/artefacts/summarize/${artefactId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 'error') {
          throw new Error(response.message)
        }

        return {
          success: true,
          message: response.message || 'Document summarized successfully'
        }
      } catch (error: any) {
        // Handle authentication errors
        if (error.statusCode === 401 || error.response?.status === 401) {
          if (process.client) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
          }
          await navigateTo('/login')
          throw new Error('Session expired. Please log in again.')
        }

        return {
          success: false,
          message: this.handleError(error, 'Failed to summarize document')
        }
      }
    },

    // Reprocess artefact method
    async reprocessArtefact(artefactId: number) {
      try {
        const token = process.client ? localStorage.getItem('authToken') : null
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await $fetch<{
          statusCode: number
          status: string
          message: string
          data: any
        }>(`/api/artefacts/reprocess/${artefactId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 'error') {
          throw new Error(response.message)
        }

        return {
          success: true,
          message: response.message || 'Artefact reprocessing started successfully'
        }
      } catch (error: any) {
        // Handle authentication errors
        if (error.statusCode === 401 || error.response?.status === 401) {
          if (process.client) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
          }
          await navigateTo('/login')
          throw new Error('Session expired. Please log in again.')
        }

        return {
          success: false,
          message: this.handleError(error, 'Failed to reprocess artefact')
        }
      }
    },

    // Delete artefact method
    async deleteArtefact(artefactId: number, artefactName: string) {
      try {
        const token = process.client ? localStorage.getItem('authToken') : null
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await $fetch<{
          statusCode: number
          status: string
          message: string
          data: any
        }>('/api/artefacts/delete', {
          method: 'POST',
          body: { artefactId, artefactName },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 'error') {
          throw new Error(response.message)
        }

        return {
          success: true,
          message: response.message || 'Artefact deleted successfully'
        }
      } catch (error: any) {
        // Handle authentication errors
        if (error.statusCode === 401 || error.response?.status === 401) {
          if (process.client) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
          }
          await navigateTo('/login')
          throw new Error('Session expired. Please log in again.')
        }

        return {
          success: false,
          message: this.handleError(error, 'Failed to delete artefact')
        }
      }
    },
  },
})
