// composables/useSafeBlobFetch.ts

import { navigateTo, useNuxtApp } from '#app'

export async function useSafeBlobFetch(url: string, options: RequestInit = {}): Promise<Blob> {
  const { showError } = useNotification()
  const token = localStorage.getItem('authToken')

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (response.status === 401) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')

    showError?.('Session expired. Please sign in again.')
    navigateTo('/login')
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Download failed: ${response.status} ${errorText}`)
  }

  const blob = await response.blob()

  if (!blob || blob.size === 0) {
    throw new Error('Received empty file.')
  }

  return blob
}
