// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // DevTools try to resolve `vite` dynamically, which breaks Vercel's
  // production install step. Keep it on for local dev, off everywhere else.
  devtools: { enabled: !process.env.VERCEL && !process.env.CI },

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
      telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME || '',
    },
  },

  app: {
    head: {
      title: 'EduPlatform — Online Kurslar',
      meta: [
        { name: 'description', content: 'Online kurs platformasi — dasturlash, dizayn va marketing bo\'yicha kurslar.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&display=swap',
        },
      ],
    },
  },
})
