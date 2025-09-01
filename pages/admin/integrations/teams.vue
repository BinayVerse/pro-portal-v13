<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
            <div class="w-8 h-8 bg-blue-500 rounded"></div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">Microsoft Teams Integration</h1>
            <p class="text-gray-400">Connect your Teams workspace to provento</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span
            class="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
          >
            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Connected</span>
          </span>
          <button
            @click="showDisconnectModal = true"
            class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <UIcon name="heroicons:link-slash" class="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      <!-- Configuration Form -->
      <div v-if="config.isConnected" class="grid md:grid-cols-2 gap-6">
        <!-- Teams Configuration -->
        <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h2 class="text-lg font-semibold text-white mb-6">Teams Configuration</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-gray-300 text-sm mb-2">Tenant ID</label>
              <input
                v-model="config.tenantId"
                type="text"
                readonly
                class="input-field w-full bg-dark-700 text-gray-300"
              />
            </div>

            <div>
              <label class="block text-gray-300 text-sm mb-2">Application ID</label>
              <input
                v-model="config.applicationId"
                type="text"
                readonly
                class="input-field w-full bg-dark-700 text-gray-300"
              />
            </div>

            <div>
              <label class="block text-gray-300 text-sm mb-2">Client Secret</label>
              <div class="relative">
                <input
                  :type="showClientSecret ? 'text' : 'password'"
                  v-model="config.clientSecret"
                  readonly
                  class="input-field w-full bg-dark-700 text-gray-300 pr-10"
                />
                <button
                  @click="showClientSecret = !showClientSecret"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      v-if="showClientSecret"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    ></path>
                    <path
                      v-else
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h2 class="text-lg font-semibold text-white mb-6">Connection Status</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
              <span class="text-gray-300">Status:</span>
              <span class="text-green-400 font-medium flex items-center gap-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                Connected
              </span>
            </div>

            <div class="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
              <span class="text-gray-300">Users:</span>
              <span class="text-white font-medium">{{ config.users }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
              <span class="text-gray-300">Last Sync:</span>
              <span class="text-white font-medium">{{ config.lastSync }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
              <span class="text-gray-300">Messages Today:</span>
              <span class="text-white font-medium">{{ config.messagesToday }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Disconnected State -->
      <div v-else class="bg-dark-800 rounded-lg p-8 border border-dark-700 text-center">
        <div
          class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <div class="w-8 h-8 bg-blue-500 rounded"></div>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">Teams Not Connected</h3>
        <p class="text-gray-400 mb-6">
          Connect your Microsoft Teams workspace to start using provento integration
        </p>
        <button @click="connectTeams" class="btn-primary">Connect Microsoft Teams</button>
      </div>

      <!-- Action Buttons -->
      <div v-if="config.isConnected" class="flex gap-4">
        <button @click="testConnection" class="btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Test Connection
        </button>

        <button @click="openTeams" class="btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            ></path>
          </svg>
          Open Teams
        </button>

        <button @click="showDisconnectModal = true" class="btn-destructive">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
          Disconnect
        </button>
      </div>

      <!-- Disconnect Confirmation Modal -->
      <div
        v-if="showDisconnectModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click="showDisconnectModal = false"
      >
        <div class="bg-dark-900 rounded-xl p-6 w-full max-w-md" @click.stop>
          <h3 class="text-xl font-bold text-white mb-4">Disconnect Teams Integration</h3>

          <p class="text-gray-300 mb-6">
            Are you sure you want to disconnect your Microsoft Teams workspace? This will stop all
            message processing and remove access to the provento bot.
          </p>

          <div class="flex justify-end space-x-3">
            <button @click="showDisconnectModal = false" class="btn-secondary">Cancel</button>
            <button @click="disconnectTeams" class="btn-destructive">Disconnect</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})
import { ref } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

const showDisconnectModal = ref(false)
const showClientSecret = ref(false)

const config = ref({
  isConnected: true,
  tenantId: 'a10c3de4-e578-7690-a0ef-ef234567890',
  applicationId: 'b2c5d6e4-f8a1-4cdc-a234-567890123',
  clientSecret: '***************',
  users: 89,
  lastSync: '5 minutes ago',
  messagesToday: 400,
})

const testConnection = () => {
  showNotification('Testing Teams connection...', 'info')

  // Simulate test
  setTimeout(() => {
    showNotification('Teams connection test successful!', 'success')
  }, 1500)
}

const openTeams = () => {
  showNotification('Opening Microsoft Teams...', 'info')
  // In real implementation, this would open Teams
}

const connectTeams = () => {
  showNotification('Redirecting to Microsoft Teams authorization...', 'info')

  // Simulate connection process
  setTimeout(() => {
    config.value.isConnected = true
    showNotification('Microsoft Teams connected successfully!', 'success')
  }, 2000)
}

const disconnectTeams = () => {
  config.value.isConnected = false
  showDisconnectModal.value = false
  showNotification('Microsoft Teams disconnected', 'success')
}
</script>
