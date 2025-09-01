<template>
  <div>
    <section class="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6">
            Frequently Asked
            <span class="text-primary-400">Questions</span>
          </h1>
          <p class="text-xl text-gray-300">Everything you need to know about Provento.ai</p>
        </div>

        <!-- Search Bar -->
        <div class="mb-8">
          <div class="relative max-w-2xl mx-auto">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UIcon name="heroicons:magnifying-glass" class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search frequently asked questions..."
              class="block w-full pl-10 pr-3 py-3 border border-dark-700 rounded-lg bg-dark-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button @click="clearSearch" class="text-gray-400 hover:text-white transition-colors">
                <UIcon name="heroicons:x-mark" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- FAQ Categories -->
        <div class="flex flex-wrap justify-center gap-4 mb-12">
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              selectedCategory === category
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            "
          >
            {{ category }}
            <span v-if="getCategoryCount(category) > 0" class="ml-2 text-xs opacity-75">
              ({{ getCategoryCount(category) }})
            </span>
          </button>
        </div>

        <!-- Search Results Info -->
        <div v-if="searchQuery" class="mb-6 text-center">
          <p class="text-gray-300">
            <span v-if="filteredFaqs.length === 0">No results found for </span>
            <span v-else
              >{{ filteredFaqs.length }} result{{ filteredFaqs.length === 1 ? '' : 's' }} for
            </span>
            <span class="text-primary-400 font-medium">"{{ searchQuery }}"</span>
          </p>
        </div>

        <!-- FAQ Items -->
        <div v-if="filteredFaqs.length > 0" class="space-y-6">
          <div
            v-for="faq in filteredFaqs"
            :key="faq.id"
            class="card cursor-pointer"
            @click="toggleFaq(faq.id)"
          >
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-semibold text-white pr-4">
                <span v-html="highlightSearchTerm(faq.question)"></span>
              </h3>
              <UIcon
                name="heroicons:chevron-down"
                class="w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0"
                :class="openFaqs.includes(faq.id) ? 'rotate-180' : ''"
              />
            </div>
            <div v-show="openFaqs.includes(faq.id)" class="mt-4 text-gray-300 animate-fade-in">
              <span v-html="highlightSearchTerm(faq.answer)"></span>
            </div>
          </div>
        </div>

        <!-- No Results Message -->
        <div v-else-if="searchQuery || selectedCategory !== 'All'" class="text-center py-12">
          <div
            class="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UIcon name="heroicons:document-magnifying-glass" class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">No FAQs found</h3>
          <p class="text-gray-300 mb-6">
            <span v-if="searchQuery">
              Try adjusting your search terms or
              <button
                @click="clearSearch"
                class="text-primary-400 hover:text-primary-300 underline"
              >
                clear the search
              </button>
            </span>
            <span v-else> No questions available for this category. </span>
          </p>
          <button
            v-if="selectedCategory !== 'All'"
            @click="selectedCategory = 'All'"
            class="btn-outline"
          >
            View All Categories
          </button>
        </div>

        <!-- Contact CTA -->
        <div class="mt-16 text-center card">
          <h2 class="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p class="text-gray-300 mb-6">
            Our team is here to help. Get in touch and we'll respond within 24 hours.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/book-meeting" class="btn-primary"> Book a Demo </NuxtLink>
            <a href="mailto:support@provento.ai" class="btn-outline"> Contact Support </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Using default layout

const selectedCategory = ref('All')
const openFaqs = ref<number[]>([])
const searchQuery = ref('')

const categories = [
  'All',
  'General',
  'Onboarding',
  'Administration',
  'Integrations',
  'Pricing',
  'Features',
  'Security',
  'Technical',
]

