<script setup lang="ts">
import type { Course } from '~/types'

const props = defineProps<{ course: Course }>()
const emit = defineEmits<{ 'wishlist-toggled': [wishlisted: boolean] }>()

const auth = useAuthStore()
const wishlisted = ref(props.course.is_wishlisted)
const toggling = ref(false)

async function toggleWishlist(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  if (!auth.isAuthenticated) return navigateTo('/login')
  toggling.value = true
  try {
    await apiFetch(`/courses/${props.course.slug}/wishlist/`, { method: wishlisted.value ? 'DELETE' : 'POST' })
    wishlisted.value = !wishlisted.value
    emit('wishlist-toggled', wishlisted.value)
  } finally {
    toggling.value = false
  }
}

const coverUrl = computed(() => getCourseCoverUrl(props.course))
</script>

<template>
  <NuxtLink
    :to="`/courses/${course.slug}`"
    class="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
  >
    <div class="relative aspect-video overflow-hidden bg-paper-100">
      <img :src="coverUrl" :alt="course.title" loading="lazy" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      <span
        v-if="course.is_bestseller"
        class="absolute left-2 top-2 rounded-md bg-gold-400 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-900 shadow-sm"
      >
        Bestseller
      </span>
      <span
        v-else-if="course.discount_percent > 0"
        class="absolute left-2 top-2 rounded-md bg-gradient-to-r from-brand-600 to-brand-700 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm"
      >
        -{{ course.discount_percent }}%
      </span>
      <button
        :disabled="toggling"
        class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-card hover:text-red-500 disabled:opacity-50"
        :class="{ 'text-red-500': wishlisted }"
        aria-label="Wishlist"
        @click="toggleWishlist"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" :fill="wishlisted ? 'currentColor' : 'none'" stroke="currentColor">
          <path d="M10 17.5s-6.5-4-6.5-8.6A3.9 3.9 0 0110 6.1a3.9 3.9 0 016.5 2.8c0 4.6-6.5 8.6-6.5 8.6z" stroke-width="1.6" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div class="flex flex-1 flex-col gap-1.5 p-4">
      <h3 class="line-clamp-2 min-h-[2.6em] font-bold leading-snug text-ink-900 group-hover:text-brand-700">
        {{ course.title }}
      </h3>
      <p class="truncate text-xs text-ink-400">{{ course.instructor.first_name || course.instructor.username }}</p>

      <div v-if="course.reviews_count > 0" class="flex items-center">
        <StarRating :rating="course.average_rating" size="sm" />
        <span class="ml-1 text-xs text-ink-400">({{ course.reviews_count }})</span>
      </div>
      <p v-else class="text-xs text-ink-300">Yangi kurs</p>

      <div class="mt-auto flex items-center gap-2 pt-1">
        <span class="text-lg font-extrabold text-ink-900">{{ formatPrice(course.price) }}</span>
        <span v-if="course.original_price" class="text-sm text-ink-300 line-through">
          {{ formatPrice(course.original_price) }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
