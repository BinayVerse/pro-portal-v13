<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>
      <p class="text-gray-400">Manage your artefact chatting platform from here.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Users -->
      <UCard class="bg-dark-800 border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Total Users</p>
            <p class="text-3xl font-bold text-white mt-2">
              {{ loading ? '...' : stats.totalUsers.toLocaleString() }}
            </p>
            <p class="text-sm mt-2">
              <span class="text-green-400">+{{ stats.userGrowth }}% from last month</span>
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:users" class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </UCard>

      <!-- Documents -->
      <UCard class="bg-dark-800 border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Artefacts</p>
            <p class="text-3xl font-bold text-white mt-2">
              {{ loading ? '...' : stats.totalArtefacts.toLocaleString() }}
            </p>
            <p class="text-sm mt-2">
              <span class="text-green-400">+{{ stats.artefactsToday }} today</span>
            </p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:document-text" class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </UCard>

      <!-- Conversations -->
      <UCard class="bg-dark-800 border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Conversations</p>
            <p class="text-3xl font-bold text-white mt-2">
              {{ loading ? '...' : stats.totalConversations.toLocaleString() }}
            </p>
            <p class="text-sm mt-2">
              <span class="text-green-400">+{{ stats.conversationGrowth }}% from last month</span>
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </UCard>

      <!-- Tokens Used -->
      <UCard class="bg-dark-800 border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Tokens Used</p>
            <p class="text-3xl font-bold text-white mt-2">
              {{ loading ? '...' : formatTokens(stats.tokensUsed) }}
            </p>
            <p class="text-sm mt-2">
              <span class="text-green-400">+{{ stats.tokenGrowth }}% from last month</span>
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
      <!-- Recent Users -->
      <div class="bg-dark-800 rounded-lg border border-dark-700">
        <div class="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 class="text-lg font-semibold text-white">Recent Users</h2>
          <div class="text-sm text-gray-400">Latest user registrations and activity</div>
          <button
            @click="navigateTo('/admin/users')"
            class="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
          >
            <UIcon name="heroicons:plus" class="w-4 h-4" />
            Add User
          </button>
        </div>
        <div class="p-6">
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 4" :key="i" class="flex items-center space-x-3 animate-pulse">
              <div class="w-10 h-10 bg-gray-600 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-600 rounded mb-2"></div>
                <div class="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
              <div class="h-6 w-16 bg-gray-600 rounded-full"></div>
            </div>
          </div>
          <UTable
            v-else
            :rows="sortedUsers"
            :columns="userColumns"
            :sort="userSort"
            @update:sort="userSort = $event"
          >
            <template #initials-data="{ row }">
              <div class="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                <span class="text-primary-400 font-medium text-xs">{{ row.initials }}</span>
              </div>
            </template>
            <template #status-data="{ row }">
              <UBadge :color="getStatusColor(row.status)" variant="soft" size="xs">
                {{ row.status }}
              </UBadge>
            </template>
          </UTable>
        </div>
      </div>

      <!-- Recent Documents -->
      <div class="bg-dark-800 rounded-lg border border-dark-700">
        <div class="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 class="text-lg font-semibold text-white">Recent Artefacts</h2>
          <div class="text-sm text-gray-400">Latest artefact uploads and processing status</div>
          <button
            @click="navigateTo('/admin/artefacts')"
            class="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
          >
            <UIcon name="heroicons:cloud-arrow-up" class="w-4 h-4" />
            Upload
          </button>
        </div>
        <div class="p-6">
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 4" :key="i" class="flex items-center space-x-3 animate-pulse">
              <div class="w-10 h-10 bg-gray-600 rounded"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-600 rounded mb-2"></div>
                <div class="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
              <div class="h-6 w-20 bg-gray-600 rounded"></div>
            </div>
          </div>
          <UTable
            v-else
            :rows="sortedArtefacts"
            :columns="artefactColumns"
            :sort="artefactSort"
            @update:sort="artefactSort = $event"
          >
            <template #icon-data>
              <div class="w-8 h-8 bg-primary-500/20 rounded flex items-center justify-center">
                <UIcon name="heroicons:document-text" class="w-4 h-4 text-primary-400" />
              </div>
            </template>
            <template #fileInfo-data="{ row }">
              <div>
                <p class="text-white font-medium text-sm">{{ row.title }}</p>
                <p class="text-gray-400 text-xs">
                  {{ row.fileName }} • {{ formatFileSize(row.fileSize) }}
                </p>
              </div>
            </template>
            <template #status-data="{ row }">
              <UBadge :color="getArtefactStatusColor(row.status)" variant="soft" size="xs">
                {{ row.status }}
              </UBadge>
            </template>
            <template #createdAt-data="{ row }">
              <span class="text-gray-400 text-xs">{{ formatTime(row.createdAt) }}</span>
            </template>
          </UTable>
        </div>
      </div>
    </div>

    <!-- Platform Integrations -->
    <div class="bg-dark-800 rounded-lg border border-dark-700">
      <div class="flex items-center justify-between p-6 border-b border-dark-700">
        <h2 class="text-lg font-semibold text-white">Platform Integrations</h2>
        <div class="text-sm text-gray-400">Manage connections to external platforms</div>
      </div>
      <div class="p-6">
        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="integration in integrations"
            :key="integration.id"
            class="flex items-center justify-between p-4 bg-dark-900 rounded-lg border border-dark-700"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <UIcon
                  :name="getIntegrationIcon(integration.name)"
                  class="w-6 h-6"
                  :class="getIntegrationIconColor(integration.name)"
                />
              </div>
              <div>
                <p class="text-white font-medium">{{ integration.name }}</p>
                <p class="text-gray-400 text-sm">{{ integration.description }}</p>
              </div>
            </div>
            <UButton
              @click="toggleIntegration(integration)"
              :color="integration.isConnected ? 'green' : 'blue'"
              size="xs"
              :icon="integration.isConnected ? 'heroicons:check' : 'heroicons:link'"
            >
              {{ integration.isConnected ? 'Connected' : 'Connect' }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const loading = ref(true)

// Table sorting
const userSort = ref({ column: 'name', direction: 'asc' })
const artefactSort = ref({ column: 'createdAt', direction: 'desc' })

// Table columns
const userColumns = [
  { key: 'initials', label: '', sortable: false },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

const artefactColumns = [
  { key: 'icon', label: '', sortable: false },
  { key: 'fileInfo', label: 'Artefact', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
]

const stats = ref({
  totalUsers: 2847,
  userGrowth: 12,
  totalArtefacts: 18432,
  artefactsToday: 48,
  totalConversations: 45231,
  conversationGrowth: 24,
  tokensUsed: 1200000,
  tokenGrowth: 18,
})

const recentUsers = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    initials: 'SJ',
    status: 'Active',
    role: 'Admin',
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike@company.com',
    initials: 'MC',
    status: 'Active',
    role: 'User',
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily@company.com',
    initials: 'ED',
    status: 'Inactive',
    role: 'Manager',
  },
  {
    id: 4,
    name: 'Alex Rodriguez',
    email: 'alex@company.com',
    initials: 'AR',
    status: 'Active',
    role: 'User',
  },
])

