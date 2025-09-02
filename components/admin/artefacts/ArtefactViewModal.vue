<template>
  <UModal :model-value="isOpen" @update:model-value="$emit('update:isOpen', $event)" fullscreen>
    <div class="flex flex-col h-screen bg-white dark:bg-gray-900">
      <!-- Header -->
      <div class="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ artefact?.name || 'Document Viewer' }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400" v-if="artefact">
              {{ artefact.type }} • {{ artefact.category }} • {{ artefact.size }}
            </p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="closeModal"
          />
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <div class="text-center">
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4"
            />
            <p class="text-gray-600 dark:text-gray-400">Loading document...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center h-full">
          <div class="text-center">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-8 h-8 text-red-500 mx-auto mb-4"
            />
            <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
            <UButton @click="retry" color="primary" variant="outline"> Try Again </UButton>
          </div>
        </div>

        <!-- Document Content -->
        <div v-else-if="viewContent" class="h-full overflow-auto">
          <div v-html="viewContent" class="prose prose-sm max-w-none dark:prose-invert"></div>
        </div>

        <!-- Fallback View -->
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-center">
            <UIcon name="i-heroicons-document" class="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400 mb-4">Unable to preview this file type.</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-end items-center">
          <UButton @click="closeModal" color="gray" variant="outline"> Close </UButton>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { useArtefactsStore } from '~/stores/artefacts'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import mammoth from 'mammoth'

