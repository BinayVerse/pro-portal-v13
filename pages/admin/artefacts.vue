<template>
  <div class="space-y-6">
    <!-- Header -->
    <ArtefactsHeader @upload="showUploadModal = true" />

    <!-- Stats Cards -->
    <ArtefactsStats
      :total-artefacts="totalArtefacts"
      :processed-artefacts="processedArtefacts"
      :total-categories="totalCategories"
      :total-size="totalSize"
      :loading="isLoadingStats"
    />

    <!-- Search and Filters -->
    <ArtefactsFilters
      v-model:search-query="searchQuery"
      v-model:selected-category="selectedCategory"
      v-model:selected-type="selectedType"
      v-model:selected-status="selectedStatus"
      :available-categories="availableCategories"
      :categories-loading="categoriesLoading"
    />

    <!-- Artefacts Table -->
    <ArtefactsTable
      :artefacts="filteredArtefacts"
      :summarizing-docs="artefactsStore.getSummarizingDocs"
      :loading="isLoadingArtefacts"
      @view-artefact="viewArtefact"
      @reprocess-artefact="reprocessArtefact"
      @delete-artefact="deleteArtefact"
      @view-summary="viewSummary"
      @summarize-artefact="summarizeArtefact"
    />

    <!-- Upload Modal -->
    <ArtefactUploadModal
      v-model:is-open="showUploadModal"
      :available-categories="availableCategories"
      :categories-loading="categoriesLoading"
      @close="showUploadModal = false"
      @file-uploaded="handleFileUploaded"
      @google-drive-uploaded="handleGoogleDriveUploaded"
      @category-added="addCategory"
      @category-deleted="deleteCategory"
    />

    <!-- Summary Modal -->
    <ArtefactSummaryModal
      v-model:is-open="showSummaryModal"
      :artefact="selectedArtefact"
      @close="showSummaryModal = false"
      @download="downloadArtefact"
    />

    <!-- Document Viewer Modal -->
    <ArtefactViewModal
      v-model:is-open="showViewModal"
      :artefact="selectedViewArtefact"
      @close="showViewModal = false"
    />

    <!-- Confirm Delete Category Popup -->
    <ConfirmPopup
      v-model:is-open="showConfirmPopup"
      title="Delete Category"
      :message="`Are you sure you want to delete the category '${categoryToDelete}'?`"
      details="This action cannot be undone. All artefacts in this category will be moved to 'Uncategorized'."
      confirm-text="Delete Category"
      cancel-text="Cancel"
      type="danger"
      :loading="isDeletingCategory"
      @confirm="confirmDeleteCategory"
      @cancel="cancelDeleteCategory"
    />

    <!-- Confirm Delete Artefact Popup -->
    <ConfirmPopup
      v-model:is-open="showConfirmDeleteArtefact"
      title="Delete Artefact"
      :message="`Are you sure you want to delete '${artefactToDelete?.name}'?`"
      details="This action cannot be undone. The artefact will be permanently removed from your storage and vector database."
      confirm-text="Delete Artefact"
      cancel-text="Cancel"
      type="danger"
      :loading="isDeletingArtefact"
      @confirm="confirmDeleteArtefact"
      @cancel="cancelDeleteArtefact"
    />

    <!-- Confirm Reprocess Artefact Popup -->
    <ConfirmPopup
      v-model:is-open="showConfirmReprocessArtefact"
      title="Reprocess Artefact"
      :message="`Are you sure you want to reprocess '${artefactToReprocess?.name}'?`"
      details="This will regenerate the summary and analysis using the latest AI models. The current summary will be replaced."
      confirm-text="Reprocess Artefact"
      cancel-text="Cancel"
      type="info"
      :loading="isReprocessingArtefact"
      @confirm="confirmReprocessArtefact"
      @cancel="cancelReprocessArtefact"
    />

    <!-- Confirm Summarize Artefact Popup -->
    <ConfirmPopup
      v-model:is-open="showConfirmSummarizeArtefact"
      title="Summarize Document"
      :message="`Generate AI summary for '${artefactToSummarize?.name}'?`"
      details="This will analyze the document content and generate an AI-powered summary using the latest models."
      confirm-text="Generate Summary"
      cancel-text="Cancel"
      type="info"
      :loading="isSummarizingArtefact"
      @confirm="confirmSummarizeArtefact"
      @cancel="cancelSummarizeArtefact"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils'
