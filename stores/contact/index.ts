import type { State, createAPIPayload, DemoRequestPayload } from './types'

function initialState(): State {
  return {
    loading: false,
  }
}

export const useContactStore = defineStore('contactStore', {
  state: (): State => initialState(),
  getters: {},
  actions: {
    async create(payload: createAPIPayload) {
      this.loading = true;
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        let data: any;

        try {
          const responseText = await response.text();

          if (!responseText) {
            data = { status: 'error', message: 'Empty response from server' };
          } else {
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              data = { status: 'error', message: responseText };
            }
          }
        } catch (textError) {
          data = { status: 'error', message: 'Failed to read response from server' };
        }

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to send message');
        }

        return data;
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to send message');
      } finally {
        this.loading = false;
      }
    },

    async submitDemoRequest(payload: DemoRequestPayload) {
      this.loading = true;
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        let data: any;

        try {
          const responseText = await response.text();

          if (!responseText) {
            data = { status: 'error', message: 'Empty response from server' };
          } else {
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              data = { status: 'error', message: responseText };
            }
          }
        } catch (textError) {
          data = { status: 'error', message: 'Failed to read response from server' };
        }

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to submit demo request');
        }

        return data;
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to submit demo request');
      } finally {
        this.loading = false;
      }
    },
  },
})
