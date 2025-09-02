<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
          <UIcon name="simple-icons:slack" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">Slack Integration</h1>
          <p class="text-gray-400">Connect your Slack workspace to provento</p>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <!-- Status Badge -->
        <span
          v-if="connectionStatus.isConnected"
          class="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
        >
          <UIcon name="heroicons:check-circle" class="w-4 h-4" />
          <span>Connected</span>
        </span>
        <span
          v-else-if="connectionStatus.hasBeenConnected"
          class="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
        >
          <UIcon name="heroicons:exclamation-circle" class="w-4 h-4" />
          <span>Disconnected</span>
        </span>
        <span
          v-else
          class="bg-gray-500/20 text-gray-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
        >
          <UIcon name="heroicons:minus-circle" class="w-4 h-4" />
          <span>Not configured</span>
        </span>

        <!-- Action Button -->
        <UButton
          v-if="connectionStatus.isConnected"
          @click="showDisconnectModal = true"
          :loading="integrationsStore.loading"
          color="red"
          icon="heroicons:link-slash"
        >
          Disconnect
        </UButton>

        <UButton
          v-else-if="connectionStatus.hasBeenConnected"
          :to="slackOauthUrl"
          external
          color="purple"
          icon="heroicons:arrow-path"
        >
          Reconnect
        </UButton>

        <UButton v-else :to="slackOauthUrl" external color="purple" icon="heroicons:plus">
          Connect
        </UButton>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Workspace Configuration -->
      <UCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="heroicons:cog-6-tooth" class="w-5 h-5 text-gray-400" />
            <h2 class="text-lg font-semibold text-white">Workspace Configuration</h2>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Loading State -->
          <div v-if="integrationsStore.loading" class="space-y-4">
            <div class="animate-pulse">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
              <div class="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div class="animate-pulse">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
              <div class="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>

          <!-- Content -->
          <div v-else class="space-y-4">
            <!-- Workspace Name -->
            <UFormGroup label="Workspace Name">
              <UInput
                :model-value="workspaceConfig.name || 'Not configured'"
                readonly
                icon="heroicons:building-office"
              />
            </UFormGroup>

            <!-- Team ID -->
            <UFormGroup label="Team ID">
              <UInput
                :model-value="workspaceConfig.teamId || 'Not configured'"
                readonly
                icon="heroicons:identification"
              />
            </UFormGroup>
          </div>
        </div>
      </UCard>

      <!-- Connection Status -->
      <UCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="heroicons:signal" class="w-5 h-5 text-gray-400" />
            <h2 class="text-lg font-semibold text-white">Connection Status</h2>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Status -->
          <div
            class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <span class="text-gray-600 dark:text-gray-300">Status:</span>
            <span
              v-if="connectionStatus.isConnected"
              class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-medium flex items-center space-x-1"
            >
              <UIcon name="heroicons:check-circle" class="w-3 h-3" />
              <span>Connected</span>
            </span>
            <span
              v-else-if="connectionStatus.hasBeenConnected"
              class="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm font-medium flex items-center space-x-1"
            >
              <UIcon name="heroicons:exclamation-circle" class="w-3 h-3" />
              <span>Disconnected</span>
            </span>
            <span
              v-else
              class="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-sm font-medium flex items-center space-x-1"
            >
              <UIcon name="heroicons:minus-circle" class="w-3 h-3" />
              <span>Not configured</span>
            </span>
          </div>

          <!-- Team ID -->
          <div
            class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <span class="text-gray-600 dark:text-gray-300">Team ID:</span>
            <span class="text-gray-900 dark:text-white font-medium">
              {{ workspaceConfig.teamId || 'Not configured' }}
            </span>
          </div>

          <!-- Workspace Name -->
          <div
            class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <span class="text-gray-600 dark:text-gray-300">Workspace:</span>
            <span class="text-gray-900 dark:text-white font-medium">
              {{ workspaceConfig.name || 'Not configured' }}
            </span>
          </div>

          <!-- Integration Status -->
          <div class="flex items-center justify-between py-3">
            <span class="text-gray-600 dark:text-gray-300">Integration:</span>
            <span class="text-gray-900 dark:text-white font-medium">
              {{
                connectionStatus.isConnected
                  ? 'Active'
                  : connectionStatus.hasBeenConnected
                    ? 'Inactive'
                    : 'Not setup'
              }}
            </span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Additional Information Card -->
    <UCard v-if="connectionStatus.isConnected">
      <template #header>
        <div class="flex items-center space-x-2">
          <UIcon name="heroicons:information-circle" class="w-5 h-5 text-blue-400" />
          <h3 class="text-lg font-semibold text-white">Integration Details</h3>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center space-x-2 mb-2">
              <UIcon name="heroicons:users" class="w-4 h-4 text-purple-400" />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300"
                >Bot Capabilities</span
              >
            </div>
            <ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <li>• Read and write messages</li>
              <li>• Access user profiles</li>
              <li>• Join channels automatically</li>
              <li>• Process @mentions</li>
            </ul>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center space-x-2 mb-2">
              <UIcon name="heroicons:shield-check" class="w-4 h-4 text-green-400" />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Security</span>
            </div>
            <ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <li>• OAuth 2.0 authentication</li>
              <li>• Encrypted token storage</li>
              <li>• Secure API endpoints</li>
              <li>• GDPR compliant</li>
            </ul>
          </div>
        </div>

        <div
          class="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <UIcon name="heroicons:lightbulb" class="w-5 h-5 text-blue-500" />
          <div class="text-sm text-blue-700 dark:text-blue-300">
            <strong>Tip:</strong> You can test the integration by mentioning your bot in any Slack
            channel.
          </div>
        </div>
      </div>
    </UCard>

    <!-- Disconnect Confirmation Modal -->
    <UModal v-model="showDisconnectModal">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center space-x-3">
            <UIcon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-500" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Disconnect Slack Integration
            </h3>
          </div>
        </template>

        <div class="space-y-3">
          <p class="text-gray-600 dark:text-gray-300">
            Are you sure you want to disconnect your Slack workspace? This action will:
          </p>
          <ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1 ml-4">
            <li>• Stop all message processing</li>
            <li>• Disable bot notifications</li>
            <li>• Require re-authentication to reconnect</li>
            <li>• Revoke access tokens</li>
          </ul>
          <p class="text-sm text-red-600 dark:text-red-400 font-medium">
            This action cannot be undone.
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton
              @click="showDisconnectModal = false"
              :disabled="integrationsStore.loading"
              color="gray"
              variant="ghost"
            >
              Cancel
            </UButton>
            <UButton
              @click="disconnectSlack"
              :loading="integrationsStore.loading"
              color="red"
              icon="heroicons:link-slash"
            >
              Disconnect
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// Using admin layout
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const integrationsStore = useIntegrationsStore()