interface Props {
  isOpen: boolean
  artefact: any | null
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive data
const isLoading = ref(false)
const error = ref<string | null>(null)
const viewContent = ref<string | null>(null)
const fileUrl = ref<string | null>(null)
const fileType = ref<string | null>(null)

// Import stores and composables
const artefactsStore = useArtefactsStore()
const { showError } = useNotification()

// Helper function to clear content
const clearContent = () => {
  viewContent.value = null
  fileUrl.value = null
  fileType.value = null
  error.value = null
  isLoading.value = false
}

// Watch for both artefact and modal state changes
watch(
  () => [props.artefact, props.isOpen],
  async ([newArtefact, isOpen]) => {
    if (isOpen && newArtefact) {
      await loadDocument()
    } else if (!isOpen) {
      // Clear content when modal closes
      clearContent()
    }
  },
  { immediate: true },
)

const loadDocument = async () => {
  if (!props.artefact) return

  isLoading.value = true
  error.value = null
  viewContent.value = null
  fileUrl.value = null

  try {
    const result = await artefactsStore.viewArtefact(props.artefact.id)

    if (result.success && result.data) {
      fileUrl.value = result.data.fileUrl
      fileType.value = result.data.fileType

      // Render content based on file type
      await renderContentByFileType(result.data.fileType, result.data.fileUrl)
    } else {
      error.value = result.message || 'Failed to load document'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load document'
    showError(error.value)
  } finally {
    isLoading.value = false
  }
}

const renderContentByFileType = async (fileType: string, fileUrl: string) => {
  viewContent.value = null
  try {
    if (fileType === 'url') {
      viewContent.value = `<p>Unable to preview this URL.</p>`
      return
    }

    // For PDFs and images, use the signed URL directly
    if (fileType === 'pdf') {
      viewContent.value = `<iframe src="${fileUrl}" class="w-full h-full border-0" style="height: calc(100vh - 180px);"></iframe>`
      return
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
      viewContent.value = `<div class="flex items-center justify-center h-full" style="height: calc(100vh - 180px);"><img src="${fileUrl}" class="max-w-full max-h-full object-contain rounded-md shadow-lg" alt="Document image" /></div>`
      return
    }

    const response = await fetch(`/api/artefacts/proxy?fileUrl=${encodeURIComponent(fileUrl)}`)

    if (!response.ok) throw new Error('Failed to fetch content')

    const responseData = await response.json()

    const base64Data = responseData.data
    const decodedData = atob(base64Data)

    switch (fileType) {
      case 'txt':
        viewContent.value = `<div style="height: calc(100vh - 190px); overflow-y: auto; margin: 20px;"><pre style="white-space: pre-wrap; padding: 1rem; background: #1e293b; color: #e2e8f0; border-radius: 0.375rem;">${escapeHtml(decodedData)}</pre></div>`
        break

      case 'md': {
        const htmlContent = marked(decodedData, {
          gfm: true,
          breaks: true,
        })
        viewContent.value = `<div style="height: calc(100vh - 190px); overflow-y: auto; background: #1e293b; border-radius: 0.375rem; margin: 20px;"><div style="padding: 1rem; color: #e2e8f0;" class="prose prose-sm max-w-none prose-invert">${DOMPurify.sanitize(htmlContent)}</div></div>`
        break
      }

      case 'csv': {
        const csvText = decodedData
        const tableHTML = parseCSVToHTML(csvText)
        viewContent.value = tableHTML
        break
      }

      case 'docx': {
        let arrayBuffer

        try {
          if (decodedData.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,')) {
            // Extract base64 content after the prefix
            const base64Content = decodedData.split(',')[1]
            const binaryString = atob(base64Content)
            arrayBuffer = new ArrayBuffer(binaryString.length)
            const view = new Uint8Array(arrayBuffer)
            for (let i = 0; i < binaryString.length; i++) {
              view[i] = binaryString.charCodeAt(i)
            }
          } else {
            // Convert string to ArrayBuffer
            const binaryString = decodedData
            arrayBuffer = new ArrayBuffer(binaryString.length)
            const view = new Uint8Array(arrayBuffer)
            for (let i = 0; i < binaryString.length; i++) {
              view[i] = binaryString.charCodeAt(i)
            }
          }

          mammoth
            .convertToHtml({ arrayBuffer: arrayBuffer })
            .then((result) => {
              viewContent.value = `<div style="height: calc(100vh - 190px); overflow-y: auto; margin: 20px;"><div style="padding: 1rem; white-space: pre-wrap; background: #1e293b; color: #e2e8f0; border-radius: 0.375rem;">${result.value}</div></div>`
            })
            .catch((err) => {
              viewContent.value = `<p>Failed to load the file.</p>`
            })
        } catch (err) {
          viewContent.value = `<p>Failed to load the file.</p>`
        }
        break
      }

      case 'json':
        try {
          const jsonData = JSON.parse(decodedData)
          viewContent.value = `<div style="height: calc(100vh - 190px); overflow-y: auto; margin: 20px;"><pre style="white-space: pre-wrap; padding: 1rem; background: #1e293b; color: #e2e8f0; border-radius: 0.375rem;">${escapeHtml(JSON.stringify(jsonData, null, 2))}</pre></div>`
        } catch {
          viewContent.value = `<div style="height: calc(100vh - 190px); overflow-y: auto; margin: 20px;"><pre style="white-space: pre-wrap; padding: 1rem; background: #1e293b; color: #e2e8f0; border-radius: 0.375rem;">${escapeHtml(decodedData)}</pre></div>`
        }
        break

      case 'html':
        // For security, we'll show HTML as text
        viewContent.value = `<div style="height: calc(100vh - 190px); overflow-y: auto; margin: 20px;"><pre style="white-space: pre-wrap; padding: 1rem; background: #1e293b; color: #e2e8f0; border-radius: 0.375rem;">${escapeHtml(decodedData)}</pre></div>`
        break

      default:
        viewContent.value = `<p>Unable to preview this file.</p>`
    }
  } catch (error) {
    viewContent.value = `<p>Failed to load the file.</p>`
  }
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Parse CSV text to HTML table with robust parsing
const parseCSVToHTML = (csvContent: string): string => {
  // Split the CSV content into rows
  const rows = csvContent.split('\n').filter((row) => row.trim() !== '')

  // Parse each row
  const parsedRows = rows.map((row) => {
    const regex = /(?:,|\n|^)(\"([^\"]*)\"|([^\",]*))/g
    const parsedRow: string[] = []
    let match
    let lastIndex = 0

    while ((match = regex.exec(row)) !== null) {
      let value = match[2] ? match[2] : match[3]
      parsedRow.push(value)
      lastIndex = match.index + match[0].length
    }
    return parsedRow
  })

  // Ensure that all rows have the same length
  const columnCount = Math.max(...parsedRows.map((row) => row.length))
  parsedRows.forEach((row) => {
    while (row.length < columnCount) {
      row.push('')
    }
  })

  // Remove quotes from headers
  const headers = parsedRows[0].map((header) => header?.replace(/"/g, ''))

  let tableHTML = '<div style="height: calc(100vh - 190px); overflow-y: auto; margin: 20px; background: #1e293b; border-radius: 0.375rem; padding: 1rem;"><table class="table-auto border-collapse border border-gray-300"><thead><tr>'

  headers.forEach((col) => {
    tableHTML += `<th class="border border-gray-300 p-2">${escapeHtml(col)}</th>`
  })

  tableHTML += '</tr></thead><tbody>'

  // Add table rows
  parsedRows.slice(1).forEach((row) => {
    tableHTML += '<tr>'
    row.forEach((cell) => {
      tableHTML += `<td class="border border-gray-300 p-2">${escapeHtml(cell)}</td>`
    })
    tableHTML += '</tr>'
  })

  tableHTML += '</tbody></table></div>'
  return tableHTML
}

const retry = async () => {
  await loadDocument()
}

const closeModal = () => {
  emit('update:isOpen', false)
  emit('close')
  clearContent()
}
</script>

<style scoped>
/* Custom styles for document content */
.prose {
  color: #1f2937;
}

.prose pre {
  background-color: white;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
  color: #1f2937;
}

.prose table {
  font-size: 0.875rem;
}

.prose td {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
}

/* Global markdown styling for rendered content - Dark theme */
:deep(.prose h1) {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: #e2e8f0;
}

:deep(.prose h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
  color: #e2e8f0;
}

:deep(.prose h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: #e2e8f0;
}

:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6) {
  font-size: 1rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: #e2e8f0;
}

:deep(.prose p) {
  margin: 1rem 0;
  color: #e2e8f0;
  line-height: 1.6;
}

:deep(.prose code) {
  background: #334155;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  color: #fbbf24;
  font-size: 0.875rem;
}

:deep(.prose pre) {
  background: #0f172a;
  padding: 1rem;
  border-radius: 0.375rem;
  margin: 1rem 0;
  overflow-x: auto;
  color: #e2e8f0;
  border: 1px solid #334155;
}

:deep(.prose pre code) {
  background: transparent;
  padding: 0;
  color: #e2e8f0;
}

:deep(.prose blockquote) {
  border-left: 4px solid #475569;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #94a3b8;
}

:deep(.prose ul),
:deep(.prose ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

:deep(.prose li) {
  margin: 0.25rem 0;
  color: #e2e8f0;
}

:deep(.prose a) {
  color: #60a5fa;
  text-decoration: underline;
}

:deep(.prose a:hover) {
  color: #3b82f6;
}

:deep(.prose hr) {
  border: none;
  border-top: 1px solid #475569;
  margin: 2rem 0;
}

:deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

:deep(.prose th),
:deep(.prose td) {
  border: 1px solid #475569;
  padding: 0.5rem;
  text-align: left;
  color: #e2e8f0;
}

:deep(.prose th) {
  background-color: #334155;
  font-weight: 600;
}

:deep(.prose td) {
  background-color: #1e293b;
}
</style>