const faqs = [
  {
    id: 1,
    category: 'General',
    question: 'What is Provento.ai?',
    answer:
      'Provento.ai is an intelligent document chatting platform that transforms your static documents into interactive conversations. Upload your documents and ask questions in natural language to get instant, accurate answers.',
  },
  {
    id: 2,
    category: 'General',
    question: 'How does Provento.ai work?',
    answer:
      'Our platform uses advanced AI and natural language processing to understand your documents and queries. When you upload documents, we process and index them for intelligent search. You can then ask questions in plain English and get accurate answers with source citations.',
  },
  {
    id: 3,
    category: 'General',
    question: 'How many users can I add to my account?',
    answer:
      'User limits vary by plan: Starter (1 user), Professional (5 users), Business (25 users), and Enterprise (unlimited users). You can add users through the admin dashboard and assign different roles and permissions.',
  },
  {
    id: 4,
    category: 'General',
    question: 'Can individuals use Provento.ai?',
    answer:
      'No, Provento.ai is built specifically for organizations to streamline internal communication and document access.',
  },
  {
    id: 5,
    category: 'Onboarding',
    question: 'How can an organization start using Provento.ai?',
    answer:
      'Organizations can sign up via our website, choose a plan, and complete a quick onboarding process involving document upload and bot channel integration.',
  },
  {
    id: 6,
    category: 'Onboarding',
    question: 'Does the organization need to appoint an admin?',
    answer:
      'Yes, each organization needs at least one admin to manage users, documents, and settings.',
  },
  {
    id: 7,
    category: 'Onboarding',
    question: 'Is providing a WhatsApp number mandatory?',
    answer:
      'Providing a WhatsApp number is not mandatory. WhatsApp integration is optional. You can choose to integrate with Slack, Teams, WhatsApp, or a combination of these depending on your organization’s needs.',
  },
  {
    id: 8,
    category: 'Onboarding',
    question: 'Is the onboarding process time-consuming?',
    answer:
      'No, onboarding typically takes less than 30 minutes, including setting up channels and uploading initial documents.',
  },
  {
    id: 9,
    category: 'Onboarding',
    question: 'Can we add users immediately after onboarding?',
    answer:
      "Yes, once your organization is set up, you can invite users right away via the user's dashboard.",
  },
  {
    id: 10,
    category: 'Administration',
    question: 'Who can upload documents to Provento.ai?',
    answer:
      'Only organization admins can upload documents to ensure content accuracy and consistency.',
  },
  {
    id: 11,
    category: 'Administration',
    question: 'Can an organization have multiple admins?',
    answer:
      "Yes, you can assign multiple admins to manage different aspects of your organization's workspace.",
  },
  {
    id: 12,
    category: 'Administration',
    question: 'Can the admin role be changed?',
    answer: "Yes, existing admins can assign or remove admin privileges via the user's dashboard.",
  },
  {
    id: 13,
    category: 'Integrations',
    question: 'Which platforms can I integrate with?',
    answer:
      'Provento.ai integrates with popular workplace tools including Slack, Microsoft Teams, WhatsApp. This allows you to query your documents directly from your preferred communication platform.',
  },
  {
    id: 14,
    category: 'Integrations',
    question: 'How do I set up Slack integration?',
    answer:
      'Setting up Slack integration is simple. In your admin dashboard, go to Slack Integration, connect your workspace, and configure the bot permissions. Once connected, users can directly chat with the Slack bot in their workspace.',
  },
  {
    id: 15,
    category: 'Integrations',
    question: 'Can I integrate with Microsoft Teams?',
    answer:
      'Yes! Our Microsoft Teams integration allows you to query documents directly from Teams channels. Simply install the Provento.ai bot, connect your account, and start chatting with the bot.',
  },
  {
    id: 16,
    category: 'Integrations',
    question: 'How do I set up WhatsApp integration for my organization?',
    answer:
      'Admins can link a WhatsApp Business number from the integration settings in the admin dashboard.',
  },
  {
    id: 17,
    category: 'Integrations',
    question: 'Is chatbot available 24/7?',
    answer:
      'Yes, users can interact with the WhatsApp chatbot 24/7 with instant access to organizational knowledge.',
  },
  {
    id: 18,
    category: 'Integrations',
    question: 'Do users need to share their WhatsApp number?',
    answer:
      'Yes, WhatsApp integration requires user phone numbers for authentication and messaging.',
  },
  {
    id: 19,
    category: 'Pricing',
    question: 'Is there a free plan?',
    answer:
      'We do not provide a free plan. All our plans are paid and tailored to meet different organizational needs, ensuring access to full features, integrations, and dedicated support.',
  },
  {
    id: 20,
    category: 'Pricing',
    question: 'Can I change my plan at any time?',
    answer:
      "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly. No long-term commitments required.",
  },
  {
    id: 21,
    category: 'Pricing',
    question: 'Do you offer annual discounts?',
    answer:
      'Yes! Annual subscriptions receive a 20% discount compared to monthly billing. This can result in significant savings, especially for higher-tier plans.',
  },
  {
    id: 22,
    category: 'Pricing',
    question: 'Is there a document upload limit?',
    answer:
      'Yes, limits depend on your subscription plan. Basic plans support up to 500 pages per month.',
  },
  {
    id: 23,
    category: 'Pricing',
    question: 'Is there a page or file size limit for uploads?',
    answer: 'Individual documents can be up to 50MB or 500 pages, depending on your plan.',
  },
  {
    id: 24,
    category: 'Pricing',
    question: 'Is there a daily question limit for users?',
    answer:
      'Yes, based on your plan. For example, Basic allows 10 questions/day per user; unlimited on Premium plans.',
  },
  {
    id: 25,
    category: 'Features',
    question: 'What file formats are supported?',
    answer:
      'We support all major document formats including PDF, Word documents (.doc, .docx), CSV files, Markdown (.md), plain text files (.txt). If you have a specific format requirement, please contact us.',
  },
  {
    id: 26,
    category: 'Features',
    question: 'Can I upload documents from Google Drive?',
    answer:
      'Yes! We offer seamless Google Drive integration. You can connect your Google Drive account and select multiple files to upload directly to Provento.ai.',
  },
  {
    id: 27,
    category: 'Features',
    question: 'How accurate are the AI responses?',
    answer:
      'Our AI achieves high accuracy rates by using advanced language models and providing source citations with every answer. We continuously improve our models based on user feedback and usage patterns.',
  },
  {
    id: 28,
    category: 'Features',
    question: 'What languages are supported for documents?',
    answer:
      'Currently, we support only English. Multilingual support is planned for future expansion.',
  },
  {
    id: 29,
    category: 'Features',
    question: 'What kind of requests can users make?',
    answer: "Users can ask questions based on the documents they've uploaded.",
  },
  {
    id: 30,
    category: 'Security',
    question: 'Are uploaded documents secure?',
    answer:
      'Yes, all documents are encrypted in transit and at rest using industry-standard security protocols.',
  },
  {
    id: 31,
    category: 'Security',
    question: 'Where are documents stored?',
    answer:
      'Documents are securely stored on cloud servers hosted by trusted providers like AWS or Google Cloud.',
  },
  {
    id: 32,
    category: 'Security',
    question: 'Can I delete my data?',
    answer:
      "Yes, you have complete control over your data. You can delete individual documents or your entire account at any time. When you delete data, it's permanently removed from our servers within 30 days.",
  },
  {
    id: 33,
    category: 'Security',
    question: 'Are user questions stored?',
    answer:
      'Yes, questions are stored for audit and improvement purposes, but never shared externally.',
  },
  {
    id: 34,
    category: 'Security',
    question: 'Are interactions with the chatbot secure?',
    answer:
      'Absolutely. All user interactions are encrypted and comply with data privacy standards like GDPR.',
  },
  {
    id: 35,
    category: 'Technical',
    question: 'What happens if I exceed my plan limits?',
    answer:
      "We'll notify you when you're approaching your limits. If you exceed document or query limits, you can upgrade your plan or purchase additional resources. We don't cut off access immediately - we'll work with you to find the right solution.",
  },
]

