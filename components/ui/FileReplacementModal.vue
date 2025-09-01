<template>
  <UModal :model-value="isOpen" @update:model-value="$emit('update:isOpen', $event)">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          File Already Exists
        </h3>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1"
          @click="cancel"
        />
      </div>

      <div class="mb-6">
        <div class="flex items-start space-x-3 mb-4">
          <UIcon 
            name="i-heroicons-exclamation-triangle" 
            class="w-6 h-6 text-amber-500 mt-0.5" 
          />
          <div>
            <p class="text-gray-900 dark:text-gray-100 mb-2">
              A file named <strong>"{{ fileName }}"</strong> already exists in the <strong>{{ category }}</strong> category.
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Would you like to replace the existing file with the new one? This action cannot be undone.
            </p>
          </div>
        </div>

        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div class="flex items-start space-x-2">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div class="text-sm text-amber-800 dark:text-amber-200">
              <p class="font-medium mb-1">What happens when you replace:</p>
              <ul class="space-y-1 text-xs">
                <li>• The existing file will be permanently overwritten</li>
                <li>• Any summaries or processing data will be reset</li>
                <li>• The file will be reprocessed with the new content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <UButton
          @click="cancel"
          variant="outline"
          color="gray"
          size="md"
        >
          Cancel Upload
        </UButton>
        <UButton
          @click="replace"
          color="primary"
          size="md"
          icon="i-heroicons-arrow-up-tray"
        >
          Replace File
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  fileName: string
  category: string
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'replace'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const replace = () => {
  emit('replace')
  emit('update:isOpen', false)
}

const cancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}
</script>
