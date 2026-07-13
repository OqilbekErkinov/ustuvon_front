<script setup lang="ts">
import type { Category, Paginated } from '~/types'

const config = useRuntimeConfig()
const apiDocsUrl = computed(() => config.public.apiBase.replace(/\/api\/?$/, '/api/docs/'))

const { data: categoriesData } = await useAsyncData('footer-categories', () =>
  apiFetch<Category[] | Paginated<Category>>('/courses/categories/')
)
const categories = computed(() => {
  const d = categoriesData.value as any
  return Array.isArray(d) ? d : d?.results ?? []
})

const platformLinks = [
  { label: 'Barcha kurslar', to: '/courses' },
  { label: "O'qituvchi bo'lish", to: '/register' },
  { label: 'Dashboard', to: '/dashboard' },
]

const companyLinks = [
  { label: 'Biz haqimizda', to: '/' },
  { label: 'Aloqa', to: '/' },
]
</script>

<template>
  <footer class="border-t border-ink-100 bg-paper-50">
    <div class="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4 sm:py-16">
      <div class="col-span-2 sm:col-span-1">
        <NuxtLink to="/" class="flex items-center gap-2 text-lg font-extrabold text-ink-900">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-aqua-500 text-sm font-black text-white">E</span>
          Edu<span class="text-brand-600">Platform</span>
        </NuxtLink>
        <p class="mt-3 text-sm text-ink-400">
          Kelajagingizni bugun quring — dasturlash, dizayn va marketing bo'yicha amaliy kurslar.
        </p>
      </div>

      <div>
        <h4 class="mb-3 text-sm font-bold text-ink-900">Platforma</h4>
        <ul class="space-y-2">
          <li v-for="link in platformLinks" :key="link.label">
            <NuxtLink :to="link.to" class="text-sm text-ink-500 hover:text-brand-600">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="mb-3 text-sm font-bold text-ink-900">Kategoriyalar</h4>
        <ul class="space-y-2">
          <li v-for="c in categories" :key="c.id">
            <NuxtLink :to="`/courses?category=${c.id}`" class="text-sm text-ink-500 hover:text-brand-600">{{ c.name }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="mb-3 text-sm font-bold text-ink-900">Kompaniya</h4>
        <ul class="space-y-2">
          <li v-for="link in companyLinks" :key="link.label">
            <NuxtLink :to="link.to" class="text-sm text-ink-500 hover:text-brand-600">{{ link.label }}</NuxtLink>
          </li>
          <li>
            <a :href="apiDocsUrl" target="_blank" rel="noopener" class="text-sm text-ink-500 hover:text-brand-600">API hujjatlari</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t border-ink-100 py-6">
      <p class="container-page text-center text-xs text-ink-400">
        &copy; {{ new Date().getFullYear() }} EduPlatform. Barcha huquqlar himoyalangan.
      </p>
    </div>
  </footer>
</template>
