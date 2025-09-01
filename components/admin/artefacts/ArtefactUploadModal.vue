<template>
  <UModal
    :model-value="isOpen"
    @update:model-value="canCloseModal ? $emit('update:isOpen', $event) : null"
    :ui="{ width: 'sm:max-w-4xl' }"
    :class="{ 'disabled-modal': disabledControl }"
    preventClose
  >
    <div class="p-8" :class="{ 'upload-in-progress': isAnyOperationInProgress }">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-dark-600">
        <div>
          <h3 class="text-xl font-semibold text-white">Please choose an upload method:</h3>
          <div
            v-if="isAnyOperationInProgress"
            class="mt-2 flex items-center text-amber-400 text-sm"
          >
            <UIcon name="heroicons:lock-closed" class="w-4 h-4 mr-1" />
            <div
              class="animate-spin w-3 h-3 border border-amber-400 border-t-transparent rounded-full mr-2"
            ></div>
            <span>{{ currentOperationMessage }}</span>
          </div>
        </div>
        <UButton
          @click="canCloseModal ? $emit('close') : null"
          variant="ghost"
          icon="heroicons:x-mark"
          color="gray"
          size="md"
          :disabled="isAnyOperationInProgress"
          class="hover:bg-dark-700"
        />
      </div>

      <!-- Upload Method Tabs -->
      <div class="mb-6" :class="{ 'pointer-events-none opacity-60': isAnyOperationInProgress }">
        <UTabs v-model="uploadType" :items="tabItems" :disabled="isAnyOperationInProgress">
          <template #file>
            <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
              <!-- File Category - First Position -->
              <UFormGroup label="File Category" name="category" required>
                <UInputMenu
                  v-model="state.category"
                  :options="categoryOptions"
                  placeholder="Select a Category or Add a new one"
                  :loading="isAnyOperationInProgress || categoriesLoading"
                  searchable
                  :disabled="isAnyOperationInProgress || categoriesLoading"
                  value-attribute="label"
                  :uiMenu="{
                    option: {
                      container: 'flex items-center w-full',
                    },
                  }"
                >
                  <template #option="{ option: category }">
                    <div class="relative flex items-center w-full p-2 pr-0">
                      <span class="truncate">{{ category.label }}</span>

                      <!-- Fully interactive button wrapper -->
                      <div
                        class="absolute right-2"
                        style="pointer-events: auto"
                        @mousedown.stop.prevent
                      >
                        <UButton
                          v-if="state.category !== category.label && !categoriesLoading"
                          @click="deleteCategory(category.value)"
                          :ui="{ rounded: 'rounded-full' }"
                          icon="i-heroicons:trash"
                          variant="outline"
                          color="red"
                          size="xs"
                          :loading="isAnyOperationInProgress || categoriesLoading"
                          :disabled="isAnyOperationInProgress || categoriesLoading"
                        />
                      </div>
                    </div>
                  </template>
                  <template #option-empty="{ query }">
                    <div class="flex items-center justify-between w-full p-2">
                      <span class="text-gray-500">
                        <q>{{ query }}</q> category not found! Want to add?
                      </span>
                      <UButton
                        @click="addCategory(query)"
                        color="primary"
                        size="xs"
                        :loading="isAnyOperationInProgress || categoriesLoading"
                        :disabled="isAnyOperationInProgress || categoriesLoading"
                      >
                        {{ categoriesLoading ? 'Loading...' : 'Add' }}
                      </UButton>
                    </div>
                  </template>
                  <template #empty> No categories found </template>
                </UInputMenu>
              </UFormGroup>

              <!-- Drag and Drop File Upload -->
              <UFormGroup label="File" name="file" required>
                <div
                  @drop.prevent="!isAnyOperationInProgress && handleDrop($event)"
                  @dragover.prevent="!isAnyOperationInProgress && handleDragOver($event)"
                  @dragenter.prevent="!isAnyOperationInProgress && handleDragEnter($event)"
                  @dragleave.prevent="!isAnyOperationInProgress && handleDragLeave($event)"
                  class="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center transition-colors relative"
                  :class="{
                    'border-blue-500 bg-blue-500/10': isDragOver && !isAnyOperationInProgress,
                    'border-green-500 bg-green-500/10': state.file,
                    'hover:border-dark-500':
                      !isDragOver && !state.file && !isAnyOperationInProgress,
                    'opacity-50 cursor-not-allowed': isAnyOperationInProgress,
                  }"
                >
                  <div v-if="!state.file" class="py-4">
                    <UIcon
                      name="heroicons:cloud-arrow-up"
                      class="w-16 h-16 text-gray-400 mx-auto mb-4"
                    />
                    <p class="text-lg text-gray-300 mb-2">
                      <span class="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-sm text-gray-400 mb-4">PDF, Word, TXT, CSV, Markdown, Images</p>
                    <p class="text-xs text-gray-500">Maximum file size: 20MB</p>
                    <input
                      ref="fileInput"
                      type="file"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.txt,.csv,.md,.png,.jpg,.jpeg"
                      @change="handleFileSelect"
                      :disabled="isAnyOperationInProgress"
                    />
                  </div>
                  <div v-else class="flex items-center justify-between py-4">
                    <div class="flex items-center space-x-4">
                      <UIcon name="heroicons:document" class="w-10 h-10 text-green-400" />
                      <div class="text-left">
                        <p class="text-white font-medium truncate max-w-md">
                          {{ state.file.name }}
                        </p>
                        <p class="text-sm text-gray-400">
                          {{ formatFileSize(state.file.size) }} • {{ getFileType(state.file.name) }}
                        </p>
                      </div>
                    </div>
                    <UButton
                      @click="removeFile"
                      variant="ghost"
                      icon="heroicons:x-mark"
                      color="red"
                      size="md"
                      :disabled="isAnyOperationInProgress"
                    />
                  </div>
                </div>
              </UFormGroup>

              <!-- Description -->
              <UFormGroup label="Description (Optional)" name="description">
                <UTextarea
                  v-model="state.description"
                  placeholder="Short description (max 100 characters)"
                  :maxlength="100"
                  :rows="3"
                  size="lg"
                  :disabled="isAnyOperationInProgress"
                />
                <p class="text-xs text-gray-400 mt-1">
                  {{ state.description?.length || 0 }}/100 characters
                </p>
              </UFormGroup>

              <div class="flex justify-end space-x-3 pt-6 border-t border-dark-600 mt-6">
                <UButton
                  @click="canCloseModal ? $emit('close') : null"
                  :disabled="isAnyOperationInProgress"
                  variant="outline"
                  color="gray"
                  size="lg"
                  class="min-w-[120px]"
                >
                  Cancel
                </UButton>
                <UButton
                  type="submit"
                  :loading="isUploading"
                  :disabled="isAnyOperationInProgress"
                  color="primary"
                  size="lg"
                  class="min-w-[120px]"
                  icon="heroicons:cloud-arrow-up"
                >
                  {{ isUploading ? 'Uploading...' : 'Upload' }}
                </UButton>
              </div>
            </UForm>
          </template>

          <template #google>
            <div class="space-y-6">
              <!-- File Category - First Position -->
              <UFormGroup label="File Category" required>
                <UInputMenu
                  v-model="googleDriveState.category"
                  :options="categoryOptions"
                  placeholder="Select a Category or Add a new one"
                  :loading="isAnyOperationInProgress || categoriesLoading"
                  searchable
                  :disabled="isAnyOperationInProgress || categoriesLoading"
                  value-attribute="label"
                  :uiMenu="{
                    option: {
                      container: 'flex items-center w-full',
                    },
                  }"
                >
                  <template #option="{ option: category }">
                    <div class="relative flex items-center w-full p-2 pr-0">
                      <span class="truncate">{{ category.label }}</span>

                      <!-- Fully interactive button wrapper -->
                      <div
                        class="absolute right-2"
                        style="pointer-events: auto"
                        @mousedown.stop.prevent
                      >
                        <UButton
                          v-if="googleDriveState.category !== category.label && !categoriesLoading"
                          @click="deleteCategory(category.value)"
                          :ui="{ rounded: 'rounded-full' }"
                          icon="i-heroicons:trash"
                          variant="outline"
                          color="red"
                          size="xs"
                          :loading="isAnyOperationInProgress || categoriesLoading"
                          :disabled="isAnyOperationInProgress || categoriesLoading"
                        />
                      </div>
                    </div>
                  </template>
                  <template #option-empty="{ query }">
                    <div class="flex items-center justify-between w-full p-2">
                      <span class="text-gray-500">
                        <q>{{ query }}</q> category not found! Want to add?
                      </span>
                      <UButton
                        @click="addCategory(query)"
                        color="primary"
                        size="xs"
                        :loading="isAnyOperationInProgress || categoriesLoading"
                        :disabled="isAnyOperationInProgress || categoriesLoading"
                      >
                        {{ categoriesLoading ? 'Loading...' : 'Add' }}
                      </UButton>
                    </div>
                  </template>
                  <template #empty> No categories found </template>
                </UInputMenu>
              </UFormGroup>

              <!-- Method 1: Google Drive URL -->
              <UFormGroup label="Option 1: Google Drive Public URL">
                <div class="flex space-x-2">
                  <input
                    v-model="googleDriveState.url"
                    type="url"
                    placeholder="Google drive URL eg: https://drive.google.com/drive/folders/1UMPf5gDy_mCW4v"
                    class="flex-1 px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    :disabled="isAnyOperationInProgress"
                  />
                  <UButton
                    @click="fetchGoogleDriveFiles"
                    :loading="isFetchingFiles"
                    :disabled="isAnyOperationInProgress"
                    color="primary"
                    size="lg"
                    class="min-w-[100px]"
                  >
                    {{ isFetchingFiles ? 'Fetching...' : 'Fetch Files' }}
                  </UButton>
                </div>
              </UFormGroup>

              <!-- OR Divider -->
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-dark-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-dark-800 text-gray-400 font-medium">OR</span>
                </div>
              </div>

              <!-- Method 2: OAuth Integration -->
              <UFormGroup label="Option 2: Google OAuth Integration">
                <UButton
                  @click="handleGoogleOAuthSignIn"
                  :loading="isGoogleSignInLoading || isGoogleOAuthInProgress"
                  :disabled="isAnyOperationInProgress"
                  color="gray"
                  size="lg"
                  class="w-full"
                  icon="i-logos-google-drive"
                >
                  {{
                    isGoogleSignInLoading
                      ? 'Connecting to Google...'
                      : isGoogleOAuthInProgress
                        ? 'Processing selection...'
                        : 'Sign in with Google Drive'
                  }}
                </UButton>
              </UFormGroup>

              <!-- Note -->
              <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div class="flex items-start space-x-3">
                  <UIcon name="heroicons:information-circle" class="w-5 h-5 text-blue-400 mt-0.5" />
                  <div class="text-sm text-blue-300">
                    <p class="font-medium mb-1">Note:</p>
                    <p>
                      By signing in, you allow us to access your Google Drive and download selected
                      files to our server. Your files are not stored or shared beyond this process.
                    </p>
                    <p class="mt-2">
                      Supported file types: CSV, MS Word, PDF, Markdown, and Text files
                    </p>
                  </div>
                </div>
              </div>

              <!-- Files Table -->
              <div class="border border-dark-700 rounded-lg overflow-hidden">
                <!-- Table Header with selection controls -->
                <div class="bg-dark-900 px-4 py-3 border-b border-dark-700">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-300">
                      Files from Google Drive
                      <span v-if="isFetchingFiles" class="text-amber-400 animate-pulse">
                        (fetching...)
                      </span>
                      <span v-else-if="googleDriveFiles.length > 0" class="text-gray-500">
                        ({{ selectedGoogleDriveFiles.length }}/{{ googleDriveFiles.length }}
                        selected)
                      </span>
                      <span v-else-if="isUploadingFromGoogleDrive" class="text-blue-400">
                        (uploading selected files...)
                      </span>
                    </h3>
                    <div v-if="googleDriveFiles.length > 0" class="flex items-center space-x-2">
                      <UButton
                        @click="selectAllGoogleDriveFiles"
                        variant="ghost"
                        size="xs"
                        color="gray"
                        :disabled="
                          selectedGoogleDriveFiles.length === googleDriveFiles.length ||
                          isAnyOperationInProgress
                        "
                      >
                        Select All
                      </UButton>
                      <UButton
                        @click="clearGoogleDriveSelection"
                        variant="ghost"
                        size="xs"
                        color="gray"
                        :disabled="
                          selectedGoogleDriveFiles.length === 0 || isAnyOperationInProgress
                        "
                      >
                        Clear All
                      </UButton>
                    </div>
                  </div>
                </div>

                <div
                  class="bg-dark-800 min-h-[200px]"
                  :class="{ 'pointer-events-none opacity-60': isAnyOperationInProgress }"
                >
                  <div v-if="googleDriveFiles.length === 0" class="text-center py-16">
                    <UIcon
                      :name="isFetchingFiles ? 'heroicons:arrow-path' : 'heroicons:folder-open'"
                      :class="[
                        'w-12 h-12 mx-auto mb-3',
                        isFetchingFiles ? 'text-blue-400 animate-spin' : 'text-gray-500',
                      ]"
                    />
                    <p v-if="isFetchingFiles" class="text-blue-400 text-sm">
                      Fetching files from Google Drive...
                    </p>
                    <p v-else class="text-gray-400 text-sm">No files available for selection.</p>
                    <p v-if="!isFetchingFiles" class="text-gray-500 text-xs mt-1">
                      Enter a Google Drive URL and click "Fetch Files" to see available files.
                    </p>
                  </div>

                  <UTable
                    v-else
                    v-model="selectedGoogleDriveFiles"
                    :rows="googleDriveFiles"
                    :columns="googleDriveColumns"
                    :loading="false"
                    :selection-disabled="isAnyOperationInProgress"
                    class="divide-y divide-dark-700"
                    :ui="{
                      wrapper: 'relative overflow-x-auto',
                      base: 'min-w-full table-fixed',
                      thead: 'bg-dark-900',
                      tbody: 'bg-dark-800 divide-y divide-dark-700 [&>tr:hover]:bg-dark-700/50',
                      tr: {
                        base: '',
                        selected: 'bg-blue-500/10',
                        active: '',
                      },
                      th: {
                        base: 'text-left rtl:text-left',
                        padding: 'px-4 py-3',
                        color: 'text-gray-400',
                        font: 'font-medium text-xs',
                        size: 'text-xs',
                      },
                      td: {
                        base: 'whitespace-nowrap',
                        padding: 'px-4 py-3',
                        color: 'text-gray-300',
                        font: '',
                        size: 'text-sm',
                      },
                    }"
                  >
                    <!-- File name column with icon -->
                    <template #name-data="{ row }">
                      <div class="flex items-center">
                        <div
                          class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3"
                        >
                          <UIcon :name="getFileIcon(row.type)" class="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div class="text-sm font-medium text-white truncate max-w-xs">
                            {{ row.name }}
                          </div>
                          <div v-if="row.modifiedTime" class="text-xs text-gray-500">
                            Modified: {{ formatDate(row.modifiedTime) }}
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- File type with badge -->
                    <template #type-data="{ row }">
                      <span
                        class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400"
                      >
                        {{ row.type }}
                      </span>
                    </template>

                    <!-- File size -->
                    <template #size-data="{ row }">
                      <span class="text-sm text-gray-300">{{ row.size }}</span>
                    </template>
                  </UTable>
                </div>
              </div>

              <!-- Bottom Actions -->
              <div class="flex justify-end space-x-3 pt-6 border-t border-dark-600 mt-6">
                <UButton
                  @click="canCloseModal ? $emit('close') : null"
                  :disabled="isAnyOperationInProgress"
                  variant="outline"
                  color="gray"
                  size="lg"
                  class="min-w-[120px]"
                >
                  Cancel
                </UButton>
                <UButton
                  @click="uploadFromGoogleDrive"
                  :disabled="selectedGoogleDriveFiles.length === 0 || isAnyOperationInProgress"
                  :loading="isUploadingFromGoogleDrive"
                  color="primary"
                  size="lg"
                  class="min-w-[120px]"
                  icon="heroicons:cloud-arrow-up"
                >
                  {{
                    isUploadingFromGoogleDrive
                      ? 'Uploading...'
                      : `Upload Selected (${selectedGoogleDriveFiles.length})`
                  }}
                </UButton>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { nextTick, onMounted, onUnmounted, withDefaults } from 'vue'
