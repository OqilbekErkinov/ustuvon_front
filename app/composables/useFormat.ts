export function formatPrice(price: string | number) {
  const n = Number(price)
  if (n === 0) return 'Bepul'
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm"
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n)
}

export function formatDuration(totalMinutes: number) {
  if (!totalMinutes) return '0 daqiqa'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} daqiqa`
  if (minutes === 0) return `${hours} soat`
  return `${hours} soat ${minutes} daqiqa`
}

export const levelLabels: Record<string, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: 'Yuqori',
}
