<script setup lang="ts">
import type { Comment, Course, LessonNote } from '~/types'

const route = useRoute()
const auth = useAuthStore()
const slug = route.params.slug as string

const { data: course, refresh, error } = await useAsyncData(`course-${slug}`, () =>
  apiFetch<Course>(`/courses/${slug}/`)
)

const enrolling = ref(false)
const actionError = ref('')
const curriculumOpen = ref(true)
const openLessonId = ref<number | null>(null)
const togglingLessonId = ref<number | null>(null)

const courseProgress = computed(() => {
  const lessons = course.value?.lessons ?? []
  if (!lessons.length) return 0
  return Math.round((lessons.filter((l) => l.is_completed).length / lessons.length) * 100)
})

const noteDrafts = reactive<Record<number, string>>({})
const noteIds = reactive<Record<number, number | undefined>>({})
const savingNote = ref(false)
const noteSaved = ref(false)
const commentsByLesson = reactive<Record<number, Comment[]>>({})
const newComment = ref('')
const postingComment = ref(false)
const loadingLessonExtras = ref(false)

async function toggleLessonOpen(lesson: { id: number; is_locked: boolean }) {
  if (lesson.is_locked) return
  if (openLessonId.value === lesson.id) {
    openLessonId.value = null
    return
  }
  openLessonId.value = lesson.id
  noteSaved.value = false
  newComment.value = ''
  loadingLessonExtras.value = true
  try {
    const [notesRes, commentsRes] = await Promise.all([
      course.value?.is_enrolled
        ? apiFetch<{ results: LessonNote[] }>('/courses/notes/', { params: { lesson: lesson.id } })
        : Promise.resolve({ results: [] as LessonNote[] }),
      apiFetch<{ results: Comment[] }>('/courses/comments/', { params: { lesson: lesson.id } }),
    ])
    const existing = notesRes.results[0]
    noteDrafts[lesson.id] = existing?.body ?? ''
    noteIds[lesson.id] = existing?.id
    commentsByLesson[lesson.id] = commentsRes.results
  } finally {
    loadingLessonExtras.value = false
  }
}

async function saveNote(lessonId: number) {
  savingNote.value = true
  noteSaved.value = false
  try {
    await apiFetch('/courses/notes/', { method: 'POST', body: { lesson: lessonId, body: noteDrafts[lessonId] } })
    noteSaved.value = true
  } finally {
    savingNote.value = false
  }
}

async function postComment(lessonId: number) {
  if (!newComment.value.trim()) return
  postingComment.value = true
  try {
    const comment = await apiFetch<Comment>('/courses/comments/', {
      method: 'POST',
      body: { lesson: lessonId, body: newComment.value },
    })
    commentsByLesson[lessonId] = [...(commentsByLesson[lessonId] ?? []), comment]
    newComment.value = ''
  } finally {
    postingComment.value = false
  }
}

const openReplyId = ref<number | null>(null)
const replyDrafts = reactive<Record<number, string>>({})
const postingReply = ref(false)

function toggleReply(commentId: number) {
  openReplyId.value = openReplyId.value === commentId ? null : commentId
}

async function postReply(lessonId: number, parentId: number) {
  const body = replyDrafts[parentId]?.trim()
  if (!body) return
  postingReply.value = true
  try {
    const reply = await apiFetch<Comment>('/courses/comments/', {
      method: 'POST',
      body: { lesson: lessonId, parent: parentId, body },
    })
    commentsByLesson[lessonId] = commentsByLesson[lessonId].map((c) =>
      c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c
    )
    replyDrafts[parentId] = ''
    openReplyId.value = null
  } finally {
    postingReply.value = false
  }
}

async function toggleLessonComplete(lesson: { id: number; is_completed: boolean }) {
  togglingLessonId.value = lesson.id
  try {
    await apiFetch(`/courses/lessons/${lesson.id}/${lesson.is_completed ? 'uncomplete' : 'complete'}/`, {
      method: 'POST',
    })
    await refresh()
  } finally {
    togglingLessonId.value = null
  }
}

const coverUrl = computed(() => (course.value ? getCourseCoverUrl(course.value) : ''))

const isOwner = computed(() => auth.user && course.value && course.value.instructor.id === auth.user.id)

const myReview = computed(() =>
  course.value?.reviews?.find((r) => r.student.id === auth.user?.id)
)

