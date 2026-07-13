import { defineStore } from 'pinia'
import type { User } from '~/types'

interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isInstructor: (state) => state.user?.is_creator_active === true,
  },

  actions: {
    async login(username: string, password: string) {
      const config = useRuntimeConfig()
      const data = await $fetch<LoginResponse>('/auth/login/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: { username, password },
      })
      this.accessToken = data.access
      this.refreshToken = data.refresh
      this.user = data.user
    },

    async register(payload: {
      username: string
      email: string
      password: string
      password2: string
    }) {
      const config = useRuntimeConfig()
      await $fetch('/auth/register/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: payload,
      })
      await this.login(payload.username, payload.password)
    },

    async becomeCreator(bio: string) {
      const config = useRuntimeConfig()
      const data = await $fetch<User>('/auth/become-creator/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: { bio, accept_terms: true },
      })
      this.user = data
    },

    async fetchMe() {
      if (!this.accessToken) return
      const config = useRuntimeConfig()
      this.user = await $fetch<User>('/auth/me/', {
        baseURL: config.public.apiBase,
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
    },

    async refreshAccessToken(): Promise<boolean> {
      if (!this.refreshToken) return false
      const config = useRuntimeConfig()
      try {
        const data = await $fetch<{ access: string; refresh: string }>('/auth/login/refresh/', {
          baseURL: config.public.apiBase,
          method: 'POST',
          body: { refresh: this.refreshToken },
        })
        this.accessToken = data.access
        if (data.refresh) this.refreshToken = data.refresh
        return true
      } catch {
        this.logout()
        return false
      }
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
    },
  },

  persist: {
    storage: persistedState.cookiesWithOptions({ maxAge: 60 * 60 * 24 * 7 }),
  },
})
