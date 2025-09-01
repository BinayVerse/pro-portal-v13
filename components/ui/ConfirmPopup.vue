<template>
  <UModal
    :model-value="isOpen"
    @update:model-value="(value) => !value && handleClose()"
    :prevent-close="loading"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <UIcon
            :name="iconName"
            :class="iconColorClass"
            class="w-6 h-6 mr-3"
          />
          <h3 class="text-lg font-semibold text-white">
            {{ title }}
          </h3>
        </div>
        <UButton
          @click="handleClose"
          variant="ghost"
          icon="heroicons:x-mark"
          color="gray"
          size="sm"
          :disabled="loading"
          class="hover:bg-dark-700"
        />
      </div>

      <!-- Message -->
      <div class="mb-6">
        <p class="text-gray-300 text-sm leading-relaxed">
          {{ message }}
        </p>
        <div v-if="details" class="mt-2 p-3 bg-dark-700 rounded-lg border border-dark-600">
          <p class="text-gray-400 text-xs">
            {{ details }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3">
        <UButton
          @click="handleCancel"
          variant="outline"
          color="gray"
          :disabled="loading"
          size="sm"
        >
          {{ cancelText }}
        </UButton>
        <UButton
          @click="handleConfirm"
          :color="confirmButtonColor"
          :loading="loading"
          size="sm"
        >
          {{ confirmText }}
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
  message: string
  details?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  loading?: boolean
}

interface Emits {
  (event: 'update:isOpen', value: boolean): void
  (event: 'confirm'): void
  (event: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'danger',
  loading: false,
})

const emit = defineEmits<Emits>()

// Computed properties for styling based on type
const iconName = computed(() => {
  const icons = {
    danger: 'heroicons:exclamation-triangle',
    warning: 'heroicons:exclamation-triangle',
    info: 'heroicons:information-circle',
    success: 'heroicons:check-circle',
  }
  return icons[props.type]
})

const iconColorClass = computed(() => {
  const colors = {
    danger: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
    success: 'text-green-400',
  }
  return colors[props.type]
})

const confirmButtonColor = computed(() => {
  const colors = {
    danger: 'red',
    warning: 'amber',
    info: 'blue',
    success: 'green',
  }
  return colors[props.type]
})

// Event handlers
const handleConfirm = (event?: Event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  if (!props.loading) {
    emit('confirm')
  }
}

const handleClose = (event?: Event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  if (!props.loading) {
    emit('update:isOpen', false)
    emit('cancel')
  }
}

const handleCancel = (event?: Event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  if (!props.loading) {
    emit('update:isOpen', false)
    emit('cancel')
  }
}
</script>
