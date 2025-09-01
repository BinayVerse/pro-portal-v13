<template>
  <div>
    <section class="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6">
            Simple, Transparent
            <span class="text-primary-400">Pricing</span>
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include unlimited artefacts and 24/7
            support.
          </p>
        </div>

        <!-- Pricing Grid -->
        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="card relative"
            :class="plan.popular ? 'ring-2 ring-primary-500' : ''"
          >
            <div v-if="plan.popular" class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span class="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium"
                >Most Popular</span
              >
            </div>

            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-white mb-2">{{ plan.name }}</h3>
              <p class="text-gray-400 mb-4">{{ plan.description }}</p>
              <div class="mb-4">
                <span class="text-4xl font-bold text-white">
                  <template v-if="plan.price === 'Custom'">
                    {{ plan.price }}
                  </template>
                  <template v-else> ${{ plan.price }} </template>
                </span>
                <span v-if="plan.period" class="text-gray-400">/{{ plan.period }}</span>
              </div>
              <NuxtLink to="/signup" class="btn-primary w-full">{{ plan.cta }}</NuxtLink>
            </div>

            <ul class="space-y-3">
              <li v-for="feature in plan.features" :key="feature" class="flex items-start">
                <UIcon
                  name="i-heroicons-check"
                  class="w-5 h-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0"
                />
                <span class="text-gray-300">{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-24">
          <h2 class="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div class="max-w-3xl mx-auto space-y-6">
            <div v-for="faq in faqs" :key="faq.id" class="card">
              <h3 class="text-lg font-semibold text-white mb-2">{{ faq.question }}</h3>
              <p class="text-gray-300">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'main',
})

const plans = [
  {
    id: 1,
    name: 'Starter',
    description: 'Perfect for individuals and small teams',
    price: 29,
    period: 'month',
    cta: 'Get Started',
    popular: false,
    features: [
      'Up to 100 artefacts',
      '1,000 AI queries per month',
      'Basic integrations',
      'Email support',
      '5 GB storage',
    ],
  },
  {
    id: 2,
    name: 'Professional',
    description: 'Best for growing businesses',
    price: 99,
    period: 'month',
    cta: 'Get Started',
    popular: true,
    features: [
      'Up to 1,000 artefacts',
      '10,000 AI queries per month',
      'All integrations',
      'Priority support',
      '50 GB storage',
      'Team collaboration',
      'Custom branding',
    ],
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'Custom',
    period: '',
    cta: 'Contact Sales',
    popular: false,
    features: [
      'Unlimited artefacts',
      'Unlimited AI queries',
      'All integrations',
      '24/7 dedicated support',
      'Unlimited storage',
      'Advanced security',
      'Custom deployment',
      'SLA guarantee',
    ],
  },
]

const faqs = [
  {
    id: 1,
    question: 'Can I change my plan anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
  },
  {
    id: 2,
    question: 'How do I get started?',
    answer:
      'Simply choose your plan and click "Get Started" to begin using our platform immediately.',
  },
  {
    id: 3,
    question: 'What file formats are supported?',
    answer: 'We support PDF, Word, Excel, PowerPoint, CSV, and many other common artefact formats.',
  },
  {
    id: 4,
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption and are SOC 2 and GDPR compliant.',
  },
]
</script>
