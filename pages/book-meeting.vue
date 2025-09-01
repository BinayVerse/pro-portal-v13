<script setup lang="ts">
import { useContactStore } from '~/stores/contact'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'main',
})

const { showNotification } = useNotification()
const contactStore = useContactStore()
const loading = computed(() => contactStore.loading)
const showSuccessModal = ref(false)

// Form reference for manual validation
const formRef = ref()

// Phone validation handled by component

// Form reference to access UForm's internal state
const form = ref()

// UForm now handles error styling natively, no custom logic needed

// Zod schema for form validation
const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  company: z.string().min(1, 'Company name is required').max(255, 'Company name too long'),
  jobTitle: z.string().min(1, 'Job title is required').max(255, 'Job title too long'),
  companySize: z
    .string()
    .min(1, 'Please select a company size')
    .refine((val) => ['1-10', '11-50', '51-200', '201-1000', '1000+'].includes(val), {
      message: 'Please select a valid company size',
    }),
  useCase: z
    .string()
    .min(1, 'Please select a use case')
    .refine(
      (val) => ['legal', 'hr', 'finance', 'research', 'customer-support', 'other'].includes(val),
      {
        message: 'Please select a valid use case',
      },
    ),
  message: z.string().max(1000, 'Message too long').optional(),
  // phone validation handled at component level
})

type Schema = z.output<typeof schema>

const state = reactive({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  jobTitle: '',
  companySize: '',
  useCase: '',
  message: '',
  phone: null as string | null,
})

// Phone number handling
const phoneRef = ref()
const phoneValidation = ref({ status: true, message: '' })

// Options for selects
const companySizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

const useCaseOptions = [
  { value: 'legal', label: 'Legal artefact analysis' },
  { value: 'hr', label: 'HR documentation' },
  { value: 'finance', label: 'Financial artefacts' },
  { value: 'research', label: 'Research and analysis' },
  { value: 'customer-support', label: 'Customer support' },
  { value: 'other', label: 'Other' },
]

const demoExpectations = [
  'Personalized demo based on your use case',
  'Live artefact upload and questioning',
  'Integration walkthrough',
  'Pricing and plan discussion',
  'Next steps and trial setup',
]

// UForm handles error clearing natively when user types

// Function to validate phone and update UI
function validatePhoneField() {
  const phoneValidation = phoneRef.value?.handlePhoneValidation?.(true)
  return phoneValidation?.status || false
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Validate phone number first
  if (!validatePhoneField()) {
    return
  }

  try {
    const domain = window.location.hostname
    const isProd = domain.includes('provento.ai') && !domain.includes('test')
    const isTest = domain.includes('test') || domain.includes('refactor')

    // Get the phone number with country code from the phone component
    const phoneData = phoneRef.value?.phoneData
    // Use the raw number format (e.g., "+917008081842") without additional formatting
    const phoneNumberWithCountryCode = phoneData?.number || state.phone || ''
    console.log('Submitting phone number with country code:', phoneNumberWithCountryCode)
    console.log('Phone data:', phoneData)

    // Prepare data for API
    const contactData = {
      name: event.data.firstName,
      lastname: event.data.lastName,
      email: event.data.email,
      phone: phoneNumberWithCountryCode || undefined,
      company: event.data.company || undefined,
      jobTitle: event.data.jobTitle || undefined,
      companySize: event.data.companySize || undefined,
      requestFor: event.data.useCase || undefined,
      message: event.data.message || undefined,
      domain: isProd ? 'Prod' : isTest ? 'Test' : 'Local',
      // Note: reCAPTCHA token would be needed for production
      token: 'demo-token', // Replace with actual reCAPTCHA token
    }

    // Submit via store
    await contactStore.submitDemoRequest(contactData)

    // Show success modal
    showSuccessModal.value = true

    // Reset form
    Object.assign(state, {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      jobTitle: '',
      companySize: '',
      useCase: '',
      message: '',
      phone: '',
    })

    // Reset phone component
    if (phoneRef.value && phoneRef.value.resetPhoneField) {
      phoneRef.value.resetPhoneField()
    }
    phoneValidation.value = { status: true, message: '' }
  } catch (error: any) {
    console.error('Demo submission error:', error)
    showNotification(
      error.message || 'Failed to submit demo request. Please try again or contact us directly.',
      'error',
    )
  }
}
</script>

