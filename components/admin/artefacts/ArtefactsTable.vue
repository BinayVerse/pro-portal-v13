<template>
  <div class="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
    <!-- Table Header -->
    <div class="px-6 py-4 border-b border-dark-700">
      <h2 class="text-lg font-semibold text-white">All Artefacts</h2>
      <p class="text-gray-400 text-sm">
        Manage your uploaded artefacts and view their processing status and AI-generated
        summaries.
      </p>
    </div>

    <!-- UTable -->
    <UTable
      :rows="artefacts"
      :columns="columns"
      :loading="loading"
      :sort="{ column: 'lastUpdated', direction: 'desc' }"
      class="divide-y divide-dark-700"
      :ui="{
        wrapper: 'relative overflow-x-auto',
        base: 'min-w-full table-fixed',
        thead: 'bg-dark-900',
        tbody: 'bg-dark-800 divide-y divide-dark-700 [&>tr:hover]:bg-dark-700/50',
        tr: {
          base: '',
          selected: 'bg-dark-700/50',
          active: '',
        },
        th: {
          base: 'text-left rtl:text-right',
          padding: 'px-6 py-3',
          color: 'text-gray-400',
          font: 'font-medium text-xs',
          size: 'text-xs',
        },
        td: {
          base: 'whitespace-nowrap',
          padding: 'px-6 py-4',
          color: 'text-gray-300',
          font: '',
          size: 'text-sm',
        },
      }"
    >
      <!-- Artefact column with icon and description -->
      <template #artefact-data="{ row }">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:document-text" class="w-5 h-5 text-blue-400" />
          </div>
          <div class="ml-3">
            <div class="text-sm font-medium text-white">{{ row.name }}</div>
            <div class="text-sm text-gray-400">{{ row.description }}</div>
          </div>
        </div>
      </template>

      <!-- Category column with badge -->
      <template #category-data="{ row }">
        <span
          class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
          :class="getCategoryColor(row.category)"
        >
          {{ row.category }}
        </span>
      </template>

      <!-- Status column with badge and dot -->
      <template #status-data="{ row }">
        <span
          class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
          :class="getStatusColor(row.status)"
        >
          <div class="w-1.5 h-1.5 rounded-full mr-1" :class="getStatusDotColor(row.status)"></div>
          {{ capitalizeStatus(row.status) }}
        </span>
      </template>

      <!-- Summary column with conditional buttons -->
      <template #summary-data="{ row }">
        <!-- If summarized, show View Summary button -->
        <div v-if="row.summarized === 'Yes'" class="flex items-center space-x-2">
          <UButton
            @click="$emit('viewSummary', row)"
            variant="ghost"
            size="sm"
            icon="heroicons:document-magnifying-glass"
            color="blue"
            class="text-blue-400 hover:text-blue-300"
          >
            View Summary
          </UButton>
        </div>
        <!-- If not processed, show disabled button -->
        <div v-else-if="row.status !== 'processed'">
          <UButton
            variant="ghost"
            size="sm"
            icon="heroicons:document-plus"
            color="gray"
            disabled
            class="text-gray-500 cursor-not-allowed"
          >
            Summarize
          </UButton>
        </div>
        <!-- If processed but not summarized, show Summarize button -->
        <div v-else class="flex items-center space-x-2">
          <UButton
            @click="$emit('summarizeArtefact', row)"
            variant="ghost"
            size="sm"
            icon="heroicons:document-plus"
            :color="isAutoProcessing(row.id) ? 'gray' : 'green'"
            :class="isAutoProcessing(row.id)
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-green-400 hover:text-green-300'"
            :loading="row.isSummarizing || isAutoProcessing(row.id)"
            :disabled="isAutoProcessing(row.id)"
          >
            {{ isAutoProcessing(row.id) ? 'Auto-Processing...' : 'Summarize' }}
          </UButton>
        </div>
      </template>

      <!-- Actions column with action buttons -->
      <template #actions-data="{ row }">
        <div class="flex items-center space-x-2">
          <UTooltip text="View Artefact">
            <button
              @click="$emit('viewArtefact', row)"
              class="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <UIcon name="heroicons:eye" class="w-4 h-4" />
            </button>
          </UTooltip>
          <UTooltip :text="row.status === 'processed' ? 'Document is already processed' : 'Reprocess Artefact'">
            <button
              @click="row.status === 'processed' ? null : $emit('reprocessArtefact', row)"
              :class="[
                'transition-colors',
                row.status === 'processed'
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : 'text-green-400 hover:text-green-300'
              ]"
              :disabled="row.status === 'processed'"
            >
              <UIcon name="heroicons:arrow-path-rounded-square" class="w-4 h-4" />
            </button>
          </UTooltip>
          <UTooltip text="Delete Artefact">
            <button
              @click="$emit('deleteArtefact', row)"
              class="text-red-400 hover:text-red-300 transition-colors"
            >
              <UIcon name="heroicons:trash" class="w-4 h-4" />
            </button>
          </UTooltip>
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'
interface Artefact {
  id: number
  name: string
  description: string
  category: string
  type: string
  size: string
  status: string
  uploadedBy: string
  lastUpdated: string
  artefact: string
  summarized: string
  summary?: string
  isSummarizing?: boolean
}

interface Props {
  artefacts: Artefact[]
  summarizingDocs?: Set<number>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<{
  viewArtefact: [artefact: Artefact]
  reprocessArtefact: [artefact: Artefact]
  deleteArtefact: [artefact: Artefact]
  viewSummary: [artefact: Artefact]
  summarizeArtefact: [artefact: Artefact]
}>()

// Table columns configuration
const columns = [
  {
    key: 'artefact',
    label: 'Artefact',
    sortable: true,
  },
  {
    key: 'category',
    label: 'Category',
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
  {
    key: 'status',
    label: 'Status',
    sortable: true,
  },
  {
    key: 'uploadedBy',
    label: 'Uploaded By',
    sortable: true,
  },
  {
    key: 'lastUpdated',
    label: 'Last Updated',
    sortable: true,
  },
  {
    key: 'summary',
    label: 'Summary',
    sortable: false,
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
  },
]

// Helper methods
const isAutoProcessing = (docId: number): boolean => {
  return props.summarizingDocs?.has(docId) || false
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'HR Policy': 'bg-blue-500/20 text-blue-400',
    Financial: 'bg-green-500/20 text-green-400',
    Technical: 'bg-purple-500/20 text-purple-400',
    Analytics: 'bg-orange-500/20 text-orange-400',
  }
  return colors[category] || 'bg-gray-500/20 text-gray-400'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    processed: 'bg-green-500/20 text-green-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

const getStatusDotColor = (status: string) => {
  const colors: Record<string, string> = {
    processed: 'bg-green-400',
    processing: 'bg-yellow-400',
    failed: 'bg-red-400',
  }
  return colors[status] || 'bg-gray-400'
}

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
</script>