import { useArtefactsStore } from '~/stores/artefacts'
import { useNotification } from '~/composables/useNotification'
import {
  useGoogleDrive,
  type GoogleDriveFile as GoogleOAuthFile,
} from '~/composables/useGoogleDrive'

interface GoogleDriveFile {
  id: string
  name: string
  type: string
  size: string
  mimeType?: string
  webViewLink?: string
  thumbnailLink?: string
  modifiedTime?: string
}

interface Props {
  isOpen: boolean
  availableCategories: string[]
  categoriesLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  categoriesLoading: false,
})

// Initialize artefacts store
const artefactsStore = useArtefactsStore()

// Initialize notification composable
const { showError, showWarning, showSuccess } = useNotification()

// Initialize Google Drive OAuth composable
const googleDrive = useGoogleDrive()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  close: []
  fileUploaded: [artefact: any]
  googleDriveUploaded: [artefacts: any[]]
  categoryAdded: [category: string]
  categoryDeleted: [category: string]
}>()

// Form validation schema
const schema = z.object({
  file: z.any().refine((file) => file !== null, 'File is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(100, 'Description must be 100 characters or less').optional(),
})

type Schema = z.output<typeof schema>

// Upload type - default to file upload (0 = file, 1 = google)
const uploadType = ref(0)

// Tab items for UTabs
const tabItems = [
  {
    value: 0,
    slot: 'file',
    label: 'File Upload',
    icon: 'i-heroicons-document',
  },
  {
    value: 1,
    slot: 'google',
    label: 'Google Drive',
    icon: 'i-logos-google-drive',
  },
]

// Google Drive state
const googleDriveState = reactive({
  category: '',
  url: '',
})

// Google Drive computed properties from store
const googleDriveFiles = computed(() => artefactsStore.googleDriveFiles)

// Selected Google Drive files for checkbox selection
const selectedGoogleDriveFiles = ref<GoogleDriveFile[]>([])

// Google Drive table columns
const googleDriveColumns = [
  {
    key: 'name',
    label: 'File Name',
    sortable: true,
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
  },
  {
    key: 'size',
    label: 'Size',
    sortable: true,
  },
]

// Form state for UForm
const state = reactive({
  file: null as File | null,
  category: '',
  description: '',
})

// Drag and drop state
const isDragOver = ref(false)
const dragCounter = ref(0)

// Comprehensive loading state management
const isUploading = ref(false)
const isGoogleOAuthInProgress = ref(false)

// Computed loading states for different operations
const isUploadingFromGoogleDrive = computed(() => artefactsStore.isUploadingGoogleDrive)
const isFetchingFiles = computed(() => artefactsStore.isLoadingGoogleDrive)
const isGoogleSignInLoading = computed(() => googleDrive.isLoading.value)

// Master loading state - true when ANY operation is in progress
const isAnyOperationInProgress = computed(
  () =>
    isUploading.value ||
    isUploadingFromGoogleDrive.value ||
    isFetchingFiles.value ||
    isGoogleSignInLoading.value ||
    isGoogleOAuthInProgress.value,
)

// Modal and form control states
const disabledControl = computed(() => isAnyOperationInProgress.value)
const canCloseModal = computed(() => !isAnyOperationInProgress.value)

// Dynamic loading message based on current operation
const currentOperationMessage = computed(() => {
  if (isUploading.value) {
    return 'Uploading file - modal locked'
  }
  if (isUploadingFromGoogleDrive.value) {
    return 'Uploading files from Google Drive - modal locked'
  }
  if (isFetchingFiles.value) {
    return 'Fetching files from Google Drive - modal locked'
  }
  if (isGoogleSignInLoading.value || isGoogleOAuthInProgress.value) {
    return 'Connecting to Google Drive - modal locked'
  }
  return 'Upload in progress - modal locked'
})

// File input ref
const fileInput = ref<HTMLInputElement>()

// Category options for USelectMenu
const categoryOptions = computed(() => {
  if (props.categoriesLoading) {
    return [{ label: 'Loading categories...', value: '', deletable: false }]
  }
  return props.availableCategories.map((category) => ({
    label: category,
    value: category,
    deletable: true,
  }))
})

// Drag and drop handlers
const handleDragEnter = (e: DragEvent) => {
  if (isAnyOperationInProgress.value) return
  e.preventDefault()
  dragCounter.value++
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  if (isAnyOperationInProgress.value) return
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragOver.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  if (isAnyOperationInProgress.value) return
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  if (isAnyOperationInProgress.value) return
  e.preventDefault()
  isDragOver.value = false
  dragCounter.value = 0

  const files = e.dataTransfer?.files
  if (files && files[0]) {
    setFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  if (isAnyOperationInProgress.value) return
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setFile(target.files[0])
  }
}

const setFile = (file: File) => {
  try {
    // Validate file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      showError('File size must be less than 20MB')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'text/markdown',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ]
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      showError(
        'Unsupported file type. Please upload PDF, Word, TXT, CSV, Markdown, or Image files.',
      )
      return
    }

    state.file = file
  } catch (error) {
    showError('Failed to process the selected file. Please try again.')
  }
}