<template>
  <div>
    <!-- Success Modal -->
    <UModal v-model="showSuccessModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-center">
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            >
              <UIcon name="i-heroicons-check" class="h-6 w-6 text-green-600" />
            </div>
          </div>
        </template>

        <div class="text-center">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Demo Request Submitted Successfully!
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Thank you for your interest in Provento.ai! Our team will contact you within 24 hours to
            schedule your personalized demo session.
          </p>
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div class="flex items-center text-sm text-blue-800 dark:text-blue-200">
              <UIcon name="i-heroicons-information-circle" class="h-5 w-5 mr-2 flex-shrink-0" />
              <span
                >We'll send you a calendar invite with meeting details and preparation
                materials.</span
              >
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton color="gray" variant="ghost" @click="showSuccessModal = false">
              Close
            </UButton>
            <UButton color="primary" @click="navigateTo('/')"> Back to Home </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
    <section class="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6">
            Book a
            <span class="text-primary-400">Demo</span>
          </h1>
          <p class="text-xl text-gray-300">
            See Provento.ai in action and discover how it can transform your artefact workflow
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-12">
          <!-- Demo Form -->
          <div class="card">
            <h2 class="text-2xl font-bold text-white mb-6">Schedule Your Demo</h2>

            <UForm
              ref="formRef"
              :schema="schema"
              :state="state"
              class="space-y-4"
              @submit="onSubmit"
            >
              <div class="grid grid-cols-2 gap-4">
                <UFormGroup name="firstName" label="First Name" required>
                  <UInput
                    v-model="state.firstName"
                    eager-validation
                    inputClass="custom-input"
                    placeholder="John"
                  />
                </UFormGroup>

                <UFormGroup name="lastName" label="Last Name" required>
                  <UInput
                    v-model="state.lastName"
                    eager-validation
                    inputClass="custom-input"
                    placeholder="Doe"
                  />
                </UFormGroup>
              </div>

              <UFormGroup name="email" label="Email" required>
                <UInput
                  v-model="state.email"
                  type="email"
                  eager-validation
                  inputClass="custom-input"
                  placeholder="john.doe@example.com"
                />
              </UFormGroup>

              <UFormGroup
                name="phone"
                label="Phone Number"
                help="We'll use this for scheduling calls"
                required
              >
                <LibVueTelInput
                  ref="phoneRef"
                  v-model="state.phone"
                  placeholder="Your phone number"
                  class="my-4"
                  defaultCountry="us"
                />
              </UFormGroup>

              <UFormGroup name="company" label="Company" required>
                <UInput
                  v-model="state.company"
                  eager-validation
                  inputClass="custom-input"
                  placeholder="Your company name"
                />
              </UFormGroup>

              <UFormGroup name="jobTitle" label="Job Title" required>
                <UInput
                  v-model="state.jobTitle"
                  eager-validation
                  inputClass="custom-input"
                  placeholder="Your role"
                />
              </UFormGroup>

              <UFormGroup name="companySize" label="Company Size" required>
                <USelect
                  v-model="state.companySize"
                  :options="companySizeOptions"
                  value-attribute="value"
                  option-attribute="label"
                  placeholder="Select company size"
                  selectClass="custom-select"
                  eager-validation
                />
              </UFormGroup>

              <UFormGroup name="useCase" label="Use Case" required>
                <USelect
                  v-model="state.useCase"
                  :options="useCaseOptions"
                  value-attribute="value"
                  option-attribute="label"
                  placeholder="Select use case"
                  selectClass="custom-select"
                  eager-validation
                />
              </UFormGroup>

              <UFormGroup name="message" label="Message (Optional)">
                <UTextarea
                  v-model="state.message"
                  :rows="4"
                  placeholder="Tell us about your specific needs or questions..."
                  :ui="{
                    base: 'w-full resize-none',
                  }"
                  textareaClass="custom-textarea"
                />
              </UFormGroup>

              <div class="form-field-wrapper">
                <button
                  type="submit"
                  :disabled="loading"
                  class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="validatePhoneField"
                >
                  <span v-if="loading" class="flex items-center justify-center">
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    />
                    Booking a Demo...
                  </span>
                  <span v-else>Book a Demo</span>
                </button>
              </div>
            </UForm>
          </div>

          <!-- Demo Information -->
          <div class="space-y-8">
            <!-- What to Expect -->
            <div class="card">
              <h3 class="text-xl font-bold text-white mb-4">What to Expect</h3>
              <ul class="space-y-3">
                <li v-for="item in demoExpectations" :key="item" class="flex items-start">
                  <UIcon
                    name="i-heroicons-check"
                    class="w-5 h-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0"
                  />
                  <span class="text-gray-300">{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Demo Stats -->
            <div class="card">
              <h3 class="text-xl font-bold text-white mb-4">Demo Details</h3>
              <div class="space-y-4">
                <div class="flex items-center">
                  <UIcon name="i-heroicons-clock" class="w-5 h-5 text-primary-400 mr-3" />
                  <span class="text-gray-300">30-45 minutes</span>
                </div>
                <div class="flex items-center">
                  <UIcon name="i-heroicons-video-camera" class="w-5 h-5 text-primary-400 mr-3" />
                  <span class="text-gray-300">Live video call</span>
                </div>
                <div class="flex items-center">
                  <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-primary-400 mr-3" />
                  <span class="text-gray-300">Custom artefact demo</span>
                </div>
                <div class="flex items-center">
                  <UIcon
                    name="i-heroicons-question-mark-circle"
                    class="w-5 h-5 text-primary-400 mr-3"
                  />
                  <span class="text-gray-300">Q&A session</span>
                </div>
              </div>
            </div>

            <!-- Contact Alternative -->
            <div class="card">
              <h3 class="text-xl font-bold text-white mb-4">Prefer to Talk First?</h3>
              <p class="text-gray-300 mb-4">
                Have questions before booking? Our sales team is happy to help.
              </p>
              <div class="space-y-3">
                <a
                  href="mailto:contact@provento.ai"
                  class="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <UIcon name="i-heroicons-envelope" class="w-5 h-5 mr-3" />
                  contact@provento.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Form field wrapper spacing */
.form-field-wrapper {
  margin-bottom: 1.5rem;
}

/* Custom input styles to match reference design - no border styling to allow UForm errors */
:deep(.custom-input) {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  font-size: 0.875rem !important;
  padding: 0.875rem 1rem !important;
  transition: all 0.2s ease-in-out !important;
  width: 100% !important;
  border-radius: 0.5rem !important;
}

:deep(.custom-input:hover) {
  background-color: #1e293b !important;
}

:deep(.custom-input:focus) {
  background-color: #1e293b !important;
  outline: none !important;
}

:deep(.custom-input::placeholder) {
  color: #64748b !important;
}

/* Custom select styles - no border styling to allow UForm errors */
:deep(.custom-select) {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  font-size: 0.875rem !important;
  padding: 0.875rem 1rem !important;
  transition: all 0.2s ease-in-out !important;
  width: 100% !important;
  cursor: pointer !important;
  border-radius: 0.5rem !important;
}

:deep(.custom-select:hover) {
  background-color: #1e293b !important;
}

:deep(.custom-select:focus) {
  background-color: #1e293b !important;
  outline: none !important;
}

/* Custom textarea styles - no border styling to allow UForm errors */
:deep(.custom-textarea) {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  font-size: 0.875rem !important;
  padding: 0.875rem 1rem !important;
  transition: all 0.2s ease-in-out !important;
  width: 100% !important;
  resize: none !important;
  border-radius: 0.5rem !important;
}

:deep(.custom-textarea:hover) {
  background-color: #1e293b !important;
}

:deep(.custom-textarea:focus) {
  background-color: #1e293b !important;
  outline: none !important;
}

:deep(.custom-textarea::placeholder) {
  color: #64748b !important;
}

/* Vue-tel-input custom styling to match design */
:deep(.vue-tel-custom-input) {
  background-color: transparent !important;
  border: none !important;
  color: #f3f4f6 !important;
  font-size: 0.875rem !important;
  padding: 0.75rem !important;
  padding-left: 1rem !important;
}

:deep(.vue-tel-custom-input::placeholder) {
  color: #9ca3af !important;
}

:deep(.vue-tel-custom-input:focus) {
  outline: none !important;
  box-shadow: none !important;
}

/* UForm handles error styling natively, phone field styling preserved */
:deep(.vue-tel-input.errorState) {
  border: 2px solid #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.custom-input.error-border:hover) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.custom-input.error-border:focus) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.custom-select.error-border) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.custom-select.error-border:hover) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.custom-select.error-border:focus) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.custom-textarea.error-border) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.custom-textarea.error-border:hover) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.custom-textarea.error-border:focus) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

/* Custom styling for vue3-tel-input to match the design */
:deep(.vue-tel-input) {
  border: 1px solid #334155;
  border-radius: 0.5rem;
  background-color: #1e293b;
  transition: all 0.2s ease-in-out;
  box-shadow: none;
  position: relative;
  overflow: visible;
}

:deep(.vue-tel-input:hover) {
  border-color: #475569;
  background-color: #1e293b;
}

:deep(.vue-tel-input:focus-within) {
  border-color: #3b82f6;
  background-color: #1e293b;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Focused error state - maintain consistent border width */
:deep(.vue-tel-input.errorState:focus-within) {
  border-color: #ef4444 !important;
  background-color: #1e293b;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

:deep(.vue-tel-input .vti__dropdown) {
  background-color: #1e293b;
  border-right: 1px solid #334155;
  border-radius: 0.5rem 0 0 0.5rem;
}

:deep(.vue-tel-input .vti__dropdown:hover) {
  background-color: #1e293b;
}

:deep(.vue-tel-input .vti__dropdown-list) {
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

:deep(.vue-tel-input .vti__dropdown-item) {
  color: #e2e8f0;
  padding: 8px 12px;
}

:deep(.vue-tel-input .vti__dropdown-item:hover) {
  background-color: rgba(59, 130, 246, 0.1);
}

:deep(.vue-tel-input .vti__dropdown-item.highlighted) {
  background-color: rgba(59, 130, 246, 0.2);
}

:deep(.vue-tel-input .vti__selection) {
  color: #e2e8f0;
  font-size: 0.875rem;
}

:deep(.vue-tel-input .vti__input) {
  background-color: transparent !important;
  border: none !important;
  color: #e2e8f0 !important;
  font-size: 0.875rem;
  padding: 0.875rem 1rem !important;
}

:deep(.vue-tel-input .vti__input::placeholder) {
  color: #9ca3af;
}

:deep(.vue-tel-input .vti__input:focus) {
  outline: none !important;
  box-shadow: none !important;
}

/* Ensure input is clickable and not blocked */
:deep(.vue-tel-input .vti__input) {
  pointer-events: all !important;
  user-select: text !important;
  cursor: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

/* Remove any potential overlays or blocking elements */
:deep(.vue-tel-input::before),
:deep(.vue-tel-input::after) {
  display: none !important;
}

/* Ensure the phone input container is interactive */
:deep(.vue-tel-input) {
  pointer-events: all !important;
}

/* Fix any potential z-index issues */
:deep(.vue-tel-input *) {
  z-index: auto !important;
}

:deep(.vue-tel-input .vti__dropdown-arrow) {
  color: #9ca3af;
}

/* Search box styling */
:deep(.vti__search-box) {
  background-color: rgba(31, 41, 55, 0.9) !important;
  border: 1px solid rgba(75, 85, 99, 0.7) !important;
  color: #f3f4f6 !important;
  border-radius: 0.5rem !important;
  margin: 8px !important;
  padding: 8px 12px !important;
  font-size: 14px !important;
  width: calc(100% - 16px) !important;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

:deep(.vti__search-box::placeholder) {
  color: #9ca3af !important;
}

:deep(.vti__search-box:focus) {
  outline: none !important;
  border-color: #3b82f6 !important;
  background-color: rgba(37, 47, 63, 1) !important;
  box-shadow:
    0 0 0 2px rgba(59, 130, 246, 0.1),
    inset 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

/* Ensure dropdown list is properly positioned and sized */
:deep(.vue-tel-input .vti__dropdown-list) {
  background-color: rgba(17, 24, 39, 0.95) !important;
  border: 1px solid rgba(55, 65, 81, 0.6) !important;
  border-radius: 0.5rem !important;
  backdrop-filter: blur(10px) !important;
  max-height: 250px !important;
  overflow-y: auto !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
  z-index: 50 !important;
}
</style>