import { onMounted, watch, nextTick } from 'vue'
import { useNotification } from '~/composables/useNotification'

// Using admin layout
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

// Import components
import ArtefactsHeader from '~/components/admin/artefacts/ArtefactsHeader.vue'
import ArtefactsStats from '~/components/admin/artefacts/ArtefactsStats.vue'
import ArtefactsFilters from '~/components/admin/artefacts/ArtefactsFilters.vue'
import ArtefactsTable from '~/components/admin/artefacts/ArtefactsTable.vue'
import ArtefactUploadModal from '~/components/admin/artefacts/ArtefactUploadModal.vue'
import ArtefactSummaryModal from '~/components/admin/artefacts/ArtefactSummaryModal.vue'
import ArtefactViewModal from '~/components/admin/artefacts/ArtefactViewModal.vue'
import ConfirmPopup from '~/components/ui/ConfirmPopup.vue'

// Import stores
import { useAuthStore } from '~/stores/auth'
import { useArtefactsStore } from '~/stores/artefacts'

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const showUploadModal = ref(false)
const showSummaryModal = ref(false)
const selectedArtefact = ref(null)
const showViewModal = ref(false)
const selectedViewArtefact = ref(null)

// Confirm popup state
const showConfirmPopup = ref(false)
const categoryToDelete = ref('')
const isDeletingCategory = ref(false)

// Initialize stores
const authStore = useAuthStore()
const artefactsStore = useArtefactsStore()

// Get orgId from auth user
const currentUser = computed(() => authStore.user || null)
const orgId = computed(() => currentUser.value?.org_id || null)

// Fallback categories if API is not available
const fallbackCategories = [
  'HR Policy',
  'Financial',
  'Technical',
  'Analytics',
  'Legal & Compliance',
  'Policies & Procedures',
  'Product / Service Information',
  'Technical / Operational Documentation',
  'Training & Onboarding',
]

// Categories management - now from store with fallback
const availableCategories = computed(() => {
  const storeCategories = artefactsStore.getCategoryNames
  const categories = storeCategories.length > 0 ? storeCategories : fallbackCategories
  return categories
})
const categoriesLoading = computed(() => {
  const loading = artefactsStore.isCategoryLoadingState
  return loading
})
const categoriesError = computed(() => artefactsStore.getCategoryError)

// Computed properties for artefacts and stats from store
const artefacts = computed(() => artefactsStore.getArtefacts)
const stats = computed(() => artefactsStore.getStats)
const isLoadingArtefacts = computed(() => artefactsStore.isArtefactsLoading)
const artefactsError = computed(() => artefactsStore.getArtefactsError)

// Show loading for stats only on initial load (when no data exists yet)
const isLoadingStats = computed(() => {
  // Only show loading on true initial load when we have no artefacts data at all
  return artefactsStore.isArtefactsLoading && artefacts.value.length === 0
})

// Individual stats computed properties
const totalArtefacts = computed(() => stats.value?.totalArtefacts || 0)
const processedArtefacts = computed(() => stats.value?.processedArtefacts || 0)
const totalCategories = computed(() => stats.value?.totalCategories || 0)
const totalSize = computed(() => stats.value?.totalSize || '0 Bytes')