const recentArtefacts = ref([
  {
    id: 1,
    title: 'Employee Handbook 2024',
    fileName: 'employee-handbook.pdf',
    fileSize: 2457600,
    status: 'processed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    title: 'Q4 Financial Report',
    fileName: 'q4-report.docx',
    fileSize: 1843200,
    status: 'processing',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 3,
    title: 'Product Specifications',
    fileName: 'product-specs.pdf',
    fileSize: 3276800,
    status: 'processed',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 4,
    title: 'Marketing Guidelines',
    fileName: 'marketing-guide.pdf',
    fileSize: 1638400,
    status: 'processed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
])

const integrations = ref([
  {
    id: 1,
    name: 'Slack',
    description: 'Team communication',
    isConnected: true,
    logo: null,
  },
  {
    id: 2,
    name: 'Microsoft Teams',
    description: 'Video conferencing',
    isConnected: true,
    logo: null,
  },
  {
    id: 3,
    name: 'WhatsApp Business',
    description: 'Customer messaging',
    isConnected: false,
    logo: null,
  },
])

const formatTokens = (tokens: number) => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const formatTime = (date: Date) => {
  return formatDateTime(date)
}

// Computed properties for sorted data
const sortedUsers = computed(() => {
  const users = [...recentUsers.value]
  if (userSort.value.column) {
    users.sort((a, b) => {
      const aVal = a[userSort.value.column]
      const bVal = b[userSort.value.column]
      const direction = userSort.value.direction === 'asc' ? 1 : -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * direction
      }
      return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * direction
    })
  }
  return users
})

const sortedArtefacts = computed(() => {
  const docs = [...recentArtefacts.value]
  if (artefactSort.value.column) {
    docs.sort((a, b) => {
      let aVal = a[artefactSort.value.column]
      let bVal = b[artefactSort.value.column]
      const direction = artefactSort.value.direction === 'asc' ? 1 : -1

      // Handle date sorting
      if (artefactSort.value.column === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * direction
      }
      return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * direction
    })
  }
  return docs
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Active: 'green',
    Inactive: 'red',
    Pending: 'yellow',
  }
  return colors[status] || 'gray'
}

const getArtefactStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    processed: 'green',
    processing: 'yellow',
    failed: 'red',
  }
  return colors[status] || 'gray'
}

const getIntegrationIcon = (name: string) => {
  const iconMap: Record<string, string> = {
    Slack: 'mdi:slack',
    'Microsoft Teams': 'mdi:microsoft-teams',
    'WhatsApp Business': 'mdi:whatsapp',
  }
  return iconMap[name] || 'mdi:link'
}

const getIntegrationIconColor = (name: string) => {
  const colorMap: Record<string, string> = {
    Slack: 'text-purple-400',
    'Microsoft Teams': 'text-blue-400',
    'WhatsApp Business': 'text-green-400',
  }
  return colorMap[name] || 'text-gray-400'
}

const toggleIntegration = async (integration: any) => {
  try {
    integration.isConnected = !integration.isConnected
    // In a real app, you would call an API here
  } catch (error) {
    console.error('Failed to update integration:', error)
  }
}

onMounted(async () => {
  // Simulate loading
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>
