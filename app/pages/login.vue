<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = 'Login yoki parol noto\'g\'ri.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-2">
    <div class="relative hidden flex-col justify-between overflow-hidden bg-panel-mesh p-12 lg:flex">
      <div class="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-aqua-300/30 blur-3xl" />
      <NuxtLink to="/" class="relative flex items-center gap-2 text-lg font-extrabold text-ink-900">
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-aqua-500 text-sm font-black text-white">E</span>
        Edu<span class="text-brand-600">Platform</span>
      </NuxtLink>
      <div class="relative">
        <h2 class="text-3xl font-extrabold leading-tight text-ink-900">Qayta xush kelibsiz.</h2>
        <p class="mt-3 max-w-sm text-ink-500">
          Kurslaringizni davom ettiring va yangi ko'nikmalarni egallashda davom eting.
        </p>
      </div>
      <p class="relative text-xs text-ink-400">&copy; {{ new Date().getFullYear() }} EduPlatform</p>
    </div>

    <div class="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-20">
      <div class="mx-auto w-full max-w-sm">
        <h1 class="text-2xl font-extrabold text-ink-900">Hisobingizga kiring</h1>
        <p class="mt-1 text-sm text-ink-400">Kurslaringizga kirish uchun login qiling</p>

        <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Foydalanuvchi nomi</label>
            <input v-model="username" type="text" required class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Parol</label>
            <input v-model="password" type="password" required class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <button type="submit" :disabled="loading" class="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-glow disabled:opacity-50">
            {{ loading ? 'Kirilmoqda...' : 'Kirish' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-ink-400">
          Hisobingiz yo'qmi?
          <NuxtLink to="/register" class="font-semibold text-brand-600 hover:underline">Ro'yxatdan o'tish</NuxtLink>
        </p>

        <div class="mt-8 rounded-xl border border-ink-100 bg-paper-50 p-4 text-xs text-ink-500">
          <p class="mb-1 font-semibold text-ink-700">Demo hisob:</p>
          <p>instructor_demo / Demo12345 (o'qituvchi)</p>
          <p>student_demo / Demo12345 (o'quvchi)</p>
        </div>
      </div>
    </div>
  </div>
</template>