const removeFile = () => {
  try {
    state.file = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    isDragOver.value = false
    dragCounter.value = 0
  } catch (error) {
    showError('Failed to remove file. Please try again.')
  }
}

const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    txt: 'TXT',
    csv: 'CSV',
    md: 'Markdown',
    png: 'Image',
    jpg: 'Image',
    jpeg: 'Image',
  }
  return typeMap[extension || ''] || 'Unknown'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'kB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// UForm submission handler
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    isUploading.value = true

    // Create FormData for the upload
    const formData = new FormData()
    formData.append('file', event.data.file)
    formData.append('category', event.data.category)
    formData.append('description', event.data.description || '')

    // Call the store upload method
    const result = await artefactsStore.uploadArtefact(formData)

    if (!result.success) {
      showError(result.message || 'Upload failed. Please try again.')
      return
    }

    // Emit the uploaded artefact data
    emit('fileUploaded', result.data)

    // Reset form
    state.file = null
    state.category = ''
    state.description = ''

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    showSuccess(result.message || 'File uploaded successfully!')
    emit('close')
  } catch (error) {
    showError('Upload failed. Please try again.')
  } finally {
    // Always reset loading state
    isUploading.value = false
  }
}

// Google Drive methods
const validateGoogleDriveUrl = (url: string): boolean => {
  const urlRegex = /^https?:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]{32,}\/?$/
  return urlRegex.test(url)
}

