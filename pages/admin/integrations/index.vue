<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Integrations Overview</h1>
        <p class="text-gray-400">Configure and manage integrations with messaging platforms</p>
      </div>
      <button
        @click="refreshData"
        :disabled="integrationsStore.isLoading"
        class="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        <UIcon
          v-if="integrationsStore.isLoading"
          name="heroicons:arrow-path"
          class="w-4 h-4 mr-2 animate-spin"
        />
        <UIcon v-else name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
        Refresh
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Active Integrations -->
      <UCard class="bg-dark-800 border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Active Integrations</p>
            <p class="text-3xl font-bold text-white mt-2">
              {{
                integrationsStore.isLoading ? '...' : integrationsStore.getActiveIntegrationsCount
              }}
            </p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:check-circle" class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </UCard>

      <!-- Total Users -->
      <UCard class="bg-dark-800 border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Total Users</p>
            <p class="text-3xl font-bold text-white mt-2">
              {{
                integrationsStore.isLoading
                  ? '...'
                  : integrationsStore.getTotalUsers.toLocaleString()
              }}
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:user-group" class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </UCard>

      <!-- Messages Today -->
      <UCard class="bg-dark-800 border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Messages Today</p>
            <p class="text-3xl font-bold text-white mt-2">
              {{
                integrationsStore.isLoading
                  ? '...'
                  : integrationsStore.getTokenUsageToday.messages.toLocaleString()
              }}
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:chat-bubble-left-ellipsis" class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </UCard>

      <!-- Token Usage -->
      <UCard class="bg-dark-800 border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Token Usage Today</p>
            <p class="text-3xl font-bold text-white mt-2">
              {{
                integrationsStore.isLoading
                  ? '...'
                  : integrationsStore.formatTokenUsage(integrationsStore.getTokenUsageToday.tokens)
              }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{
                integrationsStore.isLoading
                  ? '...'
                  : integrationsStore.formatCost(integrationsStore.getTokenUsageToday.cost)
              }}
            </p>
          </div>
          <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:bolt" class="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Integration Status -->
      <UCard class="bg-dark-800 border-dark-700">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-white">Integration Status</h2>
              <p class="text-gray-400 text-sm">Current status of all platform integrations</p>
            </div>
          </div>
        </template>

        <!-- Loading state for integrations -->
        <div v-if="integrationsStore.isLoading" class="space-y-4">
          <div v-for="i in 4" :key="i" class="flex items-center space-x-3 animate-pulse">
            <div class="w-10 h-10 bg-gray-600 rounded-lg"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-600 rounded mb-2"></div>
              <div class="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
            <div class="h-6 w-20 bg-gray-600 rounded-full"></div>
            <div class="h-8 w-16 bg-gray-600 rounded"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="integrationsStore.getError" class="text-center py-8">
          <UIcon name="heroicons:exclamation-triangle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p class="text-red-400">{{ integrationsStore.getError }}</p>
          <button @click="refreshData" class="mt-2 text-red-400 hover:text-red-300 underline">
            Retry
          </button>
        </div>

        <!-- Integration list -->
        <div v-else class="space-y-4">
          <div
            v-for="integration in integrationsStore.getIntegrationsForUI"
            :key="integration.name"
            class="flex items-center justify-between p-4 bg-dark-900 rounded-lg border border-dark-700"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="integration.bgColor"
              >
                <UIcon :name="integration.icon" class="w-5 h-5" :class="integration.color" />
              </div>
              <div>
                <div class="text-white font-medium">{{ integration.name }}</div>
                <div class="text-gray-400 text-sm">
                  {{ integration.users.toLocaleString() }} users
                </div>
                <div
                  v-if="integration.details && getIntegrationDetailText(integration)"
                  class="text-gray-500 text-xs"
                >
                  {{ getIntegrationDetailText(integration) }}
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="
                  integration.connected
                    ? 'bg-green-500/20 text-green-400'
                    : integration.name === 'iMessage'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                "
              >
                {{
                  integration.connected
                    ? 'Connected'
                    : integration.name === 'iMessage'
                      ? 'Coming Soon'
                      : 'Disconnected'
                }}
              </span>

              <!-- Connected State Button -->
              <button
                v-if="integration.connected"
                @click="navigateToIntegration(integration.path)"
                class="flex items-center px-3 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                <UIcon name="heroicons:cog-6-tooth" class="w-3 h-3 mr-1" />
                Manage
              </button>

              <!-- Disconnected State Button -->
              <button
                v-else-if="integration.name !== 'iMessage'"
                @click="navigateToIntegration(integration.path)"
                class="flex items-center px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <UIcon name="heroicons:plus" class="w-3 h-3 mr-1" />
                Connect
              </button>

              <!-- Coming Soon State Button -->
              <button
                v-else
                disabled
                class="flex items-center px-3 py-1 text-xs font-medium bg-gray-600 cursor-not-allowed text-gray-300 rounded opacity-50"
              >
                <UIcon name="heroicons:clock" class="w-3 h-3 mr-1" />
                Soon
              </button>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Recent Activity -->
      <UCard class="bg-dark-800 border-dark-700">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-white">Recent Activity</h2>
              <p class="text-gray-400 text-sm">Latest integration events and sync status</p>
            </div>
          </div>
        </template>

        <!-- Loading state for activity -->
        <div v-if="integrationsStore.isLoading" class="space-y-4">
          <div v-for="i in 4" :key="i" class="flex items-start space-x-3 animate-pulse">
            <div class="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-600 rounded mb-2"></div>
              <div class="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Activity list -->
        <div v-else class="space-y-4">
          <div v-if="integrationsStore.getRecentActivity.length === 0" class="text-center py-8">
            <UIcon name="heroicons:clock" class="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p class="text-gray-400">No recent activity</p>
          </div>
          <div
            v-for="activity in integrationsStore.getRecentActivity"
            :key="activity.id"
            class="flex items-start space-x-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors"
          >
            <div
              class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              :class="getActivityColor(activity.type)"
            ></div>
            <div class="flex-1">
              <p class="text-white text-sm">{{ activity.message }}</p>
              <p class="text-gray-400 text-xs mt-1">{{ formatActivityTime(activity.timestamp) }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntegrationsStore } from '~/stores'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'

