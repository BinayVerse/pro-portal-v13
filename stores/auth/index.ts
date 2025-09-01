import type { AuthUser, ApiResponse } from "./types";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: null as AuthUser | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    // Helper methods
    setLoading(status: boolean) {
      this.loading = status;
    },

    setError(error: string | null) {
      this.error = error;
    },


    setAuthUser(user: AuthUser | null) {
      this.user = user;
      if (process.client) {
        if (user) {
          localStorage.setItem("authUser", JSON.stringify(user));
        } else {
          localStorage.removeItem("authUser");
          localStorage.removeItem("authToken");
        }
      }
    },

    // Generic API call handler
    async apiCall<T>(endpoint: string, data?: any): Promise<T> {
      const response = await $fetch<ApiResponse<T>>(endpoint, {
        method: "POST",
        body: data,
        ignoreResponseError: true,
      });

      if (response?.status === "success") {
        return response.data || response as T;
      }

      const errorMessage = response?.message || "Operation failed";
      this.setError(errorMessage);
      throw new Error(errorMessage);
    },

    // Initialize store from localStorage
    initializeStore() {
      if (!process.client) return;
      
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch (e) {
          localStorage.removeItem("authUser");
        }
      }
    },

    // Auth actions
    async signup(formData: Record<string, any>) {
      this.setLoading(true);
      this.setError(null);

      try {
        await this.apiCall("/api/auth/signup", formData);
        this.setAuthUser(null);
      } finally {
        this.setLoading(false);
      }
    },

    async signIn(credentials: { email: string; password: string }) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response: any = await this.apiCall("/api/auth/signin", credentials);
        
        this.setAuthUser(response.user);
        if (process.client && response.token) {
          localStorage.setItem("authToken", response.token);
        }

        return response;
      } finally {
        this.setLoading(false);
      }
    },

    async googleSignIn(formData: Record<string, any>) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response: any = await this.apiCall("/api/auth/google-signin", formData);
        
        this.setAuthUser(response.user);
        if (process.client && response.token) {
          localStorage.setItem("authToken", response.token);
        }

        return {
          status: "success",
          message: response.message || "Sign-in successful!",
          redirect: response.redirect || "/profile",
        };
      } finally {
        this.setLoading(false);
      }
    },

    async resetPassword(formData: Record<string, any>) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response = await this.apiCall("/api/auth/reset-password", formData);
        return response;
      } finally {
        this.setLoading(false);
      }
    },

    async updatePassword(formData: Record<string, any>) {
      this.setLoading(true);
      this.setError(null);

      try {
        const response = await this.apiCall("/api/auth/update-password", formData);
        return response;
      } finally {
        this.setLoading(false);
      }
    },

    async signOut() {
      try {
        this.setAuthUser(null);
        await navigateTo("/");
      } catch (error: any) {
        console.error("Error during logout:", error.message);
      }
    },

    async handlePostLoginRedirect() {
      if (!process.client) return;
      
      const route = useRoute();
      const redirectTo = (route.query.redirect as string) || '/admin/dashboard';
      await navigateTo(redirectTo);
    },
  },
});