const fetchGoogleDriveFiles = async () => {
  if (!googleDriveState.url) {
    showWarning('Please enter a Google Drive URL')
    return
  }

  // Validate URL format
  if (!validateGoogleDriveUrl(googleDriveState.url)) {
    showError('Invalid Google Drive URL. Please use a valid folder URL.')
    return
  }

  try {
    // Clear previous selection when fetching new files
    selectedGoogleDriveFiles.value = []

    const result = await artefactsStore.fetchGoogleDriveFiles(googleDriveState.url)

    if (!result.success) {
      showError(result.message || 'Failed to fetch files from Google Drive')
      selectedGoogleDriveFiles.value = []
    } else if (result.files.length === 0) {
      showWarning('No supported files found in the Google Drive folder')
      selectedGoogleDriveFiles.value = []
    } else {
      showSuccess(
        `Found ${result.files.length} supported file${result.files.length > 1 ? 's' : ''} available for selection`,
      )
    }
  } catch (error) {
    showError('Failed to fetch files from Google Drive. Please check the URL and try again.')
    // Clear any partial data on error
    selectedGoogleDriveFiles.value = []
    artefactsStore.clearGoogleDriveFiles()
  }
}

const uploadFromGoogleDrive = async () => {
  if (!googleDriveState.category) {
    showWarning('Please select a category')
    return
  }

  if (selectedGoogleDriveFiles.value.length === 0) {
    showWarning('Please select files to upload')
    return
  }

  try {
    // Call the store method to upload files
    const result = await artefactsStore.uploadGoogleDriveFiles(
      selectedGoogleDriveFiles.value,
      googleDriveState.category,
    )

    if (!result.success) {
      showError(result.message || 'Upload failed. Please try again.')
      return
    }

    // Create artefact objects from uploaded files
    const newArtefacts = result.files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      description: 'Uploaded from Google Drive',
      category: googleDriveState.category,
      type: file.type,
      size: file.size,
      status: 'processing' as const,
      uploadedBy: 'Current User',
      lastUpdated: new Date().toLocaleString(),
      artefact: file.name,
    }))

    emit('googleDriveUploaded', newArtefacts)

    // Reset Google Drive state
    googleDriveState.category = ''
    googleDriveState.url = ''
    selectedGoogleDriveFiles.value = []
    artefactsStore.clearGoogleDriveFiles()

    showSuccess(result.message || 'Files uploaded successfully!')
    emit('close')
  } catch (error) {
    showError('Upload failed. Please try again.')
    // Don't clear form data on error so user can retry
  }
}

