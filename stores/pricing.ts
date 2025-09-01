import { defineStore } from 'pinia'

export interface PricingPlan {
  id: number
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular: boolean
  createdAt: string
}

export const usePricingStore = defineStore('pricing', () => {
  const plans = ref<PricingPlan[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchPlans = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/api/plans')

      let data: { success: boolean; data?: PricingPlan[]; error?: string }

      try {
        const responseText = await response.text()

        if (!responseText) {
          data = { success: false, error: 'Empty response from server' }
        } else {
          try {
            data = JSON.parse(responseText)
          } catch (parseError) {
            data = { success: false, error: responseText }
          }
        }
      } catch (textError) {
        data = { success: false, error: 'Failed to read response from server' }
      }

      if (response.ok && data.success && data.data) {
        plans.value = data.data
        return { success: true }
      } else {
        throw new Error(data.error || 'Failed to fetch pricing plans')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch pricing plans'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const getPlanById = (id: number) => {
    return plans.value.find((plan) => plan.id === id)
  }

  const getPopularPlan = () => {
    return plans.value.find((plan) => plan.popular)
  }

  return {
    plans: readonly(plans),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchPlans,
    getPlanById,
    getPopularPlan,
  }
})
