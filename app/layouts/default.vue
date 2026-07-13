<template>
  <div class="flex min-h-screen flex-col bg-white">
    <NavBar />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