// Google OAuth Integration Handler
const handleGoogleOAuthSignIn = async () => {
  if (!googleDriveState.category) {
    showWarning('Please select a category first')
    return
  }

  try {
    isGoogleOAuthInProgress.value = true

    // Define the callback function that will handle selected files
    const handleSelectedFiles = async (selectedFiles: GoogleOAuthFile[]) => {
      if (selectedFiles.length === 0) {
        // User cancelled the picker or no files selected
        performComprehensiveCleanup()
        return
      }

      try {
        // Check for existing files
        const existingFileNames: string[] = []
        selectedFiles.forEach((file: GoogleOAuthFile) => {
          if (googleDrive.checkFileExistence(file.name, [])) {
            existingFileNames.push(file.name)
          }
        })

        if (existingFileNames.length > 0) {
          showWarning(
            `The following files already exist: ${existingFileNames.join(', ')}. They will be replaced.`,
          )
        }

        // Convert GoogleOAuthFile to ArtefactGoogleDriveFile format for upload
        const convertedFiles = selectedFiles.map((file: GoogleOAuthFile) => ({
          id: file.id,
          name: file.name,
          type: googleDrive.getFileType(file.mimeType),
          size: file.size,
          mimeType: file.mimeType,
          webViewLink: file.webViewLink,
          thumbnailLink: file.thumbnailLink,
          modifiedTime: file.modifiedTime,
          googleAccessToken: file.googleAccessToken,
        }))

        // Upload the files
        const result = await artefactsStore.uploadGoogleDriveFiles(
          convertedFiles,
          googleDriveState.category,
        )

        if (result.success) {
          // Create artefact objects from uploaded files
          const newArtefacts = result.files.map((file) => ({
            id: Date.now() + Math.random(),
            name: file.name,
            description: 'Uploaded from Google Drive (OAuth)',
            category: googleDriveState.category,
            type: file.type,
            size: file.size,
            status: 'processing' as const,
            uploadedBy: 'Current User',
            lastUpdated: new Date().toLocaleString(),
            artefact: file.name,
          }))

          emit('googleDriveUploaded', newArtefacts)

          // Reset state
          googleDriveState.category = ''
          googleDriveState.url = ''
          selectedGoogleDriveFiles.value = []
          artefactsStore.clearGoogleDriveFiles()
          googleDrive.cleanup()

          showSuccess(
            `Successfully uploaded ${result.files.length} file${result.files.length > 1 ? 's' : ''} from Google Drive`,
          )
          emit('close')
        } else {
          showError(result.message || 'Upload failed')
        }
      } catch (uploadError) {
        showError('Failed to upload files. Please try again.')
      } finally {
        isGoogleOAuthInProgress.value = false
      }
    }

    // Start OAuth flow with custom callback
    await googleDrive.signInWithGoogle(handleSelectedFiles)
  } catch (error) {
    showError('Failed to connect to Google Drive. Please try again.')
  } finally {
    // Ensure cleanup is called and loading state is reset
    googleDrive.cleanup()
    isGoogleOAuthInProgress.value = false
  }
}

