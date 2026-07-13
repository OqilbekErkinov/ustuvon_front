<script setup lang="ts">
import type { Category, Course, Lesson, Paginated } from '~/types'

definePageMeta({ middleware: 'instructor' })

const route = useRoute()
const auth = useAuthStore()
const slug = route.params.slug as string

const { data: course, refresh } = await useAsyncData(`edit-course-${slug}`, () =>
  apiFetch<Course>(`/courses/${slug}/`)
)

if (course.value && course.value.instructor.id !== auth.user?.id) {
  await navigateTo('/dashboard')
}

const { data: categoriesData } = await useAsyncData('categories-edit', () =>
  apiFetch<Category[] | Paginated<Category>>('/courses/categories/')
)
const categories = computed(() => {
  const d = categoriesData.value as any
  return Array.isArray(d) ? d : d?.results ?? []
})

const form = reactive({
  title: course.value?.title ?? '',
  subtitle: course.value?.subtitle ?? '',
  description: course.value?.description ?? '',
  what_you_will_learn: course.value?.what_you_will_learn_list?.join('\n') ?? '',
  requirements: course.value?.requirements_list?.join('\n') ?? '',
  category: course.value?.category?.id ?? '',
  level: course.value?.level ?? 'beginner',
  price: course.value?.price ?? '0',
  original_price: course.value?.original_price ?? '',
  is_published: course.value?.is_published ?? true,
  strict_sequential: course.value?.strict_sequential ?? true,
})

const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

async function saveCourse() {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const payload = {
      ...form,
      category: form.category || null,
      original_price: form.original_price || null,
    }
    await apiFetch(`/courses/${slug}/`, { method: 'PATCH', body: payload })
    saveSuccess.value = true
    await refresh()
  } catch (err: any) {
    saveError.value = 'Saqlashda xatolik yuz berdi.'
  } finally {
    saving.value = false
  }
}

const lessonForm = reactive({ title: '', content: '', video_url: '', duration_minutes: 10, is_free_preview: false })
const addingLesson = ref(false)
const lessonError = ref('')

async function addLesson() {
  if (!course.value) return
  addingLesson.value = true
  lessonError.value = ''
  try {
    const order = (course.value.lessons?.length ?? 0) + 1
    await apiFetch<Lesson>('/courses/lessons/', {
      method: 'POST',
      body: { ...lessonForm, course: course.value.id, order },
    })
    lessonForm.title = ''
    lessonForm.content = ''
    lessonForm.video_url = ''
    lessonForm.duration_minutes = 10
    lessonForm.is_free_preview = false
    await refresh()
  } catch (err: any) {
    lessonError.value = 'Dars qo\'shishda xatolik yuz berdi.'
  } finally {
    addingLesson.value = false
  }
}

async function deleteLesson(id: number) {
  await apiFetch(`/courses/lessons/${id}/`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div v-if="course" class="container-page max-w-3xl py-8 sm:py-10">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-2">
      <div class="min-w-0">
        <h1 class="text-2xl font-extrabold text-ink-900">Kursni boshqarish</h1>
        <p class="mt-1 truncate text-sm text-ink-400">{{ course.title }}</p>
      </div>
      <NuxtLink :to="`/courses/${slug}`" class="text-sm font-semibold text-brand-600 hover:underline">Kursni ko'rish →</NuxtLink>
    </div>

    <form class="space-y-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-8" @submit.prevent="saveCourse">
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">Kurs nomi</label>
        <input v-model="form.title" type="text" required class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">Qisqa tavsif (subtitle)</label>
        <input v-model="form.subtitle" type="text" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">To'liq tavsif</label>
        <textarea v-model="form.description" rows="4" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-ink-700">Nimalarni o'rganasiz</label>
        <textarea v-model="form.what_you_will_learn" rows="4" placeholder="Har bir bandni yangi qatordan yozing" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
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
          <label class="mb-1.5 block text-sm font-semibold text-ink-700">Chegirmagacha narx</label>
          <input v-model="form.original_price" type="number" min="0" step="1000" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm text-ink-700">
        <input v-model="form.is_published" type="checkbox" class="h-4 w-4 rounded border-ink-300 accent-brand-600" />
        E'lon qilingan
      </label>
      <label class="flex items-start gap-2 text-sm text-ink-700">
        <input v-model="form.strict_sequential" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-600" />
        <span>Ketma-ket ochilish <span class="text-ink-400">— keyingi dars avvalgisi tugatilmaguncha qulflanadi.</span></span>
      </label>

      <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
      <p v-if="saveSuccess" class="text-sm font-medium text-emerald-600">Saqlandi!</p>

      <button type="submit" :disabled="saving" class="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-glow disabled:opacity-50">
        {{ saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash' }}
      </button>
    </form>

    <div class="mt-10">
      <h2 class="mb-4 text-xl font-bold text-ink-900">Darslar ({{ course.lessons?.length ?? 0 }})</h2>

      <ol class="mb-6 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white shadow-card">
        <li v-for="(lesson, i) in course.lessons" :key="lesson.id" class="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{{ i + 1 }}</span>
            <span class="truncate text-sm text-ink-700">{{ lesson.title }}</span>
            <span v-if="lesson.is_free_preview" class="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">Bepul ko'rish</span>
          </div>
          <button class="shrink-0 text-sm font-medium text-red-600 hover:underline" @click="deleteLesson(lesson.id)">O'chirish</button>
        </li>
        <li v-if="!course.lessons?.length" class="px-5 py-6 text-center text-sm text-ink-400">Darslar hali yo'q.</li>
      </ol>

      <form class="space-y-3 rounded-2xl border border-dashed border-ink-200 bg-white p-5 sm:p-6" @submit.prevent="addLesson">
        <h3 class="font-bold text-ink-900">Yangi dars qo'shish</h3>
        <input v-model="lessonForm.title" type="text" placeholder="Dars nomi" required class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <textarea v-model="lessonForm.content" placeholder="Dars matni / tavsifi" rows="3" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <input v-model="lessonForm.video_url" type="url" placeholder="Video havolasi (ixtiyoriy)" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <input v-model.number="lessonForm.duration_minutes" type="number" min="1" placeholder="Davomiyligi (daqiqa)" class="w-full rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2.5 text-sm transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <label class="flex items-center gap-2 text-sm text-ink-700">
          <input v-model="lessonForm.is_free_preview" type="checkbox" class="h-4 w-4 rounded border-ink-300 accent-brand-600" />
          Bepul preview sifatida belgilash (ro'yxatdan o'tmagan foydalanuvchi ham ko'radi)
        </label>
        <p v-if="lessonError" class="text-sm text-red-600">{{ lessonError }}</p>
        <button type="submit" :disabled="addingLesson" class="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-glow disabled:opacity-50 sm:w-auto">
          {{ addingLesson ? 'Qo\'shilmoqda...' : '+ Dars qo\'shish' }}
        </button>
      </form>
    </div>
  </div>
</template>