dayjs.extend(relativeTime)

// Using admin layout
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

// Store
const integrationsStore = useIntegrationsStore()

// Fetch data on mount
onMounted(async () => {
  await integrationsStore.fetchOverview()
  // Start auto-refresh every 5 minutes
  integrationsStore.startAutoRefresh()
})

// Methods
const navigateToIntegration = (path: string) => {
  if (path.includes('i-message')) return // Disabled for iMessage
  navigateTo(path)
}

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    success: 'bg-green-400',
    info: 'bg-blue-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
  }
  return colors[type] || 'bg-gray-400'
}

const formatActivityTime = (timestamp: Date) => {
  return dayjs(timestamp).fromNow()
}

const getIntegrationDetailText = (integration: any) => {
  if (!integration.details) return null

  switch (integration.name) {
    case 'Slack':
      return integration.details.teamName ? `Team: ${integration.details.teamName}` : null
    case 'WhatsApp':
      return integration.details.phoneNumber ? `Phone: ${integration.details.phoneNumber}` : null
    case 'Teams':
      return integration.details.serviceUrl ? 'Teams Bot Active' : null
    default:
      return null
  }
}

const refreshData = async () => {
  await integrationsStore.refreshOverview()
}

// Auto-refresh on focus
if (process.client) {
  window.addEventListener('focus', () => {
    if (integrationsStore.needsRefresh) {
      refreshData()
    }
  })
}

useHead({
  title: 'Integrations Overview - Admin Dashboard',
})
</script>
