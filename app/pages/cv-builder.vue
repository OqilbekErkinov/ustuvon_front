<script setup lang="ts">
import type { CVProfile } from '~/types'

definePageMeta({ middleware: 'auth' })

const { data: cv } = await useAsyncData('my-cv', () => apiFetch<CVProfile>('/auth/cv/'))

const form = reactive<CVProfile>({
  full_name: cv.value?.full_name ?? '',
  headline: cv.value?.headline ?? '',
  summary: cv.value?.summary ?? '',
  email: cv.value?.email ?? '',
  phone: cv.value?.phone ?? '',
  location: cv.value?.location ?? '',
  education: cv.value?.education ?? [],
  experience: cv.value?.experience ?? [],
  skills: cv.value?.skills ?? [],
  links: cv.value?.links ?? [],
  updated_at: cv.value?.updated_at ?? '',
})

const skillsInput = ref(form.skills.join(', '))

const saving = ref(false)
const saved = ref(false)
const autofilling = ref(false)
const downloading = ref(false)

function addEducation() {
  form.education.push({ institution: '', degree: '', start: '', end: '' })
}
function addExperience() {
  form.experience.push({ company: '', role: '', start: '', end: '', description: '' })
}
function addLink() {
  form.links.push({ label: '', url: '' })
}

async function save() {
  saving.value = true
  saved.value = false
  try {
    form.skills = skillsInput.value.split(',').map((s) => s.trim()).filter(Boolean)
    await apiFetch('/auth/cv/', { method: 'PUT', body: form })
    saved.value = true
  } finally {
    saving.value = false
  }
}

async function autofill() {
  autofilling.value = true
  try {
    const res = await apiFetch<CVProfile>('/auth/cv/autofill/', { method: 'POST' })
    form.education = res.education
  } finally {
    autofilling.value = false
  }
}

async function downloadPdf() {
  await save()
  downloading.value = true
  try {
    const config = useRuntimeConfig()
    const auth = useAuthStore()
    const res = await fetch(`${config.public.apiBase}/auth/cv/pdf/`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cv.pdf'
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-10">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-ink-900">CV Builder</h1>
        <p class="mt-1 text-sm text-ink-400">Platformadagi faoliyatingizni professional rezyumega aylantiring.</p>
      </div>
      <button :disabled="downloading" class="w-full shrink-0 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-glow disabled:opacity-50 sm:w-auto" @click="downloadPdf">
        {{ downloading ? 'Tayyorlanmoqda...' : 'PDF yuklab olish' }}
      </button>
    </div>

    <div class="space-y-6">
      <section class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <h2 class="mb-4 text-lg font-bold text-ink-900">Shaxsiy ma'lumotlar</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="col-span-2">
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">To'liq ism</label>
            <input v-model="form.full_name" type="text" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div class="col-span-2">
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Sarlavha</label>
            <input v-model="form.headline" type="text" placeholder="Masalan: Frontend dasturchi" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Email</label>
            <input v-model="form.email" type="email" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Telefon</label>
            <input v-model="form.phone" type="text" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div class="col-span-2">
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Manzil</label>
            <input v-model="form.location" type="text" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div class="col-span-2">
            <label class="mb-1.5 block text-sm font-semibold text-ink-700">Xulosa</label>
            <textarea v-model="form.summary" rows="3" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-ink-900">Ta'lim</h2>
          <button :disabled="autofilling" class="text-sm font-semibold text-brand-600 hover:underline" @click="autofill">
            {{ autofilling ? 'Yuklanmoqda...' : "Sertifikatlarimdan avtomatik to'ldirish" }}
          </button>
        </div>
        <div v-for="(item, i) in form.education" :key="i" class="mb-4 grid grid-cols-1 gap-3 border-b border-ink-100 pb-4 last:border-0 sm:grid-cols-2">
          <input v-model="item.degree" type="text" placeholder="Kurs / daraja" class="col-span-2 rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input v-model="item.institution" type="text" placeholder="Muassasa" class="col-span-2 rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input v-model="item.start" type="text" placeholder="Boshlanish (2025-01)" class="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input v-model="item.end" type="text" placeholder="Tugash" class="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <button class="col-span-2 text-left text-xs font-medium text-red-600 hover:underline" @click="form.education.splice(i, 1)">O'chirish</button>
        </div>
        <button class="text-sm font-semibold text-ink-700 hover:text-brand-600" @click="addEducation">+ Qator qo'shish</button>
      </section>

      <section class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <h2 class="mb-4 text-lg font-bold text-ink-900">Ish tajribasi</h2>
        <div v-for="(item, i) in form.experience" :key="i" class="mb-4 grid grid-cols-1 gap-3 border-b border-ink-100 pb-4 last:border-0 sm:grid-cols-2">
          <input v-model="item.role" type="text" placeholder="Lavozim" class="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input v-model="item.company" type="text" placeholder="Kompaniya" class="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input v-model="item.start" type="text" placeholder="Boshlanish" class="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input v-model="item.end" type="text" placeholder="Tugash (yoki 'hozir')" class="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <textarea v-model="item.description" rows="2" placeholder="Tavsif" class="col-span-2 rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <button class="col-span-2 text-left text-xs font-medium text-red-600 hover:underline" @click="form.experience.splice(i, 1)">O'chirish</button>
        </div>
        <button class="text-sm font-semibold text-ink-700 hover:text-brand-600" @click="addExperience">+ Qator qo'shish</button>
      </section>

      <section class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <h2 class="mb-4 text-lg font-bold text-ink-900">Ko'nikmalar</h2>
        <input v-model="skillsInput" type="text" placeholder="Vue, Django, Figma, ... (vergul bilan ajrating)" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </section>

      <section class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <h2 class="mb-4 text-lg font-bold text-ink-900">Havolalar</h2>
        <div v-for="(item, i) in form.links" :key="i" class="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input v-model="item.label" type="text" placeholder="Nomi (GitHub, LinkedIn)" class="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input v-model="item.url" type="url" placeholder="https://..." class="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        </div>
        <button class="text-sm font-semibold text-ink-700 hover:text-brand-600" @click="addLink">+ Havola qo'shish</button>
      </section>

      <div class="flex flex-wrap items-center gap-4">
        <button :disabled="saving" class="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-glow disabled:opacity-50" @click="save">
          {{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}
        </button>
        <p v-if="saved" class="text-sm font-medium text-emerald-600">Saqlandi!</p>
      </div>
    </div>
  </div>
</template>
