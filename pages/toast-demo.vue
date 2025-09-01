<template>
  <div class="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
    <div class="max-w-2xl w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-white mb-4">Toast Notifications Demo</h1>
        <p class="text-gray-400 mb-8">Test different types of notifications</p>
      </div>

      <div class="card space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <button @click="showSuccess" class="btn-primary">
            Success Toast
          </button>
          <button @click="showError" class="btn-destructive">
            Error Toast
          </button>
          <button @click="showWarning" class="btn-secondary">
            Warning Toast
          </button>
          <button @click="showInfo" class="btn-outline">
            Info Toast
          </button>
        </div>

        <div class="border-t border-dark-700 pt-6">
          <h3 class="text-lg font-semibold text-white mb-4">Advanced Notifications</h3>
          <div class="space-y-3">
            <button @click="showWithTitle" class="btn-primary w-full">
              Notification with Title
            </button>
            <button @click="showWithAction" class="btn-secondary w-full">
              Notification with Action
            </button>
            <button @click="showLongDuration" class="btn-outline w-full">
              Long Duration (10s)
            </button>
          </div>
        </div>

        <div class="border-t border-dark-700 pt-6 text-center">
          <NuxtLink to="/login" class="btn-outline">
            Back to Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { showNotification } = useNotification()

const showSuccess = () => {
  showNotification('Operation completed successfully!', 'success')
}

const showError = () => {
  showNotification('Something went wrong. Please try again.', 'error')
}

const showWarning = () => {
  showNotification('Warning: Please review your settings.', 'warning')
}

const showInfo = () => {
  showNotification('This is an informational message.', 'info')
}

const showWithTitle = () => {
  showNotification('Your profile has been updated with the latest changes.', 'success', {
    title: 'Profile Updated'
  })
}

const showWithAction = () => {
  showNotification('File upload completed. Click to view details.', 'success', {
    title: 'Upload Complete',
    action: {
      label: 'View File',
      handler: () => {
        showNotification('Action button clicked!', 'info')
      }
    }
  })
}

const showLongDuration = () => {
  showNotification('This notification will stay visible for 10 seconds.', 'info', {
    duration: 10000
  })
}
</script>