const filteredFaqs = computed(() => {
  let filtered = faqs

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
    )
  }

  // Filter by category
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter((faq) => faq.category === selectedCategory.value)
  }

  return filtered
})

const getCategoryCount = (category: string) => {
  if (category === 'All') {
    return searchQuery.value ? filteredFaqs.value.length : faqs.length
  }

  let categoryFaqs = faqs.filter((faq) => faq.category === category)

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    categoryFaqs = categoryFaqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
    )
  }

  return categoryFaqs.length
}

const highlightSearchTerm = (text: string) => {
  if (!searchQuery.value.trim()) return text

  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(
    regex,
    '<mark class="bg-primary-400/30 text-primary-100 px-1 rounded">$1</mark>',
  )
}

const clearSearch = () => {
  searchQuery.value = ''
}

const toggleFaq = (id: number) => {
  const index = openFaqs.value.indexOf(id)
  if (index > -1) {
    openFaqs.value.splice(index, 1)
  } else {
    openFaqs.value.push(id)
  }
}

// Auto-expand FAQs when searching
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    // Open all matching FAQs when searching
    openFaqs.value = filteredFaqs.value.map((faq) => faq.id)
  } else {
    // Close all FAQs when clearing search
    openFaqs.value = []
  }
})

useHead({
  title: 'FAQ - Provento.ai',
})
</script>