// Reactive data
const showDisconnectModal = ref(false)
const token = ref('')
const slackOauthUrl = ref('')

// Computed properties for workspace configuration
const workspaceConfig = computed(() => {
  const details = integrationsStore.slackAppDetails
  return {
    name: details?.team_name || null,
    teamId: details?.team_id || null,
  }
})

// Computed properties for connection status
const connectionStatus = computed(() => {
  const details = integrationsStore.slackAppDetails
  const isConnected = details?.status === 'active'
  const hasBeenConnected =
    details && details.team_id && details.team_name && details.status !== 'active'

  return {
    isConnected,
    hasBeenConnected: Boolean(hasBeenConnected),
    neverConnected: !details || (!details.team_id && !details.team_name),
  }
})

// Methods
const disconnectSlack = async () => {
  await integrationsStore.disconnectSlackApp()
  showDisconnectModal.value = false
}

// Lifecycle
onMounted(async () => {
  // Only runs on client
  token.value = localStorage.getItem('authToken') || ''

  if (token.value && config.public.slackClientId && config.public.slackRedirectUri) {
    const rawClientId = config.public?.slackClientId?.replace('-', '.')
    slackOauthUrl.value = `https://slack.com/oauth/v2/authorize?client_id=${rawClientId}&scope=app_mentions:read,chat:write,im:history,im:read,im:write,team:read,users.profile:read,users:read,users:read.email&user_scope=users.profile:read,users:read,users:read.email&redirect_uri=${config.public.slackRedirectUri}&state=${token.value}`
  }

  // Handle OAuth redirect
  const { code, state } = route.query
  if (code) {
    await integrationsStore.slackOauthRedirect(code as string, state as string)

    setTimeout(() => {
      router?.replace({ path: router.currentRoute.value.path, query: {} })
    }, 8000)
  }

  // Fetch current Slack details
  await integrationsStore.fetchSlackAppDetails()
})

useHead({
  title: 'Slack Integration - Admin Dashboard',
})
</script>
