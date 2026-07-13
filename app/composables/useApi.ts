export async function apiFetch<T>(url: string, opts: any = {}): Promise<T> {
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  const doFetch = () =>
    $fetch<T>(url, {
      baseURL: config.public.apiBase,
      ...opts,
      headers: {
        ...(opts.headers || {}),
        ...(auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
      },
    })

  try {
    return await doFetch()
  } catch (err: any) {
    if (err?.response?.status === 401 && auth.refreshToken) {
      const refreshed = await auth.refreshAccessToken()
      if (refreshed) return await doFetch()
    }
    throw err
  }
}
