<template>
  <div>
    <section class="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span class="text-primary-400">Smart Artefacts Management</span>
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover how Provento.ai transforms your artefacts workflow with cutting-edge AI
            technology and seamless integrations.
          </p>
        </div>

        <!-- Intelligent Artefacts Conversations -->
        <div class="mb-20">
          <h2 class="text-3xl font-bold text-white mb-12">Intelligent Artefacts Conversations</h2>
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p class="text-gray-300 text-lg mb-8">
                Transform static artefacts into interactive conversations. Ask questions in natural
                language and get instant, accurate answers from your artefacts library.
              </p>
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon name="heroicons:check" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-gray-300">Natural language processing for complex queries</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div
                    class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon name="heroicons:check" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-gray-300">Context-aware responses with source citations</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div
                    class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon name="heroicons:check" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-gray-300">Multi-artefacts knowledge synthesis</span>
                </div>
              </div>
            </div>
            <div class="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <div class="bg-dark-900 rounded-lg p-4 mb-4">
                <div class="flex items-center space-x-2 mb-3">
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div class="space-y-2">
                  <div class="text-gray-300 text-sm">
                    <span class="text-primary-400">User:</span> What are the key risks mentioned in
                    the Q3 financial report?
                  </div>
                  <div class="text-gray-300 text-sm">
                    <span class="text-green-400">Provento.ai:</span> Based on the Q3 financial
                    report, the key risks identified are: 1) Market volatility affecting revenue
                    projections...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seamless Artefacts Upload -->
        <div class="mb-20">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="bg-dark-800 rounded-xl p-8 border border-dark-700">
              <h3 class="text-xl font-bold text-white mb-6">Supported File Types</h3>
              <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                    <UIcon name="mdi:file-pdf-box" class="w-4 h-4 text-red-400" />
                  </div>
                  <span class="text-gray-300">PDF</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                    <UIcon name="mdi:text-box-outline" class="w-4 h-4 text-blue-400" />
                  </div>
                  <span class="text-gray-300">DOC</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                    <UIcon name="heroicons:table-cells" class="w-4 h-4 text-green-400" />
                  </div>
                  <span class="text-gray-300">CSV</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                    <UIcon name="heroicons:code-bracket" class="w-4 h-4 text-purple-400" />
                  </div>
                  <span class="text-gray-300">Markdown</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center">
                    <UIcon name="mdi:text-recognition" class="w-4 h-4 text-yellow-400" />
                  </div>
                  <span class="text-gray-300">TXT</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-pink-500/20 rounded flex items-center justify-center">
                    <UIcon name="heroicons:photo" class="w-4 h-4 text-pink-400" />
                  </div>
                  <span class="text-gray-300">Image</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center">
                    <UIcon name="heroicons:circle-stack" class="w-4 h-4 text-indigo-400" />
                  </div>
                  <span class="text-gray-300">Database</span>
                </div>
              </div>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-white mb-6">Seamless Artefacts Upload</h2>
              <p class="text-gray-300 text-lg mb-8">
                Upload artefacts from multiple sources with support for all major file formats. Our
                intelligent processing ensures your content is ready for conversations in seconds.
              </p>
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon name="heroicons:check" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-gray-300">Manual file upload with drag & drop</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div
                    class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon name="heroicons:check" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-gray-300">Google Drive integration</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div
                    class="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <UIcon name="heroicons:check" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-gray-300">Smart categorization and tagging</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Integrations -->
        <div class="mb-20">
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-dark-800 rounded-xl p-8 border border-dark-700 text-center">
              <div
                class="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-6"
              >
                <UIcon name="simple-icons:slack" class="w-8 h-8 text-primary-400" />
              </div>
              <h3 class="text-xl font-bold text-white mb-4">Slack Integration</h3>
              <p class="text-gray-300 mb-6">
                Get artefacts insights directly in your Slack channels. Ask questions and receive
                answers without leaving your workflow.
              </p>
            </div>
            <div class="bg-dark-800 rounded-xl p-8 border border-dark-700 text-center">
              <div
                class="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-6"
              >
                <UIcon name="simple-icons:microsoftteams" class="w-8 h-8 text-primary-400" />
              </div>
              <h3 class="text-xl font-bold text-white mb-4">Teams Integration</h3>
              <p class="text-gray-300 mb-6">
                Seamlessly connect with Microsoft Teams for collaborative artefacts analysis and
                real-time knowledge sharing.
              </p>
            </div>
            <div class="bg-dark-800 rounded-xl p-8 border border-dark-700 text-center">
              <div
                class="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-6"
              >
                <UIcon name="heroicons:device-phone-mobile" class="w-8 h-8 text-primary-400" />
              </div>
              <h3 class="text-xl font-bold text-white mb-4">Mobile Integration</h3>
              <p class="text-gray-300 mb-6">
                Access your artefacts on WhatsApp for on-the-go insights and quick artefacts
                queries.
              </p>
            </div>
          </div>
        </div>

        <!-- Advanced Analytics & Insights -->
        <div class="mb-20">
          <h2 class="text-3xl font-bold text-white text-center mb-6">
            Advanced Analytics & Insights
          </h2>
          <p class="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Track usage patterns, monitor performance, and gain insights into how your team
            interacts with artefacts.
          </p>
          <div class="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div class="text-center">
              <div
                class="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4"
              >
                <UIcon name="heroicons:chart-bar" class="w-8 h-8 text-primary-400" />
              </div>
              <h3 class="text-lg font-bold text-white mb-3">Usage Analytics</h3>
              <p class="text-gray-300 text-sm">
                Track user engagement and common interaction patterns.
              </p>
            </div>
            <div class="text-center">
              <div
                class="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4"
              >
                <UIcon name="heroicons:presentation-chart-line" class="w-8 h-8 text-primary-400" />
              </div>
              <h3 class="text-lg font-bold text-white mb-3">Trend Analysis</h3>
              <p class="text-gray-300 text-sm">Identify popular artefacts and query patterns.</p>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div
          class="text-center bg-gradient-to-r from-primary-900/20 to-primary-800/20 rounded-xl p-12"
        >
          <h2 class="text-3xl font-bold text-white mb-4">Ready to Experience These Features?</h2>
          <p class="text-xl text-gray-300 mb-8">
            Join thousands of teams already using Provento.ai to transform their artefacts
            workflows.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/book-meeting" class="btn-primary text-lg px-8 py-4">
              Book a Demo
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// The default layout will be used automatically

useHead({
  title: 'Features - Provento.ai',
})
</script>
