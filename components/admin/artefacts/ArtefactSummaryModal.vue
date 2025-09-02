<template>
  <UModal 
    :model-value="isOpen" 
    @update:model-value="$emit('update:isOpen', $event)" 
    :ui="{ width: 'sm:max-w-2xl' }"
  >
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:document-text" class="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">{{ artefact?.name }}</h3>
            <p class="text-sm text-gray-400">{{ artefact?.description }}</p>
          </div>
        </div>
        <UButton
          @click="$emit('close')"
          variant="ghost"
          icon="heroicons:x-mark"
          color="gray"
          size="sm"
        />
      </div>

      <div class="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-400">Category:</span>
          <span class="ml-2 text-white">{{ artefact?.category }}</span>
        </div>
        <div>
          <span class="text-gray-400">Type:</span>
          <span class="ml-2 text-white">{{ artefact?.type }}</span>
        </div>
        <div>
          <span class="text-gray-400">Size:</span>
          <span class="ml-2 text-white">{{ artefact?.size }}</span>
        </div>
        <div>
          <span class="text-gray-400">Status:</span>
          <span
            class="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
            :class="getStatusColor(artefact?.status)"
          >
            <div
              class="w-1.5 h-1.5 rounded-full mr-1"
              :class="getStatusDotColor(artefact?.status)"
            ></div>
            {{ capitalizeStatus(artefact?.status || '') }}
          </span>
        </div>
      </div>

      <div class="border-t border-dark-700 pt-4">
        <h4 class="text-sm font-medium text-white mb-3">AI-Generated Summary</h4>
        <div class="bg-dark-700 rounded-lg p-4">
          <p class="text-gray-300 text-sm leading-relaxed">
            {{
              artefact?.summarized && artefact?.summary
                ? artefact.summary
                : artefact?.status === 'processed'
                ? `This ${artefact?.type} document contains comprehensive information about ${artefact?.category?.toLowerCase()} matters. The AI analysis reveals key insights and important data points that can be leveraged for decision-making processes. Based on the document structure and content patterns, this artefact provides valuable resource material for organizational operations and strategic planning.`
                : 'Summary is not available yet. The document is still being processed by our AI system. Please check back once the processing is complete.'
            }}
          </p>
        </div>
      </div>

      <div class="flex justify-end mt-6 space-x-3">
        <UButton @click="$emit('close')" variant="outline" color="gray">
          Close
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
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
  summarized?: boolean
  summary?: string
}

interface Props {
  isOpen: boolean
  artefact: Artefact | null
}

defineProps<Props>()

defineEmits<{
  'update:isOpen': [value: boolean]
  close: []
}>()

// Helper methods
const getStatusColor = (status: string | undefined) => {
  if (!status) return 'bg-gray-500/20 text-gray-400'
  
  const colors: Record<string, string> = {
    processed: 'bg-green-500/20 text-green-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

const getStatusDotColor = (status: string | undefined) => {
  if (!status) return 'bg-gray-400'
  
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
