<template>
  <footer class="bg-dark-950 border-t border-dark-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="col-span-1">
          <NuxtLink to="/" class="flex items-center space-x-3 mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fb2a7382a9c9146babd538ccc60e9d0b5%2Fbddd43caf4614f99a3fbff498927abcc?format=webp&width=800"
              alt="Provento Logo"
              class="w-8 h-8"
            />
            <span class="text-white text-xl font-semibold">provento.ai</span>
          </NuxtLink>
          <p class="text-gray-400 text-sm mb-4">
            Transform your artefacts into intelligent conversations with AI-powered artefact
            chatting platform.
          </p>
        </div>

        <!-- Product -->
        <div>
          <h3 class="text-white font-semibold mb-4">Product</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/features" class="text-gray-400 hover:text-white transition-colors"
                >Features</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/solutions" class="text-gray-400 hover:text-white transition-colors"
                >Solutions</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/pricing" class="text-gray-400 hover:text-white transition-colors"
                >Pricing</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/book-meeting" class="text-gray-400 hover:text-white transition-colors"
                >Book a Demo</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- Industries -->
        <div>
          <h3 class="text-white font-semibold mb-4">Industries</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                to="/solutions/education"
                class="text-gray-400 hover:text-white transition-colors"
                >Education</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/solutions/finance-banking"
                class="text-gray-400 hover:text-white transition-colors"
                >Finance & Banking</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/solutions/government"
                class="text-gray-400 hover:text-white transition-colors"
                >Government</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/solutions/healthcare"
                class="text-gray-400 hover:text-white transition-colors"
                >Healthcare</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/solutions/insurance"
                class="text-gray-400 hover:text-white transition-colors"
                >Insurance</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/solutions/legal"
                class="text-gray-400 hover:text-white transition-colors"
                >Legal</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/solutions/manufacturing"
                class="text-gray-400 hover:text-white transition-colors"
                >Manufacturing</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/solutions/real-estate"
                class="text-gray-400 hover:text-white transition-colors"
                >Real Estate</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-white font-semibold mb-4">Support</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/faq" class="text-gray-400 hover:text-white transition-colors"
                >FAQ</NuxtLink
              >
            </li>
            <li>
              <a
                href="mailto:contact@provento.ai"
                class="text-gray-400 hover:text-white transition-colors"
                >Contact Support</a
              >
            </li>
            <li>
              <NuxtLink to="/book-meeting" class="text-gray-400 hover:text-white transition-colors"
                >Book a Demo</NuxtLink
              >
            </li>
            <li>
              <a
                href="mailto:hello@provento.ai"
                class="text-gray-400 hover:text-white transition-colors"
                >General Inquiries</a
              >
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="border-t border-dark-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
      >
        <div class="text-gray-400 text-sm">
          © {{ currentYear }} Provento.ai. All rights reserved.
        </div>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <NuxtLink
            to="/privacy-policy"
            class="text-gray-400 hover:text-white transition-colors text-sm"
            >Privacy Policy</NuxtLink
          >
          <NuxtLink
            to="/terms-of-service"
            class="text-gray-400 hover:text-white transition-colors text-sm"
            >Terms of Service</NuxtLink
          >
          <NuxtLink
            to="/cookie-policy"
            class="text-gray-400 hover:text-white transition-colors text-sm"
            >Cookie Policy</NuxtLink
          >
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear())
</script>
