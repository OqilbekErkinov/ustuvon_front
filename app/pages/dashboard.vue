<script setup lang="ts">
import type { Certificate, Course, Enrollment, Paginated } from '~/types'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const config = useRuntimeConfig()

const { data: enrollments } = await useAsyncData('my-enrollments', () =>
  auth.isInstructor ? Promise.resolve(null) : apiFetch<Paginated<Enrollment>>('/courses/my-enrollments/')
)

const { data: myCourses } = await useAsyncData('my-courses', () =>
  auth.isInstructor ? apiFetch<Paginated<Course>>('/courses/?mine=true') : Promise.resolve(null)
)

const { data: certificates } = await useAsyncData('my-certificates', () =>
  auth.isInstructor ? Promise.resolve(null) : apiFetch<Paginated<Certificate>>('/courses/my-certificates/')
)

const instructorStats = computed(() => {
  const courses = myCourses.value?.results ?? []
  return {
    courses: courses.length,
    students: courses.reduce((sum, c) => sum + c.students_count, 0),
    avgRating: courses.filter((c) => c.reviews_count > 0).length
      ? courses.reduce((sum, c) => sum + c.average_rating, 0) / courses.filter((c) => c.reviews_count > 0).length
      : 0,
  }
})

const telegramCode = ref('')
const telegramDeepLink = ref('')
const linkingTelegram = ref(false)

async function linkTelegram() {
  linkingTelegram.value = true
  try {
    const res = await apiFetch<{ code: string; deep_link: string | null }>('/auth/telegram/link/', {
      method: 'POST',
      body: { bot_username: config.public.telegramBotUsername },
    })
    telegramCode.value = res.code
    telegramDeepLink.value = res.deep_link || ''
  } finally {
    linkingTelegram.value = false
  }
}

async function unlinkTelegram() {
  await apiFetch('/auth/telegram/unlink/', { method: 'POST' })
  await auth.fetchMe()
}
</script>

