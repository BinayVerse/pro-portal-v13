<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header with Date Range -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-white">Analytics & Reports</h1>
          <p class="text-gray-400">Comprehensive usage reports</p>
        </div>
        <div class="flex items-center gap-4">
          <select v-model="dateRange" class="input-field">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            @click="exportReport"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <UIcon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <!-- Top Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Queries -->
        <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm font-medium">Total Queries</p>
              <p class="text-3xl font-bold text-white mt-2">
                {{ loading ? '...' : metrics.totalQueries.toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <UIcon name="heroicons:chart-bar" class="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <!-- Active Users -->
        <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm font-medium">Active Users</p>
              <p class="text-3xl font-bold text-white mt-2">
                {{ loading ? '...' : metrics.activeUsers }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <UIcon name="heroicons:users" class="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <!-- Documents Created -->
        <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm font-medium">Documents Created</p>
              <p class="text-3xl font-bold text-white mt-2">
                {{ loading ? '...' : metrics.documentsCreated.toLocaleString() }}
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <UIcon name="heroicons:document-text" class="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <!-- Token Usage -->
        <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm font-medium">Token Usage</p>
              <p class="text-3xl font-bold text-white mt-2">
                {{ loading ? '...' : formatTokens(metrics.tokenUsage) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <UIcon name="heroicons:bolt" class="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- User-wise Token Usage by Channel -->
        <div class="bg-dark-800 rounded-lg border border-dark-700">
          <div class="p-6 border-b border-dark-700">
            <h2 class="text-lg font-semibold text-white">User-wise Token Usage by Channel</h2>
            <p class="text-gray-400 text-sm">Token consumption across different channels</p>
          </div>
          <div class="p-6">
            <div class="h-64 bg-dark-900 rounded-lg flex items-center justify-center relative">
              <!-- Mock Chart -->
              <div class="w-full h-full relative">
                <div
                  class="absolute bottom-0 left-8 w-8 bg-blue-500 rounded-t"
                  style="height: 60%"
                ></div>
                <div
                  class="absolute bottom-0 left-20 w-8 bg-green-500 rounded-t"
                  style="height: 80%"
                ></div>
                <div
                  class="absolute bottom-0 left-32 w-8 bg-purple-500 rounded-t"
                  style="height: 45%"
                ></div>
                <div
                  class="absolute bottom-0 left-44 w-8 bg-yellow-500 rounded-t"
                  style="height: 70%"
                ></div>
                <div
                  class="absolute bottom-0 left-56 w-8 bg-red-500 rounded-t"
                  style="height: 35%"
                ></div>
                <div
                  class="absolute bottom-0 left-68 w-8 bg-indigo-500 rounded-t"
                  style="height: 55%"
                ></div>
                <div
                  class="absolute bottom-0 left-80 w-8 bg-pink-500 rounded-t"
                  style="height: 40%"
                ></div>

                <!-- Legend -->
                <div class="absolute bottom-2 right-2 bg-dark-700 rounded p-3">
                  <div class="flex flex-col gap-1 text-xs">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 bg-blue-500 rounded"></div>
                      <span class="text-gray-300">Slack</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 bg-green-500 rounded"></div>
                      <span class="text-gray-300">WhatsApp</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 bg-purple-500 rounded"></div>
                      <span class="text-gray-300">Web Interface</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- App-wise Token Usage -->
        <div class="bg-dark-800 rounded-lg border border-dark-700">
          <div class="p-6 border-b border-dark-700">
            <h2 class="text-lg font-semibold text-white">App-wise Token Usage</h2>
            <p class="text-gray-400 text-sm">Token distribution across different applications</p>
          </div>
          <div class="p-6">
            <div class="h-64 bg-dark-900 rounded-lg flex items-center justify-center relative">
              <!-- Mock Pie Chart -->
              <div class="w-32 h-32 rounded-full relative overflow-hidden">
                <div
                  class="absolute inset-0 bg-blue-500"
                  style="clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)"
                ></div>
                <div
                  class="absolute inset-0 bg-green-500"
                  style="clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)"
                ></div>
                <div
                  class="absolute inset-0 bg-purple-500"
                  style="clip-path: polygon(50% 50%, 50% 100%, 0% 100%, 0% 75%)"
                ></div>
                <div
                  class="absolute inset-0 bg-yellow-500"
                  style="clip-path: polygon(50% 50%, 0% 75%, 0% 25%, 25% 0%)"
                ></div>
                <div
                  class="absolute inset-0 bg-red-500"
                  style="clip-path: polygon(50% 50%, 25% 0%, 50% 0%)"
                ></div>
              </div>

              <!-- Legend -->
              <div class="absolute right-4 top-4 bg-dark-700 rounded p-3">
                <div class="flex flex-col gap-1 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-blue-500 rounded"></div>
                    <span class="text-gray-300">34.5%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-green-500 rounded"></div>
                    <span class="text-gray-300">28.7%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-purple-500 rounded"></div>
                    <span class="text-gray-300">18.3%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span class="text-gray-300">12.1%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-red-500 rounded"></div>
                    <span class="text-gray-300">6.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily User-wise Token Usage -->
      <div class="bg-dark-800 rounded-lg border border-dark-700">
        <div class="p-6 border-b border-dark-700">
          <h2 class="text-lg font-semibold text-white">Daily-wise User-wise Token Usage</h2>
          <p class="text-gray-400 text-sm">Daily token consumption patterns by application</p>
        </div>
        <div class="p-6">
          <div
            class="h-80 bg-dark-900 rounded-lg flex items-end justify-center relative overflow-hidden"
          >
            <!-- Mock Stacked Area Chart -->
            <svg class="w-full h-full" viewBox="0 0 400 300">
              <!-- Gradient definitions -->
              <defs>
                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: #3b82f6; stop-opacity: 0.8" />
                  <stop offset="100%" style="stop-color: #3b82f6; stop-opacity: 0.1" />
                </linearGradient>
                <linearGradient id="green-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: #10b981; stop-opacity: 0.8" />
                  <stop offset="100%" style="stop-color: #10b981; stop-opacity: 0.1" />
                </linearGradient>
                <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: #8b5cf6; stop-opacity: 0.8" />
                  <stop offset="100%" style="stop-color: #8b5cf6; stop-opacity: 0.1" />
                </linearGradient>
                <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: #f59e0b; stop-opacity: 0.8" />
                  <stop offset="100%" style="stop-color: #f59e0b; stop-opacity: 0.1" />
                </linearGradient>
              </defs>

              <!-- Area paths -->
              <path
                d="M20 280 L60 250 L100 240 L140 220 L180 210 L220 200 L260 190 L300 180 L340 170 L380 160 L380 280 Z"
                fill="url(#blue-gradient)"
              />
              <path
                d="M20 250 L60 220 L100 210 L140 190 L180 180 L220 170 L260 160 L300 150 L340 140 L380 130 L380 160 L340 170 L300 180 L260 190 L220 200 L180 210 L140 220 L100 240 L60 250 Z"
                fill="url(#green-gradient)"
              />
              <path
                d="M20 220 L60 190 L100 180 L140 160 L180 150 L220 140 L260 130 L300 120 L340 110 L380 100 L380 130 L340 140 L300 150 L260 160 L220 170 L180 180 L140 190 L100 210 L60 220 Z"
                fill="url(#purple-gradient)"
              />
              <path
                d="M20 190 L60 160 L100 150 L140 130 L180 120 L220 110 L260 100 L300 90 L340 80 L380 70 L380 100 L340 110 L300 120 L260 130 L220 140 L180 150 L140 160 L100 180 L60 190 Z"
                fill="url(#orange-gradient)"
              />
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-dark-700 rounded p-3">
              <div class="flex gap-4 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-blue-500 rounded"></div>
                  <span class="text-gray-300">Slack</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-green-500 rounded"></div>
                  <span class="text-gray-300">Teams</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-purple-500 rounded"></div>
                  <span class="text-gray-300">WhatsApp</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-orange-500 rounded"></div>
                  <span class="text-gray-300">Web Interface</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Grid -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Category-wise Document Distribution -->
        <div class="bg-dark-800 rounded-lg border border-dark-700">
          <div class="p-6 border-b border-dark-700">
            <h2 class="text-lg font-semibold text-white">Category-wise Document Distribution</h2>
            <p class="text-gray-400 text-sm">Document usage distribution by category</p>
          </div>
          <div class="p-6">
            <div class="h-64 bg-dark-900 rounded-lg flex items-center justify-center relative">
              <!-- Mock Donut Chart -->
              <div class="w-32 h-32 relative">
                <div
                  class="w-full h-full rounded-full border-[20px] border-transparent relative overflow-hidden"
                  style="
                    background: conic-gradient(
                      #3b82f6 0deg 130deg,
                      #10b981 130deg 200deg,
                      #8b5cf6 200deg 260deg,
                      #f59e0b 260deg 310deg,
                      #ef4444 310deg 350deg,
                      #6366f1 350deg 360deg
                    );
                  "
                >
                  <div class="absolute inset-[20px] bg-dark-900 rounded-full"></div>
                </div>
              </div>

              <!-- Legend -->
              <div class="absolute left-4 top-4 bg-dark-700 rounded p-3">
                <div class="flex flex-col gap-1 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-blue-500 rounded"></div>
                    <span class="text-gray-300">HR</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-green-500 rounded"></div>
                    <span class="text-gray-300">Finance</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-purple-500 rounded"></div>
                    <span class="text-gray-300">Legal</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-orange-500 rounded"></div>
                    <span class="text-gray-300">Technical</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-red-500 rounded"></div>
                    <span class="text-gray-300">Marketing</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-indigo-500 rounded"></div>
                    <span class="text-gray-300">Other</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 5 Queried Documents -->
        <div class="bg-dark-800 rounded-lg border border-dark-700">
          <div class="p-6 border-b border-dark-700">
            <h2 class="text-lg font-semibold text-white">Top 5 Queried Documents</h2>
            <p class="text-gray-400 text-sm">Most frequently accessed documents</p>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="(doc, index) in topDocuments"
                :key="doc.id"
                class="flex items-center justify-between p-3 bg-dark-900 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center"
                  >
                    <span class="text-primary-400 font-medium text-sm">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <p class="text-white font-medium text-sm">{{ doc.name }}</p>
                    <p class="text-gray-400 text-xs">{{ doc.queries }} queries</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white font-medium">{{ doc.usage }}</p>
                  <p class="text-gray-400 text-xs">usage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Frequently Asked Questions -->
      <div class="bg-dark-800 rounded-lg border border-dark-700">
        <div class="p-6 border-b border-dark-700">
          <h2 class="text-lg font-semibold text-white">Frequently Asked Questions</h2>
          <p class="text-gray-400 text-sm">Most common questions and query patterns</p>
        </div>
        <div class="p-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div
                v-for="faq in frequentQuestions.slice(0, 4)"
                :key="faq.id"
                class="p-4 bg-dark-900 rounded-lg"
              >
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-white font-medium text-sm pr-4">{{ faq.question }}</h3>
                  <div class="text-right flex-shrink-0">
                    <div class="text-xl font-bold text-white">{{ faq.count }}</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span
                    :class="getCategoryClass(faq.category)"
                    class="px-2 py-1 text-xs rounded font-medium"
                  >
                    {{ faq.category }}
                  </span>
                  <div class="text-xs text-gray-400">times</div>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div
                v-for="faq in frequentQuestions.slice(4, 8)"
                :key="faq.id"
                class="p-4 bg-dark-900 rounded-lg"
              >
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-white font-medium text-sm pr-4">{{ faq.question }}</h3>
                  <div class="text-right flex-shrink-0">
                    <div class="text-xl font-bold text-white">{{ faq.count }}</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span
                    :class="getCategoryClass(faq.category)"
                    class="px-2 py-1 text-xs rounded font-medium"
                  >
                    {{ faq.category }}
                  </span>
                  <div class="text-xs text-gray-400">times</div>
                </div>
              </div>
            </div>
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
import { ref, onMounted } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

const loading = ref(true)
const dateRange = ref('30')

const metrics = ref({
  totalQueries: 45230,
  activeUsers: 234,
  documentsCreated: 1847,
  tokenUsage: 1230000,
})

const topDocuments = ref([
  { id: 1, name: 'Employee Handbook 2024.pdf', queries: 1568, usage: '142k' },
  { id: 2, name: 'API Documentation v2.3.pdf', queries: 1234, usage: '98k' },
  { id: 3, name: 'Q4 Financial Report.docx', queries: 987, usage: '87k' },
  { id: 4, name: 'Privacy Policy.pdf', queries: 756, usage: '65k' },
  { id: 5, name: 'Product Specifications.md', queries: 634, usage: '54k' },
])

const frequentQuestions = ref([
  { id: 1, question: 'What is the vacation policy?', count: 420, category: 'HR' },
  { id: 2, question: 'What is the remote work policy?', count: 260, category: 'HR' },
  { id: 3, question: 'How to reset my password?', count: 380, category: 'Technical' },
  { id: 4, question: 'How to access VPN?', count: 240, category: 'Technical' },
  { id: 5, question: 'What are the health benefits?', count: 350, category: 'HR' },
  { id: 6, question: 'What are the training programs?', count: 220, category: 'HR' },
  { id: 7, question: 'How to submit expense reports?', count: 290, category: 'Financial' },
  { id: 8, question: 'How to book meeting rooms?', count: 180, category: 'General' },
])

const formatTokens = (tokens: number) => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`
  }
  return tokens.toString()
}

const getCategoryClass = (category: string) => {
  const classes: Record<string, string> = {
    HR: 'bg-blue-500/20 text-blue-400',
    Technical: 'bg-green-500/20 text-green-400',
    Financial: 'bg-orange-500/20 text-orange-400',
    General: 'bg-gray-500/20 text-gray-400',
  }
  return classes[category] || 'bg-gray-500/20 text-gray-400'
}

const exportReport = () => {
  showNotification('Report export functionality will be implemented', 'info')
}

onMounted(async () => {
  try {
    loading.value = true
    // Simulate loading data
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } catch (error) {
    showNotification('Failed to load analytics data', 'error')
  } finally {
    loading.value = false
  }
})
</script>
