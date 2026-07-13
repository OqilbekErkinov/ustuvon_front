<script setup lang="ts">
import type { AnalyticsOverview, LessonDropoff } from '~/types'

definePageMeta({ middleware: 'instructor' })

const { data: overview } = await useAsyncData('instructor-analytics', () =>
  apiFetch<AnalyticsOverview>('/courses/analytics/')
)

const expandedSlug = ref<string | null>(null)
const dropoffCache = reactive<Record<string, LessonDropoff[]>>({})
const loadingDropoff = ref(false)

async function toggleCourse(slug: string) {
  if (expandedSlug.value === slug) {
    expandedSlug.value = null
    return
  }
  expandedSlug.value = slug
  if (!dropoffCache[slug]) {
    loadingDropoff.value = true
    try {
      const res = await apiFetch<{ lesson_dropoff: LessonDropoff[] }>(`/courses/analytics/${slug}/`)
      dropoffCache[slug] = res.lesson_dropoff
    } finally {
      loadingDropoff.value = false
    }
  }
}
</script>

<template>
  <div class="container-page max-w-5xl py-8 sm:py-10">
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-ink-900">Analitika</h1>
        <p class="mt-1 text-sm text-ink-400">Kurslaringiz qanday ishlayotganini kuzating.</p>
      </div>
      <NuxtLink to="/dashboard" class="text-sm font-semibold text-brand-600 hover:underline">← Dashboard</NuxtLink>
    </div>

    <div v-if="overview" class="mb-8 grid grid-cols-2 gap-3 sm:mb-10 sm:gap-4 lg:grid-cols-4">
      <div class="rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-5">
        <p class="text-2xl font-extrabold text-ink-900">{{ overview.total_courses }}</p>
        <p class="mt-1 text-xs text-ink-400">Kurslar</p>
      </div>
      <div class="rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-5">
        <p class="text-2xl font-extrabold text-ink-900">{{ formatNumber(overview.total_students) }}</p>
        <p class="mt-1 text-xs text-ink-400">Talabalar</p>
      </div>
      <div class="rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-5">
        <p class="text-2xl font-extrabold text-ink-900">{{ formatPrice(overview.total_revenue) }}</p>
        <p class="mt-1 text-xs text-ink-400">Jami daromad</p>
      </div>
      <div class="rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-5">
        <p class="text-2xl font-extrabold text-ink-900">{{ overview.average_rating || '—' }}</p>
        <p class="mt-1 text-xs text-ink-400">O'rtacha baho</p>
      </div>
    </div>

    <h2 class="mb-4 text-lg font-bold text-ink-900">Kurslar bo'yicha</h2>
    <p class="mb-4 text-xs text-ink-400">Eng past tugatilish darajasidan boshlab tartiblangan — e'tibor talab qiladiganlar tepada.</p>

    <div class="space-y-3">
      <div v-for="course in overview?.courses" :key="course.id" class="rounded-2xl border border-ink-100 bg-white shadow-card">
        <button class="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left sm:p-5" @click="toggleCourse(course.slug)">
          <div>
            <p class="font-semibold text-ink-900">{{ course.title }}</p>
            <p class="mt-1 text-sm text-ink-400">
              {{ course.students_count }} talaba · {{ formatPrice(course.revenue) }}
              <span v-if="course.reviews_count"> · ★ {{ course.average_rating }}</span>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-sm font-bold" :class="course.completion_rate < 30 ? 'text-red-600' : course.completion_rate < 60 ? 'text-amber-600' : 'text-emerald-600'">
                {{ course.completion_rate }}%
              </p>
              <p class="text-[11px] text-ink-400">tugatilish</p>
            </div>
            <svg class="h-4 w-4 text-ink-400 transition-transform" :class="{ 'rotate-180': expandedSlug === course.slug }" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M5 7.5l5 5 5-5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </button>

        <div v-if="expandedSlug === course.slug" class="border-t border-ink-100 px-5 py-4">
          <p class="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">Dars bo'yicha tugatilish (qayerda talabalar to'xtaydi)</p>
          <div v-if="loadingDropoff && !dropoffCache[course.slug]" class="text-sm text-ink-400">Yuklanmoqda...</div>
          <div v-else class="space-y-2">
            <div v-for="lesson in dropoffCache[course.slug]" :key="lesson.lesson_id" class="flex items-center gap-3">
              <span class="w-40 shrink-0 truncate text-sm text-ink-700">{{ lesson.title }}</span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-paper-200">
                <div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-aqua-400" :style="{ width: `${lesson.completion_rate}%` }" />
              </div>
              <span class="w-10 shrink-0 text-right text-xs font-medium text-ink-500">{{ lesson.completion_rate }}%</span>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!overview?.courses.length" class="py-10 text-center text-ink-400">Hali kurs yaratmagansiz.</p>
    </div>
  </div>
</template>
