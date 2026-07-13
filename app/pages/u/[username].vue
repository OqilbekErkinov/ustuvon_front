<script setup lang="ts">
import type { Course, Paginated, PublicProfile } from '~/types'

const route = useRoute()
const auth = useAuthStore()
const username = route.params.username as string

const { data: profile, refresh, error } = await useAsyncData(`profile-${username}`, () =>
  apiFetch<PublicProfile>(`/auth/users/${username}/`)
)

const { data: coursesData } = await useAsyncData(`profile-courses-${username}`, () =>
  profile.value?.is_creator_active
    ? apiFetch<Paginated<Course>>('/courses/', { params: { instructor: profile.value.id } })
    : Promise.resolve(null)
)
const courses = computed(() => coursesData.value?.results ?? [])

const isSelf = computed(() => auth.user?.username === username)
const following = ref(false)

async function toggleFollow() {
  if (!auth.isAuthenticated) return navigateTo('/login')
  following.value = true
  try {
    await apiFetch(`/auth/users/${username}/follow/`, { method: profile.value?.is_following ? 'DELETE' : 'POST' })
    await refresh()
  } finally {
    following.value = false
  }
}
</script>

<template>
  <div v-if="error" class="mx-auto max-w-lg px-4 py-24 text-center">
    <p class="text-lg text-ink-400">Foydalanuvchi topilmadi.</p>
  </div>

  <div v-else-if="profile" class="container-page max-w-4xl py-8 sm:py-10">
    <div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4 sm:gap-5">
        <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-aqua-500 text-xl font-bold text-white shadow-glow sm:h-20 sm:w-20 sm:text-2xl">
          {{ (profile.first_name || profile.username).charAt(0).toUpperCase() }}
        </span>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl font-extrabold text-ink-900 sm:text-2xl">{{ profile.first_name || profile.username }} {{ profile.last_name }}</h1>
            <span v-if="profile.is_creator_active" class="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">O'qituvchi</span>
          </div>
          <p class="text-sm text-ink-400">@{{ profile.username }}</p>
          <p v-if="profile.bio" class="mt-2 max-w-md text-sm text-ink-600">{{ profile.bio }}</p>
        </div>
      </div>

      <button
        v-if="!isSelf"
        :disabled="following"
        class="w-full shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 sm:w-auto"
        :class="profile.is_following ? 'border border-ink-200 text-ink-700 hover:bg-paper-100' : 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm hover:shadow-glow'"
        @click="toggleFollow"
      >
        {{ profile.is_following ? 'Kuzatilmoqda ✓' : 'Kuzatish' }}
      </button>
    </div>

    <div class="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-ink-100 bg-white py-5 shadow-card">
      <div class="text-center">
        <p class="text-xl font-extrabold text-ink-900">{{ profile.followers_count }}</p>
        <p class="text-xs text-ink-400">Obunachilar</p>
      </div>
      <div class="text-center">
        <p class="text-xl font-extrabold text-ink-900">{{ profile.following_count }}</p>
        <p class="text-xs text-ink-400">Kuzatmoqda</p>
      </div>
      <div class="text-center">
        <p class="text-xl font-extrabold text-ink-900">{{ profile.streak_days }} 🔥</p>
        <p class="text-xs text-ink-400">Kunlik streak</p>
      </div>
    </div>

    <div v-if="profile.is_creator_active" class="mt-10">
      <h2 class="mb-4 text-xl font-bold text-ink-900">Kurslari ({{ courses.length }})</h2>
      <div v-if="!courses.length" class="text-sm text-ink-400">Hali kurs yo'q.</div>
      <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <CourseCard v-for="course in courses" :key="course.id" :course="course" />
      </div>
    </div>
  </div>
</template>
