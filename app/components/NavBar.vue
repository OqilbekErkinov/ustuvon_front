<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()
const mobileOpen = ref(false)
const userMenuOpen = ref(false)
const search = ref('')

function handleLogout() {
  auth.logout()
  mobileOpen.value = false
  userMenuOpen.value = false
  navigateTo('/')
}

function submitSearch() {
  mobileOpen.value = false
  router.push({ path: '/courses', query: search.value ? { search: search.value } : {} })
}

const initials = computed(() => (auth.user?.username || '?').slice(0, 2).toUpperCase())
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-ink-100/70 bg-white/80 backdrop-blur-md">
    <nav class="container-page flex h-16 items-center gap-3 sm:gap-4">
      <NuxtLink to="/" class="flex shrink-0 items-center gap-2 text-lg font-extrabold text-ink-900">
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-aqua-500 text-sm font-black text-white shadow-glow">E</span>
        <span class="hidden sm:inline">Edu<span class="text-brand-600">Platform</span></span>
      </NuxtLink>

      <NuxtLink to="/courses" class="hidden shrink-0 text-sm font-semibold text-ink-600 hover:text-brand-600 lg:inline">
        Kurslarni ko'rish
      </NuxtLink>

      <form class="mx-2 hidden max-w-lg flex-1 md:flex" @submit.prevent="submitSearch">
        <div class="relative w-full">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <circle cx="9" cy="9" r="6.5" stroke-width="1.6" />
            <path d="M18 18l-4-4" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Nima o'rganmoqchisiz?"
            class="w-full rounded-full border border-ink-100 bg-paper-100 py-2 pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </form>

      <div class="ml-auto hidden items-center gap-2 md:flex">
        <template v-if="auth.isAuthenticated">
          <NuxtLink
            v-if="auth.isInstructor"
            to="/courses/create"
            class="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-brand-50 hover:text-brand-700"
          >
            Kurs yaratish
          </NuxtLink>
          <NuxtLink to="/wishlist" class="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-paper-100 hover:text-brand-600" aria-label="Wishlist">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M10 17.5s-6.5-4-6.5-8.6A3.9 3.9 0 0110 6.1a3.9 3.9 0 016.5 2.8c0 4.6-6.5 8.6-6.5 8.6z" stroke-width="1.6" stroke-linejoin="round" />
            </svg>
          </NuxtLink>

          <div class="relative ml-1">
            <button
              class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-aqua-500 text-xs font-bold text-white shadow-sm transition hover:shadow-glow"
              @click="userMenuOpen = !userMenuOpen"
            >
              {{ initials }}
            </button>
            <div
              v-if="userMenuOpen"
              class="absolute right-0 top-11 w-56 rounded-2xl border border-ink-100 bg-white py-2 shadow-card-hover"
              @click="userMenuOpen = false"
            >
              <div class="border-b border-ink-100 px-4 py-2.5">
                <p class="truncate text-sm font-semibold text-ink-900">{{ auth.user?.username }}</p>
                <p class="truncate text-xs text-ink-400">{{ auth.isInstructor ? "O'qituvchi" : "O'quvchi" }}</p>
              </div>
              <NuxtLink to="/dashboard" class="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700">Dashboard</NuxtLink>
              <NuxtLink v-if="auth.isInstructor" to="/analytics" class="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700">Analitika</NuxtLink>
              <NuxtLink :to="`/u/${auth.user?.username}`" class="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700">Ommaviy profil</NuxtLink>
              <NuxtLink to="/cv-builder" class="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700">CV Builder</NuxtLink>
              <NuxtLink to="/settings" class="block px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700">
                Sozlamalar<span v-if="!auth.isInstructor" class="ml-1.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">Creator bo'ling</span>
              </NuxtLink>
              <button class="block w-full px-4 py-2 text-left text-sm text-ink-700 hover:bg-red-50 hover:text-red-600" @click="handleLogout">Chiqish</button>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-paper-100">
            Kirish
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="whitespace-nowrap rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:shadow-glow"
          >
            Ro'yxatdan o'tish
          </NuxtLink>
        </template>
      </div>

      <button class="ml-auto flex h-10 w-10 items-center justify-center rounded-full hover:bg-paper-100 md:hidden" aria-label="Menu" @click="mobileOpen = !mobileOpen">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </nav>

    <div v-if="mobileOpen" class="space-y-1 border-t border-ink-100 bg-white px-4 pb-4 pt-3 md:hidden">
      <form class="mb-2" @submit.prevent="submitSearch">
        <input
          v-model="search"
          type="search"
          placeholder="Nima o'rganmoqchisiz?"
          class="w-full rounded-full border border-ink-100 bg-paper-100 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none"
        />
      </form>
      <NuxtLink to="/courses" class="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100" @click="mobileOpen = false">Kurslar</NuxtLink>
      <template v-if="auth.isAuthenticated">
        <NuxtLink to="/dashboard" class="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100" @click="mobileOpen = false">Dashboard</NuxtLink>
        <NuxtLink v-if="auth.isInstructor" to="/analytics" class="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100" @click="mobileOpen = false">Analitika</NuxtLink>
        <NuxtLink :to="`/u/${auth.user?.username}`" class="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100" @click="mobileOpen = false">Ommaviy profil</NuxtLink>
        <NuxtLink to="/wishlist" class="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100" @click="mobileOpen = false">Wishlist</NuxtLink>
        <NuxtLink to="/cv-builder" class="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100" @click="mobileOpen = false">CV Builder</NuxtLink>
        <NuxtLink to="/settings" class="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100" @click="mobileOpen = false">Sozlamalar</NuxtLink>
        <NuxtLink v-if="auth.isInstructor" to="/courses/create" class="block rounded-xl px-3 py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-50" @click="mobileOpen = false">+ Kurs qo'shish</NuxtLink>
        <button class="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50" @click="handleLogout">Chiqish ({{ auth.user?.username }})</button>
      </template>
      <template v-else>
        <NuxtLink to="/login" class="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100" @click="mobileOpen = false">Kirish</NuxtLink>
        <NuxtLink to="/register" class="block rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-bold text-brand-700" @click="mobileOpen = false">Ro'yxatdan o'tish</NuxtLink>
      </template>
    </div>
  </header>
</template>
