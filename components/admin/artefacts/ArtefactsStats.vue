<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Documents -->
    <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
      <div v-if="loading" class="animate-pulse">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-4 bg-gray-600 rounded w-24 mb-2"></div>
            <div class="h-8 bg-gray-600 rounded w-16"></div>
          </div>
          <div class="w-12 h-12 bg-gray-600 rounded-lg"></div>
        </div>
      </div>
      <div v-else class="flex items-center justify-between">
        <div>
          <p class="text-gray-400 text-sm font-medium">Total Artefacts</p>
          <p class="text-3xl font-bold text-white mt-2">{{ totalArtefacts }}</p>
        </div>
        <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <UIcon name="heroicons:document-text" class="w-6 h-6 text-blue-400" />
        </div>
      </div>
    </div>

    <!-- Processed -->
    <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
      <div v-if="loading" class="animate-pulse">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-4 bg-gray-600 rounded w-20 mb-2"></div>
            <div class="h-8 bg-gray-600 rounded w-16"></div>
          </div>
          <div class="w-12 h-12 bg-gray-600 rounded-lg"></div>
        </div>
      </div>
      <div v-else class="flex items-center justify-between">
        <div>
          <p class="text-gray-400 text-sm font-medium">Processed</p>
          <p class="text-3xl font-bold text-white mt-2">{{ processedArtefacts }}</p>
        </div>
        <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
          <UIcon name="heroicons:check-circle" class="w-6 h-6 text-green-400" />
        </div>
      </div>
    </div>

    <!-- Categories -->
    <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
      <div v-if="loading" class="animate-pulse">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-4 bg-gray-600 rounded w-20 mb-2"></div>
            <div class="h-8 bg-gray-600 rounded w-16"></div>
          </div>
          <div class="w-12 h-12 bg-gray-600 rounded-lg"></div>
        </div>
      </div>
      <div v-else class="flex items-center justify-between">
        <div>
          <p class="text-gray-400 text-sm font-medium">Categories</p>
          <p class="text-3xl font-bold text-white mt-2">{{ totalCategories }}</p>
        </div>
        <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <UIcon name="heroicons:funnel" class="w-6 h-6 text-purple-400" />
        </div>
      </div>
    </div>

    <!-- Total Size -->
    <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
      <div v-if="loading" class="animate-pulse">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-4 bg-gray-600 rounded w-20 mb-2"></div>
            <div class="h-8 bg-gray-600 rounded w-16"></div>
          </div>
          <div class="w-12 h-12 bg-gray-600 rounded-lg"></div>
        </div>
      </div>
      <div v-else class="flex items-center justify-between">
        <div>
          <p class="text-gray-400 text-sm font-medium">Total Size</p>
          <p class="text-3xl font-bold text-white mt-2">{{ totalSize }}</p>
        </div>
        <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
          <UIcon name="heroicons:circle-stack" class="w-6 h-6 text-orange-400" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  totalArtefacts: number
  processedArtefacts: number
  totalCategories: number
  totalSize: string
  loading?: boolean
}

defineProps<Props>()
</script>
