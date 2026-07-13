<script setup lang="ts">
import type { Category, Course, Paginated } from '~/types'

const router = useRouter()
const heroSearch = ref('')

const { data } = await useAsyncData('home-courses', () =>
  apiFetch<Paginated<Course>>('/courses/?ordering=-created_at&page_size=50')
)

const { data: categoriesData } = await useAsyncData('home-categories', () =>
  apiFetch<Category[] | Paginated<Category>>('/courses/categories/')
)
const categories = computed(() => {
  const d = categoriesData.value as any
  return Array.isArray(d) ? d : d?.results ?? []
})

const allCourses = computed(() => data.value?.results ?? [])
const bestsellers = computed(() => allCourses.value.filter((c) => c.is_bestseller).slice(0, 4))
const newest = computed(() =>
  [...allCourses.value].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 4)
)

const stats = computed(() => {
  const totalStudents = allCourses.value.reduce((sum, c) => sum + c.students_count, 0)
  const ratings = allCourses.value.filter((c) => c.reviews_count > 0)
  const avgRating = ratings.length
    ? ratings.reduce((sum, c) => sum + c.average_rating, 0) / ratings.length
    : 0
  return {
    courses: allCourses.value.length,
    students: totalStudents,
    instructors: new Set(allCourses.value.map((c) => c.instructor.id)).size,
    rating: avgRating,
  }
})

const categoryIcons: Record<string, string> = {
  Dasturlash: '💻',
  Dizayn: '🎨',
  Marketing: '📈',
}

function submitHeroSearch() {
  router.push({ path: '/courses', query: heroSearch.value ? { search: heroSearch.value } : {} })
}
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-hero-mesh">
      <div class="container-page relative py-10 sm:py-12 lg:py-16">
        <div class="mx-auto max-w-3xl text-center">
          <span class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
            ✨ Yangi avlod ta'lim platformasi
          </span>
          <h1 class="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Kelajagingizni bugun
            <span class="bg-gradient-to-r from-brand-600 via-fuchsia-500 to-aqua-500 bg-clip-text text-transparent">quring</span>
          </h1>
          <p class="mx-auto mt-5 max-w-xl text-base text-ink-500 sm:text-lg">
            Dasturlash, dizayn va marketing bo'yicha amaliy kurslar. Istalgan joyda,
            istalgan vaqtda — Telegram orqali bildirishnomalar bilan.
          </p>

          <form class="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-full border border-ink-100 bg-white p-1.5 shadow-card" @submit.prevent="submitHeroSearch">
            <input
              v-model="heroSearch"
              type="search"
              placeholder="Nima o'rganmoqchisiz? Masalan: Vue, Figma, SMM..."
              class="flex-1 rounded-full bg-transparent px-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none sm:px-5"
            />
            <button type="submit" class="shrink-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-glow sm:px-6">
              Qidirish
            </button>
          </form>

          <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span class="text-xs text-ink-400">Ommabop:</span>
            <NuxtLink
              v-for="c in categories"
              :key="c.id"
              :to="`/courses?category=${c.id}`"
              class="rounded-full border border-ink-100 bg-white px-3 py-1 text-xs font-medium text-ink-600 hover:border-brand-300 hover:text-brand-700"
            >
              {{ c.name }}
            </NuxtLink>
          </div>
        </div>

        <div class="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-4 sm:gap-6">
          <div class="rounded-2xl border border-ink-100 bg-white/70 py-4 text-center backdrop-blur-sm">
            <p class="text-2xl font-extrabold text-ink-900 sm:text-3xl">{{ stats.courses }}+</p>
            <p class="mt-1 text-xs text-ink-400">Kurslar</p>
          </div>
          <div class="rounded-2xl border border-ink-100 bg-white/70 py-4 text-center backdrop-blur-sm">
            <p class="text-2xl font-extrabold text-ink-900 sm:text-3xl">{{ formatNumber(stats.students) }}+</p>
            <p class="mt-1 text-xs text-ink-400">Talabalar</p>
          </div>
          <div class="rounded-2xl border border-ink-100 bg-white/70 py-4 text-center backdrop-blur-sm">
            <p class="text-2xl font-extrabold text-ink-900 sm:text-3xl">{{ stats.instructors }}+</p>
            <p class="mt-1 text-xs text-ink-400">O'qituvchilar</p>
          </div>
          <div class="rounded-2xl border border-ink-100 bg-white/70 py-4 text-center backdrop-blur-sm">
            <p class="flex items-center justify-center gap-1 text-2xl font-extrabold text-ink-900 sm:text-3xl">
              {{ stats.rating.toFixed(1) }} <span class="text-gold-500">★</span>
            </p>
            <p class="mt-1 text-xs text-ink-400">O'rtacha baho</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container-page py-12 sm:py-14">
      <h2 class="mb-6 text-xl font-bold text-ink-900">Kategoriya bo'yicha ko'rish</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NuxtLink
          v-for="c in categories"
          :key="c.id"
          :to="`/courses?category=${c.id}`"
          class="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-aqua-50 text-2xl">
            {{ categoryIcons[c.name] || '📚' }}
          </span>
          <div>
            <p class="font-bold text-ink-900 group-hover:text-brand-700">{{ c.name }}</p>
            <p class="text-xs text-ink-400">Kurslarni ko'rish →</p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section v-if="bestsellers.length" class="border-y border-ink-100 bg-paper-100/70 py-12 sm:py-14">
      <div class="container-page">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-bold text-ink-900">🔥 Eng ko'p sotilgan kurslar</h2>
          <NuxtLink to="/courses" class="text-sm font-semibold text-brand-600 hover:underline">Barchasini ko'rish →</NuxtLink>
        </div>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <CourseCard v-for="course in bestsellers" :key="course.id" :course="course" />
        </div>
      </div>
    </section>

    <section class="container-page py-12 sm:py-14">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-ink-900">Yangi qo'shilgan kurslar</h2>
        <NuxtLink to="/courses" class="text-sm font-semibold text-brand-600 hover:underline">Barchasini ko'rish →</NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <CourseCard v-for="course in newest" :key="course.id" :course="course" />
      </div>
      <p v-if="!newest.length" class="py-10 text-center text-ink-400">Hozircha kurslar mavjud emas.</p>
    </section>

    <section class="border-t border-ink-100 bg-panel-mesh py-14 sm:py-16">
      <div class="container-page flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 class="text-2xl font-extrabold text-ink-900 sm:text-3xl">Bilimingizni ulashishga tayyormisiz?</h2>
          <p class="mt-2 text-ink-500">O'qituvchi sifatida ro'yxatdan o'ting va o'z kursingizni bugun yarating.</p>
        </div>
        <NuxtLink to="/register" class="shrink-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-7 py-3 font-bold text-white shadow-sm transition hover:shadow-glow">
          O'qituvchi bo'lish
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