async function toggleEnroll() {
  if (!auth.isAuthenticated) return navigateTo('/login')
  actionError.value = ''
  enrolling.value = true
  try {
    if (course.value?.is_enrolled) {
      await apiFetch(`/courses/${slug}/unenroll/`, { method: 'POST' })
    } else {
      await apiFetch(`/courses/${slug}/enroll/`, { method: 'POST' })
    }
    await refresh()
  } catch (err: any) {
    actionError.value = err?.data?.detail || 'Amalni bajarib bo\'lmadi.'
  } finally {
    enrolling.value = false
  }
}

const wishlisting = ref(false)

async function toggleWishlist() {
  if (!auth.isAuthenticated) return navigateTo('/login')
  wishlisting.value = true
  try {
    await apiFetch(`/courses/${slug}/wishlist/`, { method: course.value?.is_wishlisted ? 'DELETE' : 'POST' })
    await refresh()
  } finally {
    wishlisting.value = false
  }
}

const reviewRating = ref(5)
const hoverRating = ref(0)
const reviewComment = ref('')
const submittingReview = ref(false)
const reviewError = ref('')

async function submitReview() {
  if (!course.value) return
  submittingReview.value = true
  reviewError.value = ''
  try {
    await apiFetch('/courses/reviews/', {
      method: 'POST',
      body: { course: course.value.id, rating: reviewRating.value, comment: reviewComment.value },
    })
    reviewComment.value = ''
    await refresh()
  } catch (err: any) {
    reviewError.value = err?.data?.detail || 'Sharh yuborishda xatolik yuz berdi.'
  } finally {
    submittingReview.value = false
  }
}
</script>

