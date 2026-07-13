<script setup lang="ts">
import type { Course, Paginated } from '~/types'

const auth = useAuthStore()
const router = useRouter()

const { data: statsData } = await useAsyncData('register-stats', () =>
  apiFetch<Paginated<Course>>('/courses/?page_size=100')
)
const stats = computed(() => {
  const courses = statsData.value?.results ?? []
  const rated = courses.filter((c) => c.reviews_count > 0)
  const avgRating = rated.length ? rated.reduce((s, c) => s + c.average_rating, 0) / rated.length : 0
  return {
    courses: statsData.value?.count ?? 0,
    instructors: new Set(courses.map((c) => c.instructor.id)).size,
    rating: avgRating,
  }
})

const form = reactive({
  username: '',
  email: '',
  password: '',
  password2: '',
})

const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  if (form.password !== form.password2) {
    error.value = 'Parollar mos emas.'
    return
  }
  loading.value = true
  try {
    await auth.register({ ...form })
    router.push('/dashboard')
  } catch (err: any) {
    const data = err?.data
    error.value = data ? Object.values(data).flat().join(' ') : 'Ro\'yxatdan o\'tishda xatolik yuz berdi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-2">
    <div class="relative hidden flex-col justify-between overflow-hidden bg-panel-mesh p-12 lg:flex">
      <div class="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-16 right-10 h-64 w-64 rounded-full bg-aqua-300/30 blur-3xl" />
      <NuxtLink to="/" class="relative flex items-center gap-2 text-lg font-extrabold text-ink-900">
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-aqua-500 text-sm font-black text-white">E</span>
        Edu<span class="text-brand-600">Platform</span>
      </NuxtLink>
      <div class="relative">
        <h2 class="text-3xl font-extrabold leading-tight text-ink-900">Bugun o'rganishni boshlang.</h2>
        <p class="mt-3 max-w-sm text-ink-500">
          Boshqa talabalar bilan birga dasturlash, dizayn va marketing bo'yicha
          ko'nikmalaringizni oshiring — yoki o'z kursingizni yarating.
        </p>
        <div class="mt-8 flex gap-6 text-sm text-ink-500">
          <div><p class="text-xl font-extrabold text-ink-900">{{ stats.courses }}</p>kurslar</div>
          <div><p class="text-xl font-extrabold text-ink-900">{{ stats.instructors }}</p>o'qituvchi</div>
          <div><p class="text-xl font-extrabold text-ink-900">{{ stats.rating ? stats.rating.toFixed(1) + '★' : '—' }}</p>o'rtacha</div>
        </div>
      </div>
      <p class="relative text-xs text-ink-400">&copy; {{ new Date().getFullYear() }} EduPlatform</p>
    </div>

    <div class="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-20">
      <div class="mx-auto w-full max-w-sm">
        <h1 class="text-2xl font-extrabold text-ink-900">Ro'yxatdan o'tish</h1>
        <p class="mt-1 text-sm text-ink-400">Bir necha soniyada boshlang</p>

        <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Foydalanuvchi nomi</label>
            <input v-model="form.username" type="text" required class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Email</label>
            <input v-model="form.email" type="email" required class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700">Parol</label>
              <input v-model="form.password" type="password" required class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700">Tasdiqlash</label>
              <input v-model="form.password2" type="password" required class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <button type="submit" :disabled="loading" class="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-glow disabled:opacity-50">
            {{ loading ? 'Yuborilmoqda...' : 'Ro\'yxatdan o\'tish' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-ink-400">
          Hisobingiz bormi?
          <NuxtLink to="/login" class="font-semibold text-brand-600 hover:underline">Kirish</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
