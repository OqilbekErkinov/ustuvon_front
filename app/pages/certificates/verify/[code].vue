<script setup lang="ts">
import type { Certificate } from '~/types'

const route = useRoute()
const code = route.params.code as string

const { data: certificate, error } = await useAsyncData(`cert-verify-${code}`, () =>
  apiFetch<Certificate>(`/courses/certificates/verify/${code}/`)
)
</script>

<template>
  <div class="bg-hero-mesh">
    <div class="container-page flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <template v-if="error">
        <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">✕</span>
        <h1 class="text-xl font-extrabold text-ink-900">Sertifikat topilmadi</h1>
        <p class="mt-2 text-sm text-ink-500">Ushbu kod bo'yicha haqiqiy sertifikat mavjud emas.</p>
      </template>
      <template v-else-if="certificate">
        <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✓</span>
        <h1 class="text-xl font-extrabold text-ink-900">Sertifikat tasdiqlandi</h1>
        <p class="mt-2 text-sm text-ink-500">Bu haqiqiy, EduPlatform tomonidan berilgan sertifikat.</p>

        <div class="mt-8 w-full rounded-2xl border border-ink-100 bg-white p-5 text-left shadow-card sm:p-6">
          <dl class="space-y-3 text-sm">
            <div class="flex items-start justify-between gap-3 border-b border-ink-100 pb-3">
              <dt class="shrink-0 text-ink-400">Talaba</dt>
              <dd class="text-right font-semibold text-ink-900">{{ certificate.student_name }}</dd>
            </div>
            <div class="flex items-start justify-between gap-3 border-b border-ink-100 pb-3">
              <dt class="shrink-0 text-ink-400">Kurs</dt>
              <dd class="text-right font-semibold text-ink-900">{{ certificate.course_title }}</dd>
            </div>
            <div class="flex items-start justify-between gap-3 border-b border-ink-100 pb-3">
              <dt class="shrink-0 text-ink-400">Berilgan sana</dt>
              <dd class="text-right font-semibold text-ink-900">{{ new Date(certificate.issued_at).toLocaleDateString('uz-UZ') }}</dd>
            </div>
            <div class="flex items-start justify-between gap-3">
              <dt class="shrink-0 text-ink-400">Sertifikat ID</dt>
              <dd class="break-all text-right font-mono text-xs text-ink-500">{{ certificate.code }}</dd>
            </div>
          </dl>
          <a :href="certificate.pdf_file" target="_blank" class="mt-5 block w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:shadow-glow">
            PDF'ni ko'rish
          </a>
        </div>
      </template>
    </div>
  </div>
</template>
