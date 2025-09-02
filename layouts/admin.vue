<template>
  <div class="min-h-screen bg-black flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
      <!-- Logo -->
      <div class="px-6 py-4 border-b border-dark-700">
        <NuxtLink to="/" class="flex items-center space-x-3">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fb2a7382a9c9146babd538ccc60e9d0b5%2Fbddd43caf4614f99a3fbff498927abcc?format=webp&width=800"
            alt="Provento Logo"
            class="w-8 h-8"
          />
          <span class="text-white text-xl font-semibold">provento.ai</span>
        </NuxtLink>
      </div>

      <!-- Admin Navigation -->
      <nav class="flex-1 p-6">
        <div class="space-y-2">
          <UButton
            to="/admin/dashboard"
            variant="ghost"
            justify="start"
            icon="heroicons:squares-2x2"
            :color="$route.name === 'admin-dashboard' ? 'primary' : 'gray'"
            class="w-full"
          >
            Dashboard
          </UButton>

          <UButton
            to="/admin/users"
            variant="ghost"
            justify="start"
            icon="heroicons:users"
            :color="$route.name === 'admin-users' ? 'primary' : 'gray'"
            class="w-full"
          >
            Users
          </UButton>

          <UButton
            to="/admin/artefacts"
            variant="ghost"
            justify="start"
            icon="heroicons:document-text"
            :color="$route.name === 'admin-artefacts' ? 'primary' : 'gray'"
            class="w-full"
          >
            Artefacts
          </UButton>

          <UButton
            to="/admin/analytics"
            variant="ghost"
            justify="start"
            icon="heroicons:chart-bar"
            :color="$route.name === 'admin-analytics' ? 'primary' : 'gray'"
            class="w-full"
          >
            Analytics
          </UButton>

          <!-- Integrations with submenu -->
          <div>
            <button
              @click="integrationsOpen = !integrationsOpen"
              class="w-full flex items-center justify-between space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-800 transition-colors duration-200"
              :class="{
                'bg-primary-500/20 text-primary-400': $route.path.includes('/admin/integrations'),
              }"
            >
              <div class="flex items-center space-x-3">
                <UIcon name="heroicons:link" class="w-5 h-5" />
                <span>Integrations</span>
              </div>
              <UIcon
                name="heroicons:chevron-down"
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': integrationsOpen }"
              />
            </button>
            <div v-show="integrationsOpen" class="ml-8 mt-2 space-y-1">
              <UButton
                to="/admin/integrations"
                variant="ghost"
                justify="start"
                size="sm"
                icon="heroicons:eye"
                :color="$route.name === 'admin-integrations' ? 'primary' : 'gray'"
                class="w-full"
              >
                Overview
              </UButton>
              <UButton
                to="/admin/integrations/slack"
                variant="ghost"
                justify="start"
                size="sm"
                icon="i-mdi:slack"
                :color="$route.name === 'admin-integrations-slack' ? 'primary' : 'gray'"
                class="w-full"
              >
                Slack
              </UButton>
              <UButton
                to="/admin/integrations/teams"
                variant="ghost"
                justify="start"
                size="sm"
                icon="i-mdi:microsoft-teams"
                :color="$route.name === 'admin-integrations-teams' ? 'primary' : 'gray'"
                class="w-full"
              >
                Teams
              </UButton>
              <UButton
                to="/admin/integrations/whatsapp"
                variant="ghost"
                justify="start"
                size="sm"
                icon="i-mdi:whatsapp"
                :color="$route.name === 'admin-integrations-whatsapp' ? 'primary' : 'gray'"
                class="w-full"
              >
                WhatsApp
              </UButton>
              <UButton
                to="/admin/integrations/i-message"
                variant="ghost"
                justify="start"
                size="sm"
                icon="i-heroicons:chat-bubble-left-ellipsis"
                :color="$route.name === 'admin-integrations-i-message' ? 'primary' : 'gray'"
                class="w-full"
              >
                iMessage
              </UButton>
            </div>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col">
      <!-- Top header -->
      <header class="bg-dark-900 border-b border-dark-700 px-6 py-2.5">
        <div class="flex items-center justify-end">
          <!-- <h1 class="text-xl font-semibold text-white">{{ pageTitle }}</h1> -->

          <!-- Profile dropdown -->
          <UDropdown :items="profileItems" :popper="{ placement: 'bottom-end' }">
            <UButton variant="ghost" trailing-icon="heroicons:chevron-down">
              <UAvatar src="" alt="Admin" size="sm" :ui="{ background: 'bg-primary-500' }">
                <span class="text-white text-sm font-medium">A</span>
              </UAvatar>
              <span class="hidden sm:block ml-2">Admin</span>
            </UButton>
          </UDropdown>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6 bg-black">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const integrationsOpen = ref(true)

const profileItems = [
  [
    {
      label: 'My Account',
      icon: 'heroicons:user',
      click: () => {},
    },
    {
      label: 'Change Password',
      icon: 'heroicons:key',
      click: () => {},
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'heroicons:arrow-right-on-rectangle',
      click: () => navigateTo('/login'),
    },
  ],
]

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'admin-dashboard': 'Dashboard',
    'admin-users': 'Users',
    'admin-artefacts': 'Artefacts',
    'admin-analytics': 'Analytics',
    'admin-integrations': 'Integrations Overview',
    'admin-integrations-teams': 'Teams Integration',
    'admin-integrations-slack': 'Slack Integration',
    'admin-integrations-whatsapp': 'WhatsApp Integration',
    'admin-integrations-i-message': 'iMessage Integration',
  }
  return titles[route.name as string] || 'Admin'
})
</script>
