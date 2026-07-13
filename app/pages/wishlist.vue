<script setup lang="ts">
import type { Paginated, Wishlist } from '~/types'

definePageMeta({ middleware: 'auth' })

const { data, refresh } = await useAsyncData('my-wishlist', () =>
  apiFetch<Paginated<Wishlist>>('/courses/my-wishlist/')
)

const items = computed(() => data.value?.results ?? [])
</script>

<template>
  <div class="container-page max-w-5xl py-8 sm:py-10">
    <h1 class="mb-1 text-2xl font-extrabold text-ink-900 sm:text-3xl">Saqlangan kurslar</h1>
    <p class="mb-8 text-sm text-ink-400">Keyinroq ko'rish uchun belgilab qo'ygan kurslaringiz.</p>

    <div v-if="!items.length" class="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center text-ink-400">
      Hali hech narsa saqlamagansiz.
      <NuxtLink to="/courses" class="mt-2 block font-semibold text-brand-600 hover:underline">Kurslarni ko'rish</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      <CourseCard
        v-for="item in items" :key="item.id" :course="item.course"
        @wishlist-toggled="(wishlisted) => !wishlisted && refresh()"
      />
    </div>
  </div>
</template>
