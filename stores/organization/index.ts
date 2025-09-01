import { defineStore } from 'pinia'

export interface OrganizationState {
  // Other organization-related state can be added here
}

export const useOrganizationStore = defineStore('organizationStore', {
  state: (): OrganizationState => ({
    // Organization state
  }),

  getters: {
    // Organization getters can be added here
  },

  actions: {
    // Organization actions can be added here
  },
})
