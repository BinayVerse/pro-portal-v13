<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
            />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">Slack Integration</h1>
          <p class="text-gray-400">Connect your Slack workspace to DocChat</p>
        </div>
      </div>
      <div>
        <span
          class="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
        >
          <div class="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Connected</span>
        </span>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Workspace Configuration -->
      <div class="bg-dark-800 rounded-lg border border-dark-700 p-6">
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-white mb-2">Workspace Configuration</h2>
        </div>

        <div class="space-y-4">
          <!-- Workspace Name -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Workspace Name</label>
            <input
              v-model="workspaceConfig.name"
              type="text"
              class="w-full px-4 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              readonly
            />
          </div>

          <!-- Team ID -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Team ID</label>
            <input
              v-model="workspaceConfig.teamId"
              type="text"
              class="w-full px-4 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- Connection Status -->
      <div class="bg-dark-800 rounded-lg border border-dark-700 p-6">
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-white mb-2">Connection Status</h2>
        </div>

        <div class="space-y-4">
          <!-- Status -->
          <div class="flex items-center justify-between py-3 border-b border-dark-700">
            <span class="text-gray-300">Status:</span>
            <span
              class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-medium flex items-center space-x-1"
            >
              <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Connected</span>
            </span>
          </div>

          <!-- Users -->
          <div class="flex items-center justify-between py-3 border-b border-dark-700">
            <span class="text-gray-300">Users:</span>
            <span class="text-white font-medium">{{ connectionStatus.users }}</span>
          </div>

          <!-- Last Sync -->
          <div class="flex items-center justify-between py-3 border-b border-dark-700">
            <span class="text-gray-300">Last Sync:</span>
            <span class="text-white font-medium">{{ connectionStatus.lastSync }}</span>
          </div>

          <!-- Messages Today -->
          <div class="flex items-center justify-between py-3">
            <span class="text-gray-300">Messages Today:</span>
            <span class="text-white font-medium">{{ connectionStatus.messagesToday }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center space-x-4">
      <button
        @click="testConnection"
        class="bg-dark-800 hover:bg-dark-700 text-white px-6 py-3 rounded-lg border border-dark-700 transition-colors flex items-center space-x-2"
      >
        <UIcon name="heroicons:check-circle" class="w-4 h-4" />
        <span>Test Connection</span>
      </button>

      <button
        @click="openWorkspace"
        class="bg-dark-800 hover:bg-dark-700 text-white px-6 py-3 rounded-lg border border-dark-700 transition-colors flex items-center space-x-2"
      >
        <UIcon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
        <span>Open Workspace</span>
      </button>

      <button
        @click="showDisconnectModal = true"
        class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          ></path>
        </svg>
        <span>Disconnect</span>
      </button>
    </div>

    <!-- Advanced Configuration (Optional) -->
    <div class="bg-dark-800 rounded-lg border border-dark-700 p-6">
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-white mb-2">Advanced Configuration</h2>
        <p class="text-gray-400 text-sm">
          Configure additional settings for your Slack integration
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Channel Settings -->
        <div>
          <h3 class="text-white font-medium mb-3">Channel Settings</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-300 text-sm">Auto-join channels</span>
              <button
                @click="settings.autoJoinChannels = !settings.autoJoinChannels"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.autoJoinChannels ? 'bg-purple-500' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.autoJoinChannels ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-300 text-sm">Private message support</span>
              <button
                @click="settings.privateMessages = !settings.privateMessages"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.privateMessages ? 'bg-purple-500' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.privateMessages ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div>
          <h3 class="text-white font-medium mb-3">Notification Settings</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-300 text-sm">Connection alerts</span>
              <button
                @click="settings.connectionAlerts = !settings.connectionAlerts"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.connectionAlerts ? 'bg-purple-500' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.connectionAlerts ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-300 text-sm">Error notifications</span>
              <button
                @click="settings.errorNotifications = !settings.errorNotifications"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.errorNotifications ? 'bg-purple-500' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.errorNotifications ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 pt-6 border-t border-dark-700">
        <button
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>

    <!-- Disconnect Confirmation Modal -->
    <div
      v-if="showDisconnectModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-dark-800 rounded-lg border border-dark-700 p-6 w-full max-w-md mx-4">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-white mb-2">Disconnect Slack Integration</h3>
          <p class="text-gray-300 text-sm">
            Are you sure you want to disconnect your Slack workspace? This will stop all message
            processing and notifications.
          </p>
        </div>

        <div class="flex space-x-3">
          <button
            @click="disconnectSlack"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Disconnect
          </button>
          <button
            @click="showDisconnectModal = false"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Using admin layout
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

// Reactive data
const showDisconnectModal = ref(false)

const workspaceConfig = ref({
  name: 'DocChat Team',
  teamId: 'T123456890',
})

const connectionStatus = ref({
  status: 'Connected',
  users: 147,
  lastSync: '2 minutes ago',
  messagesToday: 647,
})

const settings = ref({
  autoJoinChannels: true,
  privateMessages: true,
  connectionAlerts: true,
  errorNotifications: true,
})

// Methods
const testConnection = () => {
  console.log('Testing Slack connection...')
  // Implement connection test logic
}

const openWorkspace = () => {
  window.open('https://app.slack.com', '_blank')
}

const disconnectSlack = () => {
  console.log('Disconnecting Slack integration...')
  showDisconnectModal.value = false
  // Implement disconnect logic
}

useHead({
  title: 'Slack Integration - Admin Dashboard',
})
</script>