// Google Drive selection methods
const selectAllGoogleDriveFiles = () => {
  try {
    selectedGoogleDriveFiles.value = [...googleDriveFiles.value]
  } catch (error) {
    showError('Failed to select all files. Please try again.')
  }
}

const clearGoogleDriveSelection = () => {
  try {
    selectedGoogleDriveFiles.value = []
  } catch (error) {
    showError('Failed to clear selection. Please try again.')
  }
}

// Helper methods
const getFileIcon = (fileType: string) => {
  const iconMap: Record<string, string> = {
    PDF: 'heroicons:document-text',
    Word: 'heroicons:document',
    CSV: 'heroicons:table-cells',
    TXT: 'heroicons:document-text',
    Markdown: 'heroicons:document-text',
    Image: 'heroicons:photo',
  }
  return iconMap[fileType] || 'heroicons:document'
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Unknown'
  }
}

// Category management methods
const addCategory = (category: string) => {
  try {
    const trimmedCategory = category.trim()
    if (trimmedCategory) {
      emit('categoryAdded', trimmedCategory)
      state.category = trimmedCategory
      googleDriveState.category = trimmedCategory
    }
  } catch (error) {
    showError('Failed to add category. Please try again.')
  }
}

const deleteCategory = (category: string) => {
  try {
    emit('categoryDeleted', category)
  } catch (error) {
    showError('Failed to delete category. Please try again.')
  }
}

