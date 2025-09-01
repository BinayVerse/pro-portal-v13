<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-white mb-2">Integrations Overview</h1>
      <p class="text-gray-400">Configure and manage integrations with messaging platforms</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Active Integrations -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Active Integrations</p>
            <p class="text-3xl font-bold text-white mt-2">{{ activeIntegrations }}</p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:check-circle" class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      <!-- Total Users -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Total Users</p>
            <p class="text-3xl font-bold text-white mt-2">{{ totalUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:user-group" class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      <!-- Messages Today -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Messages Today</p>
            <p class="text-3xl font-bold text-white mt-2">{{ messagesToday.toLocaleString() }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:chat-bubble-left-ellipsis" class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      <!-- Token Usage -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Token Usage</p>
            <p class="text-3xl font-bold text-white mt-2">{{ tokenUsage }}</p>
            <p class="text-orange-400 text-xs mt-1">{{ tokenPercentage }}% of monthly limit</p>
          </div>
          <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:bolt" class="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Integration Status -->
      <div class="bg-dark-800 rounded-lg border border-dark-700 p-6">
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-white">Integration Status</h2>
          <p class="text-gray-400 text-sm">Current status of all platform integrations</p>
        </div>

        <div class="space-y-4">
          <div
            v-for="integration in integrations"
            :key="integration.name"
            class="flex items-center justify-between p-4 bg-dark-900 rounded-lg border border-dark-700"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center">
                <component :is="integration.icon" class="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <div class="text-white font-medium">{{ integration.name }}</div>
                <div class="text-gray-400 text-sm">{{ integration.users }} users</div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="
                  integration.connected
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                "
              >
                {{ integration.connected ? 'Connected' : 'Disconnected' }}
              </span>
              <button
                class="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-dark-800 rounded-lg border border-dark-700 p-6">
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-white">Recent Activity</h2>
          <p class="text-gray-400 text-sm">Latest integration events and sync status</p>
        </div>

        <div class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start space-x-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors"
          >
            <div
              class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              :class="getActivityColor(activity.type)"
            ></div>
            <div class="flex-1">
              <p class="text-white text-sm">{{ activity.message }}</p>
              <p class="text-gray-400 text-xs mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils'

// Using admin layout
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

// Import icon components
import { h } from 'vue'

// Sample data
const activeIntegrations = ref(2)
const totalUsers = ref(236)
const messagesToday = ref(1247)
const tokenUsage = ref('847K')
const tokenPercentage = ref(99)

// Icon components
const SlackIcon = () => h('div', { class: 'w-5 h-5 bg-purple-500 rounded' })
const TeamsIcon = () => h('div', { class: 'w-5 h-5 bg-blue-500 rounded' })
const WhatsAppIcon = () => h('div', { class: 'w-5 h-5 bg-green-500 rounded' })
const MessageIcon = () => h('div', { class: 'w-5 h-5 bg-gray-500 rounded' })

const integrations = ref([
  {
    name: 'Slack',
    users: 147,
    connected: true,
    icon: SlackIcon,
  },
  {
    name: 'Teams',
    users: 93,
    connected: true,
    icon: TeamsIcon,
  },
  {
    name: 'WhatsApp',
    users: 0,
    connected: false,
    icon: WhatsAppIcon,
  },
  {
    name: 'iMessage',
    users: 0,
    connected: false,
    icon: MessageIcon,
  },
])

const recentActivity = ref([
  {
    id: 1,
    type: 'success',
    message: 'Slack integration synced',
    time: formatDateTime(new Date(Date.now() - 2 * 60 * 1000)), // 2 minutes ago
  },
  {
    id: 2,
    type: 'success',
    message: 'Teams integration synced',
    time: formatDateTime(new Date(Date.now() - 5 * 60 * 1000)), // 5 minutes ago
  },
  {
    id: 3,
    type: 'info',
    message: 'New user joined Slack workspace',
    time: formatDateTime(new Date(Date.now() - 60 * 60 * 1000)), // 1 hour ago
  },
  {
    id: 4,
    type: 'warning',
    message: 'WhatsApp setup required',
    time: formatDateTime(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1 day ago
  },
])

// Methods
const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    success: 'bg-green-400',
    info: 'bg-blue-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
  }
  return colors[type] || 'bg-gray-400'
}

useHead({
  title: 'Integrations Overview - Admin Dashboard',
})
</script>
