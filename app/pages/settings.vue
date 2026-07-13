<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const router = useRouter()

const profileForm = reactive({
  first_name: auth.user?.first_name ?? '',
  last_name: auth.user?.last_name ?? '',
  bio: auth.user?.bio ?? '',
})
const savingProfile = ref(false)
const profileSaved = ref(false)

async function saveProfile() {
  savingProfile.value = true
  profileSaved.value = false
  try {
    await apiFetch('/auth/me/', { method: 'PATCH', body: profileForm })
    await auth.fetchMe()
    profileSaved.value = true
  } finally {
    savingProfile.value = false
  }
}

const creatorBio = ref('')
const acceptTerms = ref(false)
const activating = ref(false)
const activateError = ref('')

async function activateCreator() {
  if (!acceptTerms.value) {
    activateError.value = "Davom etish uchun shartlarni qabul qiling."
    return
  }
  activating.value = true
  activateError.value = ''
  try {
    await auth.becomeCreator(creatorBio.value || profileForm.bio)
    router.push('/dashboard')
  } catch (err: any) {
    activateError.value = err?.data?.detail || 'Xatolik yuz berdi.'
  } finally {
    activating.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-10">
    <h1 class="mb-8 text-2xl font-extrabold text-ink-900">Sozlamalar</h1>

    <section class="mb-8 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
      <h2 class="mb-4 text-lg font-bold text-ink-900">Profil</h2>
      <form class="space-y-4" @submit.prevent="saveProfile">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Ism</label>
            <input v-model="profileForm.first_name" type="text" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Familiya</label>
            <input v-model="profileForm.last_name" type="text" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-ink-700">Bio</label>
          <textarea v-model="profileForm.bio" rows="3" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        </div>
        <p v-if="profileSaved" class="text-sm font-medium text-emerald-600">Saqlandi!</p>
        <button type="submit" :disabled="savingProfile" class="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-glow disabled:opacity-50">
          {{ savingProfile ? 'Saqlanmoqda...' : 'Saqlash' }}
        </button>
      </form>
    </section>

    <section class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
      <template v-if="auth.isInstructor">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-aqua-500 text-lg">🎓</span>
          <div>
            <h2 class="font-bold text-ink-900">Siz Creator hisoblanasiz</h2>
            <p class="text-sm text-ink-500">Kurslaringizni <NuxtLink to="/dashboard" class="text-brand-600 hover:underline">Dashboard</NuxtLink>'dan boshqaring.</p>
          </div>
        </div>
      </template>
      <template v-else>
        <h2 class="mb-1 text-lg font-bold text-ink-900">Creator bo'ling</h2>
        <p class="mb-4 text-sm text-ink-500">
          Bilimingizni ulashishga tayyormisiz? Hisobingizni o'zgartirmasdan, shu yerdan
          o'qituvchi imkoniyatlarini yoqing — kamida 60 soniya.
        </p>
        <div class="space-y-3">
          <textarea
            v-model="creatorBio"
            rows="3"
            placeholder="O'zingiz haqingizda qisqacha (ixtiyoriy, keyin ham o'zgartirish mumkin)"
            class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <label class="flex items-start gap-2 text-sm text-ink-600">
            <input v-model="acceptTerms" type="checkbox" class="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 accent-brand-600" />
            Creator shartlarini qabul qilaman (kurs sifatiga javobgarman, kontent siyosatiga rioya qilaman).
          </label>
          <p v-if="activateError" class="text-sm text-red-600">{{ activateError }}</p>
          <button
            :disabled="activating"
            class="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-glow disabled:opacity-50"
            @click="activateCreator"
          >
            {{ activating ? 'Yoqilmoqda...' : "Creator bo'lish" }}
          </button>
        </div>
      </template>
    </section>
  </div>
</template>
