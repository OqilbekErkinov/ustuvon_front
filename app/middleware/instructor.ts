export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
  if (!auth.isInstructor) {
    return navigateTo('/dashboard')
  }
})