<template>
  <div class="border-b border-ink-100 bg-paper-100/60">
    <div class="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-ink-900 sm:text-3xl">Salom, {{ auth.user?.username }} 👋</h1>
        <p class="mt-1 text-sm text-ink-500">{{ auth.isInstructor ? "O'qituvchi paneli" : "O'quvchi paneli" }}</p>
      </div>
      <div v-if="!auth.isInstructor && auth.user" class="flex w-fit items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-bold text-ink-900 shadow-card">
        🔥 {{ auth.user.streak_days }} kunlik streak
      </div>
    </div>
  </div>

  <div class="container-page py-8 sm:py-10">
    <div v-if="auth.isInstructor" class="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
      <div class="rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-5">
        <p class="text-xl font-extrabold text-ink-900 sm:text-2xl">{{ instructorStats.courses }}</p>
        <p class="mt-1 text-xs text-ink-400">Kurslar</p>
      </div>
      <div class="rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-5">
        <p class="text-xl font-extrabold text-ink-900 sm:text-2xl">{{ formatNumber(instructorStats.students) }}</p>
        <p class="mt-1 text-xs text-ink-400">Talabalar</p>
      </div>
      <div class="rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-5">
        <p class="text-xl font-extrabold text-ink-900 sm:text-2xl">{{ instructorStats.avgRating ? instructorStats.avgRating.toFixed(1) : '—' }}</p>
        <p class="mt-1 text-xs text-ink-400">O'rtacha baho</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <template v-if="auth.isInstructor">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-bold text-ink-900">Mening kurslarim</h2>
            <div class="flex gap-2">
              <NuxtLink to="/analytics" class="rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-bold text-ink-700 shadow-card hover:border-brand-200">Analitika</NuxtLink>
              <NuxtLink to="/courses/create" class="rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:shadow-glow">+ Yangi kurs</NuxtLink>
            </div>
          </div>
          <div v-if="!myCourses?.results.length" class="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-ink-400">
            Hali kurs yaratmagansiz.
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="course in myCourses.results"
              :key="course.id"
              :to="`/courses/${course.slug}/edit`"
              class="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
            >
              <div class="min-w-0">
                <p class="truncate font-semibold text-ink-900">{{ course.title }}</p>
                <p class="mt-1 text-sm text-ink-400">
                  {{ course.students_count }} talaba · {{ course.lessons_count }} dars
                  <span v-if="course.reviews_count"> · ★ {{ course.average_rating.toFixed(1) }}</span>
                </p>
              </div>
              <span
                class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                :class="course.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-paper-200 text-ink-500'"
              >
                {{ course.is_published ? 'E\'lon qilingan' : 'Qoralama' }}
              </span>
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <h2 class="mb-4 text-lg font-bold text-ink-900">Mening kurslarim</h2>
          <div v-if="!enrollments?.results.length" class="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-ink-400">
            Siz hali hech qanday kursga yozilmagansiz.
            <NuxtLink to="/courses" class="mt-2 block font-semibold text-brand-600 hover:underline">Kurslarni ko'rish</NuxtLink>
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="enrollment in enrollments.results"
              :key="enrollment.id"
              :to="`/courses/${enrollment.course.slug}`"
              class="block rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
            >
              <p class="font-semibold text-ink-900">{{ enrollment.course.title }}</p>
              <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-200">
                <div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-aqua-400" :style="{ width: `${enrollment.progress_percent}%` }" />
              </div>
              <p class="mt-1 text-xs text-ink-400">{{ enrollment.progress_percent }}% bajarildi</p>
            </NuxtLink>
          </div>
        </template>
      </div>

      <div class="space-y-6">
        <div v-if="!auth.isInstructor" class="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 class="mb-3 flex items-center gap-2 font-bold text-ink-900">
            <span class="text-xl">🏆</span> Sertifikatlarim
          </h3>
          <div v-if="!certificates?.results.length" class="text-sm text-ink-400">
            Hali sertifikat yo'q — kursni 100% tugatganingizda avtomatik beriladi.
          </div>
          <div v-else class="space-y-2.5">
            <a
              v-for="cert in certificates.results" :key="cert.id"
              :href="cert.pdf_file" target="_blank"
              class="flex items-center justify-between gap-2 rounded-xl border border-ink-100 px-3 py-2.5 text-sm hover:border-brand-200 hover:bg-brand-50/40"
            >
              <span class="truncate font-medium text-ink-800">{{ cert.course_title }}</span>
              <span class="shrink-0 text-brand-600">Yuklash ↓</span>
            </a>
          </div>
        </div>

        <div class="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 class="mb-2 flex items-center gap-2 font-bold text-ink-900">
            <span class="text-xl">✈️</span> Telegram bildirishnomalari
          </h3>

          <template v-if="auth.user?.telegram_chat_id">
            <p class="mb-4 text-sm font-medium text-emerald-600">✓ Telegram bog'langan</p>
            <button class="w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50" @click="unlinkTelegram">
              Bog'lanishni uzish
            </button>
          </template>
          <template v-else>
            <p class="mb-4 text-sm text-ink-500">
              Kursga yozilganda va yangiliklardan xabardor bo'lish uchun Telegram botimizga ulaning.
            </p>
            <button
              v-if="!telegramCode"
              :disabled="linkingTelegram"
              class="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-glow disabled:opacity-50"
              @click="linkTelegram"
            >
              {{ linkingTelegram ? 'Kod olinmoqda...' : 'Telegramni bog\'lash' }}
            </button>
            <div v-else class="space-y-3">
              <a
                v-if="telegramDeepLink"
                :href="telegramDeepLink"
                target="_blank"
                class="block w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:shadow-glow"
              >
                Botni ochish
              </a>
              <p class="text-sm text-ink-500">
                Yoki botga qo'lda yuboring:
                <code class="mt-1 block break-all rounded-lg bg-paper-100 px-2 py-1.5 text-xs">/start {{ telegramCode }}</code>
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