<template>
  <div v-if="error" class="mx-auto max-w-3xl px-4 py-24 text-center">
    <p class="text-lg text-ink-400">Kurs topilmadi.</p>
    <NuxtLink to="/courses" class="mt-4 inline-block font-semibold text-brand-600 hover:underline">Kurslarga qaytish</NuxtLink>
  </div>

  <div v-else-if="course">
    <section class="border-b border-ink-100 bg-hero-mesh">
      <div class="container-page grid grid-cols-1 gap-10 py-8 pb-20 sm:py-10 sm:pb-24 lg:grid-cols-3 lg:pb-32">
        <div class="lg:col-span-2">
          <nav class="mb-4 flex items-center gap-1.5 text-xs text-ink-400">
            <NuxtLink to="/courses" class="hover:text-brand-600">Kurslar</NuxtLink>
            <span>/</span>
            <span v-if="course.category">{{ course.category.name }}</span>
          </nav>

          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span v-if="course.is_bestseller" class="rounded bg-gold-400/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-900">
              Bestseller
            </span>
            <span class="rounded-full border border-ink-100 bg-white px-3 py-1 text-xs font-medium text-ink-600">
              {{ levelLabels[course.level] }}
            </span>
          </div>

          <h1 class="text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl">{{ course.title }}</h1>
          <p v-if="course.subtitle" class="mt-3 text-lg text-ink-500">{{ course.subtitle }}</p>

          <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div v-if="course.reviews_count > 0" class="flex items-center gap-1.5">
              <span class="font-bold text-gold-600">{{ course.average_rating.toFixed(1) }}</span>
              <StarRating :rating="course.average_rating" :show-value="false" size="sm" />
              <span class="text-ink-400">({{ formatNumber(course.reviews_count) }} baho)</span>
            </div>
            <span class="text-ink-400">{{ formatNumber(course.students_count) }} talaba</span>
          </div>
          <NuxtLink :to="`/u/${course.instructor.username}`" class="mt-2 inline-block text-sm text-ink-500 hover:text-brand-600">
            Muallif: <span class="font-semibold text-ink-700">{{ course.instructor.first_name || course.instructor.username }} {{ course.instructor.last_name }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <div class="container-page -mt-14 pb-16 sm:-mt-16 sm:pb-20 lg:-mt-24">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div class="order-2 space-y-6 sm:space-y-8 lg:order-1 lg:col-span-2 lg:space-y-10">
          <div v-if="course.what_you_will_learn_list?.length" class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <h2 class="mb-4 text-xl font-bold text-ink-900">Nimalarni o'rganasiz</h2>
            <div class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div v-for="(item, i) in course.what_you_will_learn_list" :key="i" class="flex items-start gap-2.5">
                <svg class="mt-0.5 h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path d="M4 10.5l3.5 3.5L16 6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="text-sm text-ink-700">{{ item }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-ink-100 bg-white shadow-card">
            <button class="flex w-full items-center justify-between p-6 text-left" @click="curriculumOpen = !curriculumOpen">
              <div>
                <h2 class="text-xl font-bold text-ink-900">Kurs dasturi</h2>
                <p class="mt-1 text-sm text-ink-400">
                  {{ course.lessons_count }} ta dars &middot; {{ formatDuration(course.total_duration_minutes) }}
                  <span v-if="course.is_enrolled"> &middot; {{ courseProgress }}% bajarildi</span>
                </p>
              </div>
              <svg class="h-5 w-5 shrink-0 text-ink-400 transition-transform" :class="{ 'rotate-180': curriculumOpen }" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M5 7.5l5 5 5-5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div v-if="curriculumOpen && course.is_enrolled" class="h-1 bg-ink-100">
              <div class="h-full bg-brand-600 transition-all" :style="{ width: `${courseProgress}%` }" />
            </div>
            <ol v-if="curriculumOpen" class="divide-y divide-ink-100 border-t border-ink-100">
              <li v-for="(lesson, i) in course.lessons" :key="lesson.id">
                <button
                  class="flex w-full items-center justify-between px-6 py-3.5 text-left"
                  :class="lesson.is_locked ? 'cursor-not-allowed opacity-60' : 'hover:bg-paper-100'"
                  @click="toggleLessonOpen(lesson)"
                >
                  <div class="flex items-center gap-3">
                    <svg v-if="lesson.is_locked" class="h-4 w-4 shrink-0 text-ink-300" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 8V6a5 5 0 0110 0v2h1a1 1 0 011 1v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1h1zm2 0h6V6a3 3 0 00-6 0v2z" />
                    </svg>
                    <svg v-else-if="lesson.is_completed" class="h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-10.3a1 1 0 00-1.4-1.4L9 9.6 7.7 8.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="h-4 w-4 shrink-0 text-ink-300" viewBox="0 0 20 20" fill="currentColor"><path d="M6 4l10 6-10 6V4z" /></svg>
                    <span class="text-sm text-ink-700">{{ i + 1 }}. {{ lesson.title }}</span>
                    <span v-if="lesson.is_free_preview" class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">Bepul ko'rish</span>
                  </div>
                  <span class="shrink-0 text-xs text-ink-400">{{ lesson.duration_minutes }} daq</span>
                </button>

                <div v-if="openLessonId === lesson.id && !lesson.is_locked" class="space-y-5 bg-paper-100/70 px-6 py-5">
                  <div v-if="getYoutubeEmbedUrl(lesson.video_url)" class="aspect-video overflow-hidden rounded-lg">
                    <iframe
                      :src="getYoutubeEmbedUrl(lesson.video_url)!"
                      class="h-full w-full" frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    />
                  </div>
                  <a v-else-if="lesson.video_url" :href="lesson.video_url" target="_blank" class="inline-block text-sm font-semibold text-brand-600 hover:underline">
                    Video havolasini ochish →
                  </a>
                  <p v-if="lesson.content" class="whitespace-pre-line text-sm leading-relaxed text-ink-600">{{ lesson.content }}</p>
                  <button
                    v-if="course.is_enrolled"
                    :disabled="togglingLessonId === lesson.id"
                    type="button"
                    class="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    :class="lesson.is_completed ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-900 text-white hover:bg-brand-700'"
                    @click="toggleLessonComplete(lesson)"
                  >
                    {{ lesson.is_completed ? '✓ Bajarildi' : 'Tugatdim deb belgilash' }}
                  </button>

                  <div v-if="course.is_enrolled" class="border-t border-ink-200 pt-4">
                    <p class="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Mening eslatmam (faqat sizga ko'rinadi)</p>
                    <textarea
                      v-model="noteDrafts[lesson.id]"
                      rows="2"
                      placeholder="Shu dars bo'yicha eslatma yozing..."
                      class="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      @blur="saveNote(lesson.id)"
                    />
                    <p v-if="noteSaved" class="mt-1 text-xs font-medium text-emerald-600">Saqlandi</p>
                  </div>

                  <div class="border-t border-ink-200 pt-4">
                    <p class="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">
                      Izohlar ({{ commentsByLesson[lesson.id]?.length ?? 0 }})
                    </p>
                    <div class="mb-3 space-y-4">
                      <div v-for="c in commentsByLesson[lesson.id]" :key="c.id">
                        <div class="flex gap-2.5">
                          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-bold text-ink-600">
                            {{ c.author.username.slice(0, 2).toUpperCase() }}
                          </span>
                          <div class="flex-1">
                            <p class="text-xs font-semibold text-ink-900">{{ c.author.username }}</p>
                            <p class="text-sm text-ink-600">{{ c.body }}</p>
                            <button
                              v-if="auth.isAuthenticated"
                              class="mt-1 text-xs font-semibold text-ink-400 hover:text-brand-600"
                              @click="toggleReply(c.id)"
                            >
                              Javob berish
                            </button>
                          </div>
                        </div>

                        <div v-for="r in c.replies" :key="r.id" class="mt-2.5 ml-9 flex gap-2.5">
                          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold text-ink-600">
                            {{ r.author.username.slice(0, 2).toUpperCase() }}
                          </span>
                          <div>
                            <p class="text-xs font-semibold text-ink-900">{{ r.author.username }}</p>
                            <p class="text-sm text-ink-600">{{ r.body }}</p>
                          </div>
                        </div>

                        <form
                          v-if="openReplyId === c.id"
                          class="ml-9 mt-2 flex gap-2"
                          @submit.prevent="postReply(lesson.id, c.id)"
                        >
                          <input
                            v-model="replyDrafts[c.id]" type="text" placeholder="Javob yozing..."
                            class="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                          />
                          <button :disabled="postingReply" type="submit" class="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-200 disabled:opacity-50">
                            Yuborish
                          </button>
                        </form>
                      </div>
                    </div>
                    <form v-if="auth.isAuthenticated" class="flex gap-2" @submit.prevent="postComment(lesson.id)">
                      <input
                        v-model="newComment" type="text" placeholder="Izoh yozing..."
                        class="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      />
                      <button :disabled="postingComment" type="submit" class="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                        Yuborish
                      </button>
                    </form>
                  </div>
                </div>

                <div v-if="openLessonId === lesson.id && lesson.is_locked" class="bg-paper-100/70 px-6 py-4 text-sm text-ink-500">
                  🔒 Ushbu darsni ko'rish uchun kursga yoziling.
                </div>
              </li>
              <li v-if="!course.lessons?.length" class="px-6 py-6 text-center text-sm text-ink-400">Darslar hali qo'shilmagan.</li>
            </ol>
          </div>

          <div v-if="course.requirements_list?.length" class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <h2 class="mb-4 text-xl font-bold text-ink-900">Talab qilinadigan bilimlar</h2>
            <ul class="space-y-2">
              <li v-for="(item, i) in course.requirements_list" :key="i" class="flex items-start gap-2.5 text-sm text-ink-700">
                <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-400" />
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <h2 class="mb-4 text-xl font-bold text-ink-900">Tavsif</h2>
            <p class="whitespace-pre-line text-sm leading-relaxed text-ink-700">{{ course.description }}</p>
          </div>

          <div class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <h2 class="mb-4 text-xl font-bold text-ink-900">O'qituvchi</h2>
            <NuxtLink :to="`/u/${course.instructor.username}`" class="flex items-start gap-4 hover:opacity-90">
              <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
                {{ (course.instructor.first_name || course.instructor.username).charAt(0).toUpperCase() }}
              </span>
              <div>
                <p class="font-bold text-ink-900 hover:text-brand-700">{{ course.instructor.first_name || course.instructor.username }} {{ course.instructor.last_name }}</p>
                <p class="mt-1 text-sm text-ink-500">{{ course.instructor.bio || "Platformadagi o'qituvchi." }}</p>
              </div>
            </NuxtLink>
          </div>

          <div class="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <div class="mb-6 flex items-center gap-4">
              <h2 class="text-xl font-bold text-ink-900">Sharhlar</h2>
              <div v-if="course.reviews_count > 0" class="flex items-center gap-1.5 text-sm">
                <StarRating :rating="course.average_rating" size="md" />
                <span class="text-ink-400">({{ formatNumber(course.reviews_count) }})</span>
              </div>
            </div>

            <div v-if="course.is_enrolled && !myReview" class="mb-6 rounded-lg border border-dashed border-ink-200 p-4">
              <p class="mb-2 text-sm font-semibold text-ink-800">Sharh qoldiring</p>
              <div class="mb-3 flex items-center gap-1">
                <button
                  v-for="n in 5" :key="n" type="button"
                  class="text-2xl leading-none"
                  :class="(hoverRating || reviewRating) >= n ? 'text-gold-500' : 'text-ink-200'"
                  @mouseenter="hoverRating = n" @mouseleave="hoverRating = 0" @click="reviewRating = n"
                >★</button>
              </div>
              <textarea
                v-model="reviewComment" rows="3" placeholder="Kurs haqida fikringiz..."
                class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <p v-if="reviewError" class="mt-2 text-sm text-red-600">{{ reviewError }}</p>
              <button
                :disabled="submittingReview" type="button"
                class="mt-3 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                @click="submitReview"
              >
                {{ submittingReview ? 'Yuborilmoqda...' : 'Sharhni yuborish' }}
              </button>
            </div>

            <div v-if="course.reviews?.length" class="space-y-5">
              <div v-for="r in course.reviews" :key="r.id" class="flex gap-3">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-100 text-sm font-bold text-ink-600">
                  {{ r.student.username.slice(0, 2).toUpperCase() }}
                </span>
                <div>
                  <p class="text-sm font-semibold text-ink-900">{{ r.student.username }}</p>
                  <StarRating :rating="r.rating" :show-value="false" size="sm" class="mt-0.5" />
                  <p v-if="r.comment" class="mt-1.5 text-sm text-ink-600">{{ r.comment }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-ink-400">Hali sharhlar yo'q. Birinchi bo'lib fikr bildiring!</p>
          </div>
        </div>

        <div class="order-1 lg:order-2">
          <div class="lg:sticky lg:top-20 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card-hover">
            <div class="relative aspect-video bg-paper-100">
              <img :src="coverUrl" :alt="course.title" class="h-full w-full object-cover" />
              <span class="absolute inset-0 flex items-center justify-center bg-black/10">
                <span class="flex h-14 w-14 items-center justify-center rounded-full bg-white/90">
                  <svg class="ml-1 h-6 w-6 text-ink-900" viewBox="0 0 20 20" fill="currentColor"><path d="M6 4l10 6-10 6V4z" /></svg>
                </span>
              </span>
            </div>

            <div class="p-6">
              <div class="mb-4 flex items-center justify-between gap-2">
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-extrabold text-ink-900">{{ formatPrice(course.price) }}</span>
                  <span v-if="course.original_price" class="text-base text-ink-300 line-through">{{ formatPrice(course.original_price) }}</span>
                  <span v-if="course.discount_percent > 0" class="text-sm font-bold text-brand-600">-{{ course.discount_percent }}%</span>
                </div>
                <button
                  v-if="!isOwner"
                  :disabled="wishlisting"
                  class="shrink-0 rounded-full border border-ink-200 p-2 text-ink-400 hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                  :class="{ 'border-red-300 text-red-500': course.is_wishlisted }"
                  aria-label="Wishlist"
                  @click="toggleWishlist"
                >
                  <svg class="h-4 w-4" viewBox="0 0 20 20" :fill="course.is_wishlisted ? 'currentColor' : 'none'" stroke="currentColor">
                    <path d="M10 17.5s-6.5-4-6.5-8.6A3.9 3.9 0 0110 6.1a3.9 3.9 0 016.5 2.8c0 4.6-6.5 8.6-6.5 8.6z" stroke-width="1.6" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>

              <NuxtLink
                v-if="isOwner"
                :to="`/courses/${course.slug}/edit`"
                class="block w-full rounded-lg bg-ink-900 py-3 text-center font-bold text-white hover:bg-ink-800"
              >
                Kursni boshqarish
              </NuxtLink>
              <button
                v-else
                :disabled="enrolling"
                class="w-full rounded-lg py-3 font-bold text-white transition disabled:opacity-50"
                :class="course.is_enrolled ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'"
                @click="toggleEnroll"
              >
                {{ enrolling ? 'Bajarilmoqda...' : course.is_enrolled ? 'Yozilishni bekor qilish' : 'Kursga yozilish' }}
              </button>
              <p v-if="actionError" class="mt-2 text-sm text-red-600">{{ actionError }}</p>
              <p v-if="course.is_enrolled" class="mt-3 text-center text-sm font-medium text-emerald-600">✓ Siz ushbu kursga yozilgansiz</p>

              <div class="mt-6 space-y-3 border-t border-ink-100 pt-5 text-sm text-ink-600">
                <p class="mb-1 font-semibold text-ink-900">Ushbu kursga quyidagilar kiradi:</p>
                <div class="flex items-center gap-2.5">
                  <span>🎬</span> {{ formatDuration(course.total_duration_minutes) }} video
                </div>
                <div class="flex items-center gap-2.5">
                  <span>📄</span> {{ course.lessons_count }} ta dars
                </div>
                <div class="flex items-center gap-2.5">
                  <span>♾️</span> Umrbod kirish huquqi
                </div>
                <div class="flex items-center gap-2.5">
                  <span>✈️</span> Telegram bildirishnomalari
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
