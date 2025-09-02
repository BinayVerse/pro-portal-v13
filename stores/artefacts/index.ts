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
    previousArtefacts: [] as any[], // Store previous state to detect changes
    stats: {
      totalArtefacts: 0,
      processedArtefacts: 0,
      totalCategories: 0,
      totalSize: '0 Bytes'
    },
    isLoadingArtefacts: false,
    artefactsError: null as string | null,
    // Auto-processing state
    pollingInterval: null as NodeJS.Timeout | null,
    isAutoProcessingEnabled: false,
    summarizingDocs: new Set<number>(),
    attemptedSummarizations: new Set<number>(),
    pollingIntervalMs: 10000, // Start with 10 seconds
    maxPollingIntervalMs: 60000, // Max 60 seconds
    minPollingIntervalMs: 5000, // Min 5 seconds
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
    // Auto-processing getters
    isAutoProcessingActive: (state): boolean => state.isAutoProcessingEnabled && !!state.pollingInterval,
    getSummarizingDocs: (state): Set<number> => state.summarizingDocs,
    isDocumentBeingSummarized: (state) => (docId: number): boolean => state.summarizingDocs.has(docId),
    pendingSummarizations: (state): any[] => {
      return (state.artefacts || []).filter(doc =>
        doc.status === 'processed' &&
        doc.summarized === 'No' &&
        !state.summarizingDocs.has(doc.id) &&
        !state.attemptedSummarizations.has(doc.id)
      )
    },
    allDocumentsProcessed: (state): boolean => {
      const unprocessedDocs = (state.artefacts || []).filter(doc => doc.status !== 'processed')
      return unprocessedDocs.length === 0
    },
    allDocumentsSummarized: (state): boolean => {
      const unsummarizedDocs = (state.artefacts || []).filter(doc =>
        doc.status === 'processed' && doc.summarized === 'No'
      )
      return unsummarizedDocs.length === 0
    },
    processingProgress: (state): { processed: number; total: number; percentage: number } => {
      const total = state.artefacts.length
      const processed = (state.artefacts || []).filter(doc =>
        doc.status === 'processed' && doc.summarized === 'Yes'
      ).length
      return {
        processed,
        total,
        percentage: total > 0 ? Math.round((processed / total) * 100) : 0
      }
    },
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

        // Store previous state before updating
        const previousArtefacts = [...this.artefacts]

        this.artefacts = response.data.artefacts || []
        this.stats = response.data.stats || {
          totalArtefacts: 0,
          processedArtefacts: 0,
          totalCategories: 0,
          totalSize: '0 Bytes'
        }

        // Detect newly processed documents and auto-summarize them
        if (previousArtefacts.length > 0) {
          this.checkForNewlyProcessedDocuments(previousArtefacts, this.artefacts)
        }

        this.previousArtefacts = [...this.artefacts]

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

    // Check if file exists
    async checkFileExists(fileName: string) {
      try {
        const token = process.client ? localStorage.getItem('authToken') : null
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await $fetch<{
          statusCode: number
          status: string
          exists: boolean
          fileInfo?: {
            id: number
            name: string
            category: string
            lastUpdated: string
          }
        }>('/api/artefacts/check-exists', {
          method: 'POST',
          body: { fileName },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 'error') {
          throw new Error('Failed to check file existence')
        }

        return {
          success: true,
          exists: response.exists,
          fileInfo: response.fileInfo
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
          exists: false,
          message: this.handleError(error, 'Failed to check file existence')
        }
      }
    },

    // Check if multiple files exist using unified endpoint
    async checkFilesExistBulk(fileNames: string[]) {
      try {
        const token = process.client ? localStorage.getItem('authToken') : null
        if (!token) {
          throw new Error('Authentication required')
        }

        const response = await $fetch<{
          statusCode: number
          status: string
          results: Array<{
            originalFileName: string
            cleanedFileName: string
            exists: boolean
            fileInfo?: {
              id: number
              name: string
              category: string
              lastUpdated: string
            }
          }>
        }>('/api/artefacts/check-exists', {
          method: 'POST',
          body: { fileNames },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 'error') {
          throw new Error('Failed to check files existence')
        }

        return {
          success: true,
          results: response.results
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
          results: [],
          message: this.handleError(error, 'Failed to check files existence')
        }
      }
    },

    // Auto-processing methods
    startAutoProcessing() {
      if (this.pollingInterval) {
        this.stopAutoProcessing()
      }

      this.isAutoProcessingEnabled = true
      this.startPolling()
    },

    stopAutoProcessing() {
      this.isAutoProcessingEnabled = false
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }

      // Clear processing state but keep attempted summarizations to avoid retries
      this.summarizingDocs.clear()
    },

    startPolling() {
      if (!this.isAutoProcessingEnabled || this.pollingInterval) return

      this.pollingInterval = setInterval(async () => {
        try {
          await this.fetchArtefacts()

          // Stop polling only if all documents are processed AND summarized
          if (this.allDocumentsProcessed && this.allDocumentsSummarized) {
            this.stopAutoProcessing()
          } else {
            this.adjustPollingInterval()
          }
        } catch (error) {
          // Silent error handling for polling
        }
      }, this.pollingIntervalMs)
    },

    checkForNewlyProcessedDocuments(previousDocs: any[], currentDocs: any[]) {
      if (!this.isAutoProcessingEnabled) return

      // Find documents that became 'processed' in this update
      const newlyProcessedDocs = currentDocs.filter(currentDoc => {
        const previousDoc = previousDocs.find(prev => prev.id === currentDoc.id)
        return previousDoc &&
               previousDoc.status !== 'processed' &&
               currentDoc.status === 'processed' &&
               currentDoc.summarized === 'No' &&
               !this.summarizingDocs.has(currentDoc.id) &&
               !this.attemptedSummarizations.has(currentDoc.id)
      })

      if (newlyProcessedDocs.length > 0) {
        // Start summarization for newly processed documents
        for (const doc of newlyProcessedDocs) {
          this.summarizingDocs.add(doc.id)
          this.attemptedSummarizations.add(doc.id)

          // Show notification when summarization starts
          if (process.client) {
            const { showInfo } = useNotification()
            showInfo(`Auto summarization started for "${doc.name}"`, {
              title: 'Summarization Started',
              duration: 4000
            })
          }

          // Process in background
          this.processSingleSummarization(doc.id).finally(() => {
            this.summarizingDocs.delete(doc.id)
            // Force reactivity update
            this.summarizingDocs = new Set(this.summarizingDocs)
          })

          // Add small delay between starting each summarization
          setTimeout(() => {}, 500)
        }
      }
    },


    async processSingleSummarization(docId: number) {
      try {
        const result = await this.summarizeArtefact(docId)

        if (result.success) {
          // Update document status locally for immediate UI feedback
          const docIndex = this.artefacts.findIndex(a => a.id === docId)
          if (docIndex !== -1) {
            this.artefacts[docIndex].summarized = 'Yes'
            this.artefacts[docIndex].summary = 'Summary available'
          }

          // Refresh data to get updated status from server
          await this.fetchArtefacts()

          // Show success notification
          if (process.client) {
            const { showSuccess } = useNotification()
            const doc = this.artefacts.find(a => a.id === docId)
            const docName = doc?.name || `Document ${docId}`
            showSuccess(`${docName} summarized successfully`)
          }
        } else {
          // Show error notification
          if (process.client) {
            const { showError } = useNotification()
            const doc = this.artefacts.find(a => a.id === docId)
            const docName = doc?.name || `Document ${docId}`
            showError(`Failed to summarize ${docName}: ${result.message}`)
          }
        }
      } catch (error: any) {
        // Show error notification
        if (process.client) {
          const { showError } = useNotification()
          const doc = this.artefacts.find(a => a.id === docId)
          const docName = doc?.name || `Document ${docId}`
          showError(`Error summarizing ${docName}: ${error.message || error}`)
        }
      }
    },

    adjustPollingInterval() {
      const unprocessedCount = this.artefacts.filter(doc => doc.status !== 'processed').length
      const processingCount = this.artefacts.filter(doc => doc.status === 'processing').length

      // Adjust interval based on processing workload
      if (unprocessedCount > 10 || processingCount > 5) {
        // High workload - poll more frequently
        this.pollingIntervalMs = Math.max(this.minPollingIntervalMs, this.pollingIntervalMs - 2000)
      } else if (unprocessedCount < 3 && processingCount === 0) {
        // Low workload - poll less frequently
        this.pollingIntervalMs = Math.min(this.maxPollingIntervalMs, this.pollingIntervalMs + 3000)
      }

      // Restart polling with new interval if it changed significantly
      const currentInterval = this.pollingIntervalMs
      if (this.pollingInterval && Math.abs(currentInterval - this.pollingIntervalMs) > 2000) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
        this.startPolling()
      }
    },

    sleep(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms))
    },

    resetAutoProcessing() {
      this.stopAutoProcessing()
      this.summarizingDocs.clear()
      this.attemptedSummarizations.clear()
      this.pollingIntervalMs = 10000 // Reset to default
    },

    // Get processing status for UI
    getProcessingStatus() {
      const unprocessedCount = this.artefacts.filter(doc => doc.status !== 'processed').length
      const pendingSummarizations = this.pendingSummarizations.length

      return {
        isActive: this.isAutoProcessingActive,
        unprocessedCount,
        pendingCount: pendingSummarizations,
        processingCount: this.summarizingDocs.size,
        progress: this.processingProgress,
        pollingInterval: this.pollingIntervalMs / 1000, // in seconds
        allProcessed: this.allDocumentsProcessed,
        allComplete: this.allDocumentsProcessed && this.allDocumentsSummarized,
      }
    },
  },
})
