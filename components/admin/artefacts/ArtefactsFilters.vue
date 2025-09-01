<template>
  <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
    <div class="flex flex-col lg:flex-row gap-4 items-end">
      <!-- Search Input -->
      <div class="flex-1">
        <UInput
          :model-value="searchQuery"
          @update:model-value="$emit('update:searchQuery', $event)"
          placeholder="Search artefacts..."
          size="lg"
          icon="i-heroicons-magnifying-glass"
        />
      </div>

      <!-- Category Filter -->
      <div class="lg:w-48">
        <USelect
          :model-value="selectedCategory"
          @update:model-value="$emit('update:selectedCategory', $event)"
          :options="[
            { label: categoriesLoading ? 'Loading categories...' : 'All Categories', value: '' },
            ...availableCategories.map(cat => ({ label: cat, value: cat }))
          ]"
          :loading="categoriesLoading"
          :disabled="categoriesLoading"
          size="lg"
        />
      </div>

      <!-- Type Filter -->
      <div class="lg:w-48">
        <USelect
          :model-value="selectedType"
          @update:model-value="$emit('update:selectedType', $event)"
          :options="[
            { label: 'All Types', value: '' },
            { label: 'PDF', value: 'PDF' },
            { label: 'Word', value: 'Word' },
            { label: 'Markdown', value: 'Markdown' },
            { label: 'TXT', value: 'TXT' },
            { label: 'CSV', value: 'CSV' },
            { label: 'Image', value: 'Image' },
            { label: 'Database', value: 'Database' }
          ]"
          size="lg"
        />
      </div>

      <!-- Status Filter -->
      <div class="lg:w-48">
        <USelect
          :model-value="selectedStatus"
          @update:model-value="$emit('update:selectedStatus', $event)"
          :options="[
            { label: 'All Status', value: '' },
            { label: 'Processed', value: 'processed' },
            { label: 'Processing', value: 'processing' },
            { label: 'Failed', value: 'failed' }
          ]"
          size="lg"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'
interface Props {
  searchQuery: string
  selectedCategory: string
  selectedType: string
  selectedStatus: string
  availableCategories: string[]
  categoriesLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  categoriesLoading: false
})

defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedCategory': [value: string]
  'update:selectedType': [value: string]
  'update:selectedStatus': [value: string]
}>()
</script>
