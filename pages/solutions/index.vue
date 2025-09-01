<template>
  <div>
    <section class="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6">
            Transforming Industries with
            <span class="text-primary-400">AI-Powered Artefact Intelligence</span>
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover how Provento.ai transforms artefact workflows across different industries,
            helping organizations streamline artefact workflow, enhance productivity, and make
            data-driven decisions faster than ever before.
          </p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex flex-wrap justify-center gap-2 mb-12">
          <button
            v-for="industry in industries"
            :key="industry.slug"
            @click="navigateTo(`/solutions/${industry.slug}`)"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              selectedFilter === industry.slug
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700 hover:text-white'
            "
          >
            {{ industry.name }}
          </button>
        </div>

        <!-- Industries Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink
            v-for="industry in filteredIndustries"
            :key="industry.slug"
            :to="`/solutions/${industry.slug}`"
            class="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:bg-dark-700 transition-all duration-200 cursor-pointer flex flex-col min-h-[280px]"
          >
            <div
              class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4"
            >
              <UIcon :name="industry.icon" class="w-6 h-6 text-primary-400" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">{{ industry.name }}</h3>
            <p class="text-gray-300 mb-6 flex-grow">{{ industry.description }}</p>
            <div class="mt-auto">
              <button
                class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Learn More →
              </button>
            </div>
          </NuxtLink>
        </div>

        <!-- Universal Benefits Section -->
        <div class="mt-20">
          <h2 class="text-3xl font-bold text-white text-center mb-16">
            Universal Benefits Across All Industries
          </h2>

          <div class="grid md:grid-cols-2 gap-12">
            <!-- Left side - Benefits list -->
            <div class="space-y-8">
              <div
                v-for="benefit in benefits"
                :key="benefit.title"
                class="flex items-start space-x-4"
              >
                <div
                  class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <UIcon name="i-heroicons-check" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-white mb-2">{{ benefit.title }}</h3>
                  <p class="text-gray-300">{{ benefit.description }}</p>
                </div>
              </div>
            </div>

            <!-- Right side - Core Capabilities -->
            <div class="bg-dark-800 rounded-xl p-8 border border-dark-700">
              <h3 class="text-2xl font-bold text-white mb-8 text-center">Core Capabilities</h3>
              <div class="grid grid-cols-2 gap-8">
                <div class="text-center">
                  <div class="text-4xl font-bold text-primary-400 mb-2">50+</div>
                  <div class="text-gray-300 text-sm">File Types Supported</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-primary-400 mb-2">99.9%</div>
                  <div class="text-gray-300 text-sm">Uptime Guarantee</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-primary-400 mb-2">24/7</div>
                  <div class="text-gray-300 text-sm">AI Processing</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-primary-400 mb-2">SOC 2</div>
                  <div class="text-gray-300 text-sm">Compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div
          class="mt-20 text-center bg-gradient-to-r from-primary-900/20 to-primary-800/20 rounded-xl p-12"
        >
          <h2 class="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Industry Workflow?
          </h2>
          <p class="text-xl text-gray-300 mb-8">
            Join industry leaders who are already using Provento.ai to revolutionize their artefact
            processes.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/book-meeting" class="btn-primary text-lg px-8 py-4">
              Book a Demo
            </NuxtLink>
            <NuxtLink to="/signup" class="btn-outline text-lg px-8 py-4">
              Start Free Trial
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Using default layout

const selectedFilter = ref('all')

const industries = [
  {
    name: 'Education',
    slug: 'education',
    description: 'Enhance learning experiences with intelligent artefact interaction.',
    icon: 'i-heroicons-academic-cap',
    useCases: ['Research assistance', 'Study materials', 'Academic papers', 'Student support'],
  },
  {
    name: 'Finance & Banking',
    slug: 'finance-banking',
    description: 'Accelerate financial artefact processing and analysis.',
    icon: 'i-heroicons-currency-dollar',
    useCases: [
      'Risk assessment',
      'Compliance reports',
      'Financial analysis',
      'Audit documentation',
    ],
  },
  {
    name: 'Government',
    slug: 'government',
    description: 'Modernize public sector artefact management and citizen services.',
    icon: 'i-heroicons-building-office',
    useCases: ['Policy artefacts', 'Public records', 'Regulatory compliance', 'Citizen services'],
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Improve patient care with intelligent medical artefact analysis.',
    icon: 'i-heroicons-heart',
    useCases: [
      'Medical records',
      'Research studies',
      'Treatment protocols',
      'Patient documentation',
    ],
  },
  {
    name: 'Insurance',
    slug: 'insurance',
    description: 'Streamline claims processing and risk assessment workflows.',
    icon: 'i-heroicons-shield-check',
    useCases: ['Claims processing', 'Policy analysis', 'Risk assessment', 'Underwriting'],
  },
  {
    name: 'Legal',
    slug: 'legal',
    description: 'Streamline legal artefact analysis and contract review processes.',
    icon: 'i-heroicons-scale',
    useCases: ['Contract analysis', 'Due diligence', 'Case research', 'Compliance review'],
  },
  {
    name: 'Manufacturing',
    slug: 'manufacturing',
    description: 'Optimize technical documentation and quality processes.',
    icon: 'i-heroicons-cog-6-tooth',
    useCases: [
      'Technical specifications',
      'Quality documentation',
      'Process manuals',
      'Compliance records',
    ],
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Simplify property documentation and transaction management.',
    icon: 'i-heroicons-home',
    useCases: ['Property artefacts', 'Contracts & leases', 'Market analysis', 'Due diligence'],
  },
]

const filteredIndustries = computed(() => {
  if (selectedFilter.value === 'all') {
    return industries
  }
  return industries.filter((industry) => industry.slug === selectedFilter.value)
})

const benefits = [
  {
    title: 'Reduce Processing Time by 75%',
    description: 'Transform hours of manual artefact review into minutes of intelligent analysis.',
  },
  {
    title: 'Improve Accuracy by 90%',
    description: 'Eliminate human error with AI-powered artefact analysis and extraction.',
  },
  {
    title: 'Scale Operations Effortlessly',
    description: 'Handle increasing artefact volumes without proportional staffing increases.',
  },
  {
    title: 'Ensure Compliance & Security',
    description: 'Meet industry regulations with enterprise-grade security and audit trails.',
  },
]
</script>