const filteredArtefacts = computed(() => {
  return artefacts.value.filter((artefact) => {
    const matchesSearch =
      !searchQuery.value ||
      (artefact.name && artefact.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (artefact.description &&
        artefact.description.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesCategory = !selectedCategory.value || artefact.category === selectedCategory.value
    const matchesType = !selectedType.value || artefact.type === selectedType.value
    const matchesStatus = !selectedStatus.value || artefact.status === selectedStatus.value

    return matchesSearch && matchesCategory && matchesType && matchesStatus
  })
})

// Methods
const viewArtefact = (artefact: any) => {
  selectedViewArtefact.value = artefact
  showViewModal.value = true
}

const reprocessArtefact = async (artefact: any) => {
  // Check if artefact can be reprocessed
  if (!artefact.id) {
    const { showError } = useNotification()
    showError('Cannot reprocess artefact - invalid artefact data')
    return
  }

  // Show confirmation modal
  showConfirmReprocessArtefact.value = true
  artefactToReprocess.value = artefact
}

const deleteArtefact = async (artefact: any) => {
  // Show confirmation popup first
  showConfirmDeleteArtefact.value = true
  artefactToDelete.value = artefact
}

// Delete confirmation state
const showConfirmDeleteArtefact = ref(false)
const artefactToDelete = ref<any>(null)
const isDeletingArtefact = ref(false)

// Reprocess confirmation state
const showConfirmReprocessArtefact = ref(false)
const artefactToReprocess = ref<any>(null)
const isReprocessingArtefact = ref(false)

// Summarize confirmation state
const showConfirmSummarizeArtefact = ref(false)
const artefactToSummarize = ref<any>(null)
const isSummarizingArtefact = ref(false)

// Confirm delete handler
const confirmDeleteArtefact = async () => {
  if (!artefactToDelete.value) return

  isDeletingArtefact.value = true
  const { showError, showSuccess } = useNotification()

  try {
    const result = await artefactsStore.deleteArtefact(
      artefactToDelete.value.id,
      artefactToDelete.value.name,
    )

    if (result.success) {
      showSuccess(result.message)
      // Refresh the artefacts list
      await artefactsStore.fetchArtefacts()
    } else {
      showError(result.message)
    }
  } catch (error: any) {
    showError(error.message || 'Failed to delete artefact')
  } finally {
    isDeletingArtefact.value = false
    showConfirmDeleteArtefact.value = false
    artefactToDelete.value = null
  }
}

// Cancel delete handler
const cancelDeleteArtefact = () => {
  showConfirmDeleteArtefact.value = false
  artefactToDelete.value = null
  isDeletingArtefact.value = false
}

// Confirm reprocess handler
const confirmReprocessArtefact = async () => {
  if (!artefactToReprocess.value) return

  isReprocessingArtefact.value = true
  const { showError, showSuccess } = useNotification()

  try {
    const result = await artefactsStore.reprocessArtefact(artefactToReprocess.value.id)

    if (result.success) {
      showSuccess(result.message)
      // Refresh the artefacts list to show updated status
      await artefactsStore.fetchArtefacts()
    } else {
      showError(result.message)
    }
  } catch (error: any) {
    showError(error.message || 'Failed to reprocess artefact')
  } finally {
    isReprocessingArtefact.value = false
    showConfirmReprocessArtefact.value = false
    artefactToReprocess.value = null
  }
}

// Cancel reprocess handler
const cancelReprocessArtefact = () => {
  showConfirmReprocessArtefact.value = false
  artefactToReprocess.value = null
  isReprocessingArtefact.value = false
}

// Summarize artefact handler
const summarizeArtefact = async (artefact: any) => {
  // Check if artefact can be summarized
  if (!artefact.id) {
    const { showError } = useNotification()
    showError('Cannot summarize artefact - invalid artefact data')
    return
  }

  if (artefact.status !== 'processed') {
    const { showError } = useNotification()
    showError('Document must be processed before summarization')
    return
  }

  if (artefact.summarized === 'Yes') {
    const { showInfo } = useNotification()
    showInfo('Document is already summarized. Use "View Summary" to see the existing summary.')
    return
  }

  // Check if document is already being auto-processed
  if (artefactsStore.isDocumentBeingSummarized(artefact.id)) {
    const { showInfo } = useNotification()
    showInfo('This document is already being processed automatically. Please wait for completion.')
    return
  }

  // Show confirmation modal
  showConfirmSummarizeArtefact.value = true
  artefactToSummarize.value = artefact
}

// Confirm summarize handler
const confirmSummarizeArtefact = async () => {
  if (!artefactToSummarize.value) return

  isSummarizingArtefact.value = true
  const { showError, showSuccess, showInfo } = useNotification()

  try {
    showInfo('Document summarization started! This may take a few moments...')

    const result = await artefactsStore.summarizeArtefact(artefactToSummarize.value.id)

    if (result.success) {
      showSuccess(result.message)

      // Update document status locally for immediate UI feedback
      const docIndex = artefacts.value.findIndex(a => a.id === artefactToSummarize.value?.id)
      if (docIndex !== -1) {
        artefacts.value[docIndex].summarized = 'Yes'
        artefacts.value[docIndex].summary = 'Summary available'
      }

      // Refresh the artefacts list to show updated summarization status
      await artefactsStore.fetchArtefacts()
    } else {
      showError(result.message)
    }
  } catch (error: any) {
    showError(error.message || 'Failed to summarize document')
  } finally {
    isSummarizingArtefact.value = false
    showConfirmSummarizeArtefact.value = false
    artefactToSummarize.value = null
  }
}

// Cancel summarize handler
const cancelSummarizeArtefact = () => {
  showConfirmSummarizeArtefact.value = false
  artefactToSummarize.value = null
  isSummarizingArtefact.value = false
}

const viewSummary = (artefact: any) => {
  selectedArtefact.value = artefact
  showSummaryModal.value = true
}

const downloadArtefact = async (artefact: any) => {
  if (!artefact || !artefact.id) {
    const { showError } = useNotification()
    showError('Cannot download artefact - invalid artefact data')
    return
  }

  const { showError, showSuccess, showInfo } = useNotification()

  try {
    showInfo('Preparing download...')

    // Use the existing viewArtefact method to get the file URL
    const result = await artefactsStore.viewArtefact(artefact.id)

    if (result.success && result.data.fileUrl) {
      // Create a temporary link to trigger download
      const link = document.createElement('a')
      link.href = result.data.fileUrl
      link.download = result.data.fileName || artefact.name || 'document'
      link.target = '_blank' // Open in new tab as fallback
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showSuccess('Download started successfully')
    } else {
      showError(result.message || 'File URL not available for download')
    }
  } catch (error: any) {
    console.error('Download error:', error)
    showError(error?.message || 'Failed to download artefact')
  }
}

// Upload handlers
const handleFileUploaded = async (artefact: any) => {
  // Refresh the artefacts list to get updated data and stats
  await artefactsStore.fetchArtefacts()
}

const handleGoogleDriveUploaded = async (newArtefacts: any[]) => {
  // Refresh the artefacts list to get updated data and stats
  await artefactsStore.fetchArtefacts()
}

// Category management methods
const addCategory = async (category: string) => {
  const trimmedCategory = category.trim()
  if (!trimmedCategory) return

  if (orgId.value) {
    // Use API if orgId is available
    try {
      await artefactsStore.createCategory(trimmedCategory, orgId.value)
      // Refresh artefacts list to update stats if needed
      await artefactsStore.fetchArtefacts()
    } catch (error) {
      // Show error message to user
      const { showError } = useNotification()
      showError('Failed to add category. Please try again.')
    }
  } else {
    // Fallback to local management if no orgId
    const { showWarning } = useNotification()
    showWarning('Category added locally only. Changes will not be saved.')
  }
}

const deleteCategory = (category: string) => {
  categoryToDelete.value = category
  showConfirmPopup.value = true
}

const confirmDeleteCategory = async () => {
  const category = categoryToDelete.value
  if (!category) return

  isDeletingCategory.value = true

  try {
    if (orgId.value) {
      // Use API if orgId is available
      // Find the category ID from the store
      const categoryData = artefactsStore.categories.find((cat) => cat.name === category)
      if (categoryData) {
        await artefactsStore.deleteCategory(categoryData.id, orgId.value)

        // Refresh artefacts list to update stats and category assignments
        await artefactsStore.fetchArtefacts()
      }
    } else {
      // Fallback to local management if no orgId
      const { showWarning } = useNotification()
      showWarning('Category deleted locally only. Changes will not be saved.')
    }
  } catch (error) {
    const { showError } = useNotification()
    showError('Failed to delete category. Please try again.')
  } finally {
    isDeletingCategory.value = false
    showConfirmPopup.value = false
    categoryToDelete.value = ''
  }
}

const cancelDeleteCategory = (event?: Event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  showConfirmPopup.value = false
  categoryToDelete.value = ''
  isDeletingCategory.value = false
}

// Initialize categories when orgId is available
const initializeCategories = async () => {
  if (!orgId.value) {
    return
  }

  const token = process.client ? localStorage.getItem('authToken') : null
  if (!token) {
    return
  }

  try {
    await artefactsStore.fetchCategories(orgId.value)
  } catch (error: any) {
    // Handle specific error types
    if (error?.statusCode === 401 || error?.response?.status === 401) {
      const { showError } = useNotification()
      showError('Session expired. Please log in again.')

      // Clear invalid auth and redirect
      if (process.client) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
      await navigateTo('/login')
    } else {
      const { showError } = useNotification()
      showError('Failed to load categories. Please refresh the page.')
    }
  }
}

// Initialize page data
const initializePage = async () => {
  try {
    // Ensure auth is initialized first
    await authStore.initializeStore()

    // Wait a bit for auth to settle
    await nextTick()

    // Check if user is authenticated and has orgId
    if (authStore.isLoggedIn && orgId.value) {
      // Ensure token is available before fetching data
      const token = process.client ? localStorage.getItem('authToken') : null
      if (token) {
        // Fetch both categories and artefacts
        await Promise.all([initializeCategories(), artefactsStore.fetchArtefacts()])
      }
    }
  } catch (error) {
    // Error handled silently
  }
}

// Watch for orgId changes and fetch data
watch(
  orgId,
  (newOrgId) => {
    if (newOrgId && authStore.isLoggedIn) {
      const token = process.client ? localStorage.getItem('authToken') : null
      if (token) {
        Promise.all([initializeCategories(), artefactsStore.fetchArtefacts()])
      }
    }
  },
  { immediate: false },
)

// Watch for authentication changes
watch(
  () => authStore.isLoggedIn,
  (isAuth) => {
    if (isAuth && orgId.value) {
      const token = process.client ? localStorage.getItem('authToken') : null
      if (token) {
        Promise.all([initializeCategories(), artefactsStore.fetchArtefacts()])
      }
    }
  },
)

// Watch for auto-processing completion (both processing and summarization)
watch(
  () => artefactsStore.getProcessingStatus().allComplete,
  (allComplete) => {
    // Silent monitoring of complete processing (processed + summarized)
  }
)

// Watch for changes in artefacts data to ensure UI stays updated
watch(
  () => artefactsStore.artefacts,
  (newArtefacts, oldArtefacts) => {
    // Silent monitoring of artefacts changes for UI updates
  },
  { deep: true }
)

// Initialize everything on mount
onMounted(async () => {
  await initializePage()

  // Automatically start background processing if there are unprocessed or unsummarized documents
  await nextTick()
  const processingStatus = artefactsStore.getProcessingStatus()

  if (processingStatus.unprocessedCount > 0 || processingStatus.pendingCount > 0) {
    artefactsStore.startAutoProcessing()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  artefactsStore.stopAutoProcessing()
})

useHead({
  title: 'Artefact Management - Admin Dashboard',
})
</script>
