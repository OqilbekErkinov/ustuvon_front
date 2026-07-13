<script setup lang="ts">
import type { Category, Course, Paginated } from '~/types'

definePageMeta({ middleware: 'instructor' })

const router = useRouter()

const { data: categoriesData } = await useAsyncData('categories-create', () =>
  apiFetch<Category[] | Paginated<Category>>('/courses/categories/')
)
const categories = computed(() => {
  const d = categoriesData.value as any
  return Array.isArray(d) ? d : d?.results ?? []
})

const form = reactive({
  title: '',
  subtitle: '',
  description: '',
  what_you_will_learn: '',
  requirements: '',
  category: '',
  level: 'beginner',
  price: '0',
  original_price: '',
  is_published: true,
  strict_sequential: true,
})

const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const payload = {
      ...form,
      category: form.category || null,
      original_price: form.original_price || null,
    }
    const course = await apiFetch<Course>('/courses/', { method: 'POST', body: payload })
    router.push(`/courses/${course.slug}/edit`)
  } catch (err: any) {
    const data = err?.data
    error.value = data ? Object.values(data).flat().join(' ') : 'Kurs yaratishda xatolik yuz berdi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-10">
    <h1 class="mb-1 text-2xl font-extrabold text-ink-900">Yangi kurs yaratish</h1>
    <p class="mb-6 text-sm text-ink-400">Kurs ma'lumotlarini to'ldiring. Darslarni keyingi bosqichda qo'shasiz.</p>

    <form class="space-y-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-8" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">Kurs nomi</label>
        <input v-model="form.title" type="text" required placeholder="Masalan: Vue 3 va Nuxt 4 bilan Zamonaviy Frontend" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">Qisqa tavsif (subtitle)</label>
        <input v-model="form.subtitle" type="text" placeholder="Bir jumlada kursning asosiy afzalligi" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">To'liq tavsif</label>
        <textarea v-model="form.description" rows="4" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">Nimalarni o'rganasiz</label>
        <textarea v-model="form.what_you_will_learn" rows="4" placeholder="Har bir bandni yangi qatordan yozing" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <p class="mt-1 text-xs text-ink-400">Har bir qator alohida band sifatida ko'rsatiladi.</p>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">Talab qilinadigan bilimlar</label>
        <textarea v-model="form.requirements" rows="3" placeholder="Har bir bandni yangi qatordan yozing" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-ink-700">Kategoriya</label>
          <select v-model="form.category" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100">
            <option value="">Tanlanmagan</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-ink-700">Daraja</label>
          <select v-model="form.level" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100">
            <option value="beginner">Boshlang'ich</option>
            <option value="intermediate">O'rta</option>
            <option value="advanced">Yuqori</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-ink-700">Narx (so'm)</label>
          <input v-model="form.price" type="number" min="0" step="1000" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-ink-700">Chegirmagacha narx (ixtiyoriy)</label>
          <input v-model="form.original_price" type="number" min="0" step="1000" placeholder="Masalan: 450000" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm text-ink-700">
        <input v-model="form.is_published" type="checkbox" class="h-4 w-4 rounded border-ink-300 accent-brand-600" />
        Darhol e'lon qilish
      </label>
      <label class="flex items-start gap-2 text-sm text-ink-700">
        <input v-model="form.strict_sequential" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-600" />
        <span>
          Ketma-ket ochilish <span class="text-ink-400">— keyingi dars avvalgisi tugatilmaguncha qulflanadi.
          Ma'lumotnoma uslubidagi kurslar uchun o'chirib qo'yish mumkin.</span>
        </span>
      </label>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button type="submit" :disabled="loading" class="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-glow disabled:opacity-50">
        {{ loading ? 'Yaratilmoqda...' : 'Kursni yaratish va darslar qo\'shish' }}
      </button>
    </form>
  </div>
</template>
