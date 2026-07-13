<script setup lang="ts">
import type { Category, Course, Paginated } from '~/types'

const route = useRoute()

const search = ref((route.query.search as string) || '')
const selectedLevel = ref((route.query.level as string) || '')
const selectedCategory = ref((route.query.category as string) || '')
const minRating = ref(Number(route.query.min_rating) || 0)
const sortBy = ref((route.query.ordering as string) || '-created_at')
const filtersOpen = ref(false)

const { data: categoriesData } = await useAsyncData('categories', () =>
  apiFetch<Category[] | Paginated<Category>>('/courses/categories/')
)
const categories = computed(() => {
  const d = categoriesData.value as any
  return Array.isArray(d) ? d : d?.results ?? []
})

const query = computed(() => ({
  search: search.value || undefined,
  level: selectedLevel.value || undefined,
  category: selectedCategory.value || undefined,
  ordering: sortBy.value || undefined,
  page_size: 24,
}))

const { data, pending } = await useAsyncData(
  () => `courses-${JSON.stringify(query.value)}`,
  () => apiFetch<Paginated<Course>>('/courses/', { params: query.value }),
  { watch: [query] }
)

const courses = computed(() => {
  const results = data.value?.results ?? []
  return minRating.value > 0 ? results.filter((c) => c.average_rating >= minRating.value) : results
})

const activeFilterCount = computed(() =>
  [selectedCategory.value, selectedLevel.value, minRating.value > 0 ? '1' : ''].filter(Boolean).length
)

function resetFilters() {
  search.value = ''
  selectedLevel.value = ''
  selectedCategory.value = ''
  minRating.value = 0
  sortBy.value = '-created_at'
}

const levels = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
]
</script>

<template>
  <div class="border-b border-ink-100 bg-paper-100/60">
    <div class="container-page py-8 sm:py-10">
      <h1 class="text-2xl font-extrabold text-ink-900 sm:text-3xl">Barcha kurslar</h1>
      <p class="mt-1 text-sm text-ink-500">{{ data?.count ?? 0 }} ta kurs topildi</p>
    </div>
  </div>

  <div class="container-page grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-4">
    <button
      class="flex items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm font-semibold text-ink-700 shadow-card lg:hidden"
      @click="filtersOpen = !filtersOpen"
    >
      <span class="flex items-center gap-2">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M4 6h12M6 10h8M8 14h4" stroke-width="1.6" stroke-linecap="round" /></svg>
        Filtrlar
        <span v-if="activeFilterCount" class="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">{{ activeFilterCount }}</span>
      </span>
      <svg class="h-4 w-4 text-ink-400 transition-transform" :class="{ 'rotate-180': filtersOpen }" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M5 7.5l5 5 5-5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <aside class="space-y-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-1 lg:block lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none" :class="filtersOpen ? 'block' : 'hidden lg:block'">
      <div>
        <input
          v-model="search"
          type="text"
          placeholder="Kurs qidirish..."
          class="w-full rounded-xl border border-ink-100 bg-paper-50 px-4 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <h3 class="mb-3 text-sm font-bold text-ink-900">Kategoriya</h3>
        <div class="space-y-2">
          <label class="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
            <input v-model="selectedCategory" type="radio" value="" class="h-4 w-4 accent-brand-600" /> Barchasi
          </label>
          <label v-for="c in categories" :key="c.id" class="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
            <input v-model="selectedCategory" type="radio" :value="String(c.id)" class="h-4 w-4 accent-brand-600" /> {{ c.name }}
          </label>
        </div>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-bold text-ink-900">Daraja</h3>
        <div class="space-y-2">
          <label class="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
            <input v-model="selectedLevel" type="radio" value="" class="h-4 w-4 accent-brand-600" /> Barchasi
          </label>
          <label v-for="l in levels" :key="l.value" class="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
            <input v-model="selectedLevel" type="radio" :value="l.value" class="h-4 w-4 accent-brand-600" /> {{ l.label }}
          </label>
        </div>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-bold text-ink-900">Reyting</h3>
        <div class="space-y-2">
          <label v-for="r in [4.5, 4, 3.5, 3, 0]" :key="r" class="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
            <input v-model.number="minRating" type="radio" :value="r" class="h-4 w-4 accent-brand-600" />
            <template v-if="r > 0">
              <StarRating :rating="r" :show-value="false" size="sm" /> va yuqori
            </template>
            <template v-else>Barchasi</template>
          </label>
        </div>
      </div>

      <button class="text-sm font-semibold text-brand-600 hover:underline" @click="resetFilters">Filtrlarni tozalash</button>
    </aside>

    <div class="lg:col-span-3">
      <div class="mb-5 flex items-center justify-between gap-3 sm:justify-end">
        <p class="text-sm text-ink-400 sm:hidden">{{ courses.length }} natija</p>
        <select v-model="sortBy" class="rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm shadow-card focus:border-brand-400 focus:outline-none">
          <option value="-created_at">Eng yangi</option>
          <option value="price">Narx: pastdan yuqoriga</option>
          <option value="-price">Narx: yuqoridan pastga</option>
          <option value="title">Nomi bo'yicha (A-Z)</option>
        </select>
      </div>

      <div v-if="pending" class="py-24 text-center text-ink-400">Yuklanmoqda...</div>
      <div v-else-if="!courses.length" class="py-24 text-center text-ink-400">Hech narsa topilmadi.</div>
      <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        <CourseCard v-for="course in courses" :key="course.id" :course="course" />
      </div>
    </div>
  </div>
</template>
