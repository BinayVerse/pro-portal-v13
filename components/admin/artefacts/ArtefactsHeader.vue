<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-white mb-2">Artefact Management</h1>
      <p class="text-gray-400">
        Upload, organize, and manage artefacts for AI processing and chat capabilities.
      </p>
    </div>
    <div>
      <button
        @click="$emit('upload')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
      >
        <UIcon name="heroicons:cloud-arrow-up" class="w-4 h-4" />
        <span>Upload Artefact</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define emits
defineEmits<{
  upload: []
}>()
</script>
