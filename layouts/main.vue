<template>
  <div class="min-h-screen bg-black">
    <!-- Header Navigation -->
    <header class="bg-black border-b border-dark-700 sticky top-0 z-50">
      <nav class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and brand -->
          <NuxtLink to="/" class="flex items-center space-x-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fb2a7382a9c9146babd538ccc60e9d0b5%2Fbddd43caf4614f99a3fbff498927abcc?format=webp&width=800"
              alt="Provento Logo"
              class="w-8 h-8"
            />
            <span class="text-white text-xl font-semibold">provento.ai</span>
          </NuxtLink>

          <!-- Main Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink
              to="/"
              class="text-gray-300 hover:text-white transition-colors duration-200"
              :class="{ 'text-primary-400': $route.name === 'index' }"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/features"
              class="text-gray-300 hover:text-white transition-colors duration-200"
              :class="{ 'text-primary-400': $route.name === 'features' }"
            >
              Features
            </NuxtLink>

            <!-- Solutions with dropdown -->
            <div
              class="relative"
              @mouseenter="handleSolutionsEnter"
              @mouseleave="handleSolutionsLeave"
            >
              <button
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                :class="{ 'text-primary-400': $route.path.includes('/solutions') }"
              >
                Solutions
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="ml-1 w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': showSolutions }"
                />
              </button>

              <!-- Solutions dropdown -->
              <div
                v-show="showSolutions"
                class="absolute top-full left-0 mt-2 w-64 bg-dark-900 border border-dark-700 rounded-lg shadow-xl py-2 animate-fade-in z-50"
                @mouseenter="handleSolutionsEnter"
                @mouseleave="handleSolutionsLeave"
              >
                <div class="px-4 py-2 text-sm text-gray-400 font-medium border-b border-dark-700">
                  By Industries
                </div>
                <NuxtLink
                  v-for="industry in industries"
                  :key="industry.slug"
                  :to="`/solutions/${industry.slug}`"
                  class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-800 transition-colors duration-200"
                >
                  {{ industry.name }}
                </NuxtLink>
              </div>
            </div>

            <NuxtLink
              to="/pricing"
              class="text-gray-300 hover:text-white transition-colors duration-200"
              :class="{ 'text-primary-400': $route.name === 'pricing' }"
            >
              Pricing
            </NuxtLink>
            <NuxtLink
              to="/faq"
              class="text-gray-300 hover:text-white transition-colors duration-200"
              :class="{ 'text-primary-400': $route.name === 'faq' }"
            >
              FAQ
            </NuxtLink>
          </div>

          <!-- Right side buttons -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/book-meeting" class="btn-outline hidden sm:inline-flex">
              Book a Demo
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </NuxtLink>
            <NuxtLink to="/signup" class="btn-primary"> Sign Up </NuxtLink>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden text-gray-300 hover:text-white p-2"
          >
            <UIcon name="i-heroicons-bars-3" class="w-6 h-6" />
          </button>
        </div>

        <!-- Mobile menu -->
        <div
          v-show="mobileMenuOpen"
          class="md:hidden py-4 border-t border-dark-700 animate-fade-in"
        >
          <div class="space-y-2">
            <NuxtLink to="/" class="block text-gray-300 hover:text-white py-2">Home</NuxtLink>
            <NuxtLink to="/features" class="block text-gray-300 hover:text-white py-2"
              >Features</NuxtLink
            >
            <NuxtLink to="/solutions" class="block text-gray-300 hover:text-white py-2"
              >Solutions</NuxtLink
            >
            <NuxtLink to="/pricing" class="block text-gray-300 hover:text-white py-2"
              >Pricing</NuxtLink
            >
            <NuxtLink to="/faq" class="block text-gray-300 hover:text-white py-2">FAQ</NuxtLink>
            <NuxtLink to="/book-meeting" class="block text-gray-300 hover:text-white py-2"
              >Book a Demo</NuxtLink
            >
            <NuxtLink to="/login" class="block text-gray-300 hover:text-white py-2">Login</NuxtLink>
            <NuxtLink to="/signup" class="btn-primary block text-center mt-3">Sign Up</NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <FooterComponent />
  </div>
</template>

<script setup lang="ts">
const showSolutions = ref(false)
const mobileMenuOpen = ref(false)

let hoverTimeout: NodeJS.Timeout | null = null

const handleSolutionsLeave = () => {
  hoverTimeout = setTimeout(() => {
    showSolutions.value = false
  }, 300)
}

const handleSolutionsEnter = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  showSolutions.value = true
}

const industries = [
  { name: 'Education', slug: 'education' },
  { name: 'Finance & Banking', slug: 'finance-banking' },
  { name: 'Government', slug: 'government' },
  { name: 'Healthcare', slug: 'healthcare' },
  { name: 'Insurance', slug: 'insurance' },
  { name: 'Legal', slug: 'legal' },
  { name: 'Manufacturing', slug: 'manufacturing' },
  { name: 'Real Estate', slug: 'real-estate' },
]
</script>
