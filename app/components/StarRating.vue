<script setup lang="ts">
const props = withDefaults(defineProps<{
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}>(), {
  size: 'sm',
  showValue: true,
})

const sizeClass = computed(() => ({
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}[props.size]))

const stars = computed(() => {
  return Array.from({ length: 5 }, (_, i) => {
    const diff = props.rating - i
    if (diff >= 1) return 'full'
    if (diff >= 0.5) return 'half'
    return 'empty'
  })
})
</script>

<template>
  <span class="inline-flex items-center gap-1">
    <span v-if="showValue" class="font-bold text-gold-600">{{ rating.toFixed(1) }}</span>
    <span class="flex items-center gap-0.5">
      <svg
        v-for="(type, i) in stars"
        :key="i"
        :class="sizeClass"
        viewBox="0 0 20 20"
        :fill="type === 'empty' ? 'none' : 'currentColor'"
        class="text-gold-500"
      >
        <defs v-if="type === 'half'">
          <linearGradient :id="`half-${i}`">
            <stop offset="50%" stop-color="currentColor" />
            <stop offset="50%" stop-color="transparent" />
          </linearGradient>
        </defs>
        <path
          :fill="type === 'half' ? `url(#half-${i})` : undefined"
          :stroke="type === 'empty' ? 'currentColor' : 'none'"
          stroke-width="1"
          d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.85l-5.2 2.67.99-5.8-4.21-4.1 5.82-.85z"
        />
      </svg>
    </span>
  </span>
</template>