// Comprehensive cleanup function for cancelled or interrupted operations
const performComprehensiveCleanup = () => {
  try {
    // Reset all loading states immediately
    isUploading.value = false
    isGoogleOAuthInProgress.value = false

    // Reset form states
    isDragOver.value = false
    dragCounter.value = 0

    // Clear Google Drive OAuth and picker
    googleDrive.cleanup()

    // Clear store state
    artefactsStore.clearGoogleDriveFiles()

  } catch (error) {
    // Cleanup error handled silently
  }
}

// Reset all form fields when modal opens
const resetAllFields = () => {
  try {
    state.file = null
    state.category = ''
    state.description = ''
    googleDriveState.category = ''
    googleDriveState.url = ''
    selectedGoogleDriveFiles.value = []

    // Perform comprehensive cleanup
    performComprehensiveCleanup()

    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    // Fallback cleanup
    performComprehensiveCleanup()
  }
}

// Watch for modal state changes
watch(
  () => props.isOpen,
  (newVal, oldVal) => {
    try {
      if (newVal) {
        // Modal opened - reset to initial state
        uploadType.value = 0
        resetAllFields()
      } else if (oldVal === true && newVal === false) {
        // Modal closed - perform comprehensive cleanup first, then reset fields
        performComprehensiveCleanup()
        nextTick(() => {
          resetAllFields()
        })
      }
    } catch (error) {
      // Fallback cleanup on error
      performComprehensiveCleanup()
    }
  },
)

// Watch for tab changes to reset form values
watch(uploadType, () => {
  try {
    // Reset form fields when switching between tabs
    state.file = null
    state.category = ''
    state.description = ''
    googleDriveState.category = ''
    googleDriveState.url = ''
    selectedGoogleDriveFiles.value = []

    // Perform comprehensive cleanup
    performComprehensiveCleanup()

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    // Error handled silently
  }
})

// Cleanup when component unmounts
onUnmounted(() => {
  performComprehensiveCleanup()
})

// Cleanup when user navigates away or closes browser
onMounted(() => {
  const handleBeforeUnload = () => {
    performComprehensiveCleanup()
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  // Cleanup the event listener when component unmounts
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
})
</script>

<style scoped>
.upload-in-progress {
  position: relative;
}

.upload-in-progress::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  pointer-events: none;
  z-index: 1;
}

.disabled-modal {
  pointer-events: none;
  opacity: 0.7;
}

/* Disable table interactions completely during operations */
.upload-in-progress .divide-y {
  pointer-events: none;
}

.upload-in-progress table tbody tr {
  cursor: not-allowed !important;
}

.upload-in-progress table tbody tr:hover {
  background-color: inherit !important;
}
</style>
