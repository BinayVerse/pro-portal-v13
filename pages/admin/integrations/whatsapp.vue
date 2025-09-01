<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
            <div class="w-8 h-8 bg-green-500 rounded"></div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">WhatsApp Business Integration</h1>
            <p class="text-gray-400">Connect your WhatsApp Business account</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span
            class="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
          >
            <div class="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>Disconnected</span>
          </span>
          <button
            disabled
            class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 disabled:cursor-not-allowed"
          >
            <UIcon name="heroicons:link-slash" class="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      <!-- Setup Required State -->
      <div class="bg-dark-800 rounded-lg p-8 border border-dark-700 text-center">
        <div
          class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <div class="w-8 h-8 bg-green-500 rounded"></div>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">WhatsApp Setup Required</h3>
        <p class="text-gray-400 mb-6">
          To connect WhatsApp Business, you'll need to configure your Business API credentials and
          webhook settings.
        </p>

        <!-- Setup Instructions -->
        <div class="bg-dark-900 rounded-lg p-6 mb-6 text-left">
          <h4 class="text-lg font-medium text-white mb-4">Setup Instructions:</h4>
          <ol class="space-y-2 text-gray-300 text-sm">
            <li class="flex items-start">
              <span
                class="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0"
                >1</span
              >
              Create a WhatsApp Business API account
            </li>
            <li class="flex items-start">
              <span
                class="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0"
                >2</span
              >
              Get your Business Phone Number ID and Access Token
            </li>
            <li class="flex items-start">
              <span
                class="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0"
                >3</span
              >
              Configure webhook URL in your WhatsApp Business settings
            </li>
            <li class="flex items-start">
              <span
                class="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0"
                >4</span
              >
              Enter your credentials below to complete setup
            </li>
          </ol>
        </div>

        <button @click="showSetupForm = true" class="btn-primary">
          Configure WhatsApp Integration
        </button>
      </div>

      <!-- Configuration Requirements -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <h3 class="text-lg font-semibold text-white mb-4">Required Information</h3>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div class="bg-dark-900 rounded-lg p-4">
            <h4 class="text-white font-medium mb-2">WhatsApp Business API</h4>
            <ul class="text-gray-400 space-y-1">
              <li>• Business Phone Number ID</li>
              <li>• Access Token</li>
              <li>• App Secret</li>
            </ul>
          </div>
          <div class="bg-dark-900 rounded-lg p-4">
            <h4 class="text-white font-medium mb-2">Webhook Configuration</h4>
            <ul class="text-gray-400 space-y-1">
              <li>• Webhook URL</li>
              <li>• Verify Token</li>
              <li>• Event Subscriptions</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Setup Form Modal -->
      <div
        v-if="showSetupForm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click="showSetupForm = false"
      >
        <div
          class="bg-dark-900 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          @click.stop
        >
          <h3 class="text-xl font-bold text-white mb-6">WhatsApp Business Configuration</h3>

          <div class="space-y-6">
            <!-- API Credentials -->
            <div>
              <h4 class="text-lg font-medium text-white mb-4">API Credentials</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-300 text-sm mb-2">Business Phone Number ID</label>
                  <input
                    v-model="setupForm.phoneNumberId"
                    type="text"
                    class="input-field w-full"
                    placeholder="Enter your Phone Number ID"
                  />
                </div>

                <div>
                  <label class="block text-gray-300 text-sm mb-2">Access Token</label>
                  <input
                    v-model="setupForm.accessToken"
                    type="password"
                    class="input-field w-full"
                    placeholder="Enter your Access Token"
                  />
                </div>

                <div>
                  <label class="block text-gray-300 text-sm mb-2">App Secret</label>
                  <input
                    v-model="setupForm.appSecret"
                    type="password"
                    class="input-field w-full"
                    placeholder="Enter your App Secret"
                  />
                </div>
              </div>
            </div>

            <!-- Webhook Configuration -->
            <div>
              <h4 class="text-lg font-medium text-white mb-4">Webhook Configuration</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-300 text-sm mb-2">Webhook URL</label>
                  <input
                    value="https://your-domain.com/api/whatsapp/webhook"
                    readonly
                    class="input-field w-full bg-dark-700 text-gray-400"
                  />
                  <p class="text-gray-500 text-xs mt-1">
                    Copy this URL to your WhatsApp Business settings
                  </p>
                </div>

                <div>
                  <label class="block text-gray-300 text-sm mb-2">Verify Token</label>
                  <input
                    v-model="setupForm.verifyToken"
                    type="text"
                    class="input-field w-full"
                    placeholder="Create a verify token"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-8">
            <button @click="showSetupForm = false" class="btn-secondary">Cancel</button>
            <button @click="saveConfiguration" :disabled="!isFormValid" class="btn-primary">
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showDisconnectModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showDisconnectModal = false"
    >
      <div class="bg-dark-900 rounded-xl p-6 w-full max-w-md" @click.stop>
        <h3 class="text-xl font-bold text-white mb-4">Disconnect WhatsApp Integration</h3>

        <p class="text-gray-300 mb-6">
          Are you sure you want to disconnect your WhatsApp integration? This will stop all message
          processing and remove access to the provento bot.
        </p>

        <div class="flex justify-end space-x-3">
          <button @click="showDisconnectModal = false" class="btn-secondary">Cancel</button>
          <button @click="disconnectSlack" class="btn-destructive">Disconnect</button>
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
import { ref, computed } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()
const showDisconnectModal = ref(false)

const showSetupForm = ref(false)

const setupForm = ref({
  phoneNumberId: '',
  accessToken: '',
  appSecret: '',
  verifyToken: '',
})

const isFormValid = computed(() => {
  return (
    setupForm.value.phoneNumberId &&
    setupForm.value.accessToken &&
    setupForm.value.appSecret &&
    setupForm.value.verifyToken
  )
})

const saveConfiguration = () => {
  showNotification('Saving WhatsApp configuration...', 'info')

  // Simulate saving
  setTimeout(() => {
    showNotification('WhatsApp Business integration configured successfully!', 'success')
    showSetupForm.value = false
    // Reset form
    setupForm.value = {
      phoneNumberId: '',
      accessToken: '',
      appSecret: '',
      verifyToken: '',
    }
  }, 2000)
}

const disconnectWhatsApp = () => {
  console.log('Disconnecting WhatsApp integration...')
  showDisconnectModal.value = false
  // Implement disconnect logic
}
</script>
