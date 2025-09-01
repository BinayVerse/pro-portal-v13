<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth/index'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const { showNotification } = useNotification()

const props = defineProps<{ authView: string }>()

interface GoogleResponse {
  credential: string
}

const handleGoogleResponse = async (response: GoogleResponse) => {
  const { credential } = response
  if (credential) {
    try {
      // Call your store or API to handle sign-in
      const result = await authStore.googleSignIn({ googleToken: credential })

      if (result.status === 'success') {
        showNotification(result.message || 'Sign-in successful!', 'success')
        // Use store redirect logic to respect route.query.redirect
        await authStore.handlePostLoginRedirect()
      } else {
        showNotification(result.message || 'Sign-in failed.', 'error')
      }
    } catch (err) {
      // Error already handled in store
      console.error('Error handling Google sign-in:', err)
    }
  }
}

const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => resolve(true)
    script.onerror = () => reject('Google API script failed to load.')
    document.body.appendChild(script)
  })
}

// Get the Google client ID from runtime configuration
const googleClientId = config.public.googleClientId

const initGoogleSignIn = async () => {
  try {
    await loadGoogleScript()

    if ((window as any).google) {
      const google = (window as any).google
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true,
      })
    } else {
      console.error('Google API not loaded')
    }
  } catch (error) {
    console.error('Error initializing Google Sign-In:', error)
    showNotification('Failed to initialize Google Sign-In. Please try again.', 'error')
  }
}

const handleCustomGoogleSignIn = () => {
  showNotification(
    `Google ${props.authView === 'signin' ? 'Sign-In' : 'Sign-Up'} is not ready. Please refresh the page and try again.`,
    'error',
  )
  return
  if (!(window as any).google) {
    console.error('Google API not ready yet.')
    showNotification(
      `Google ${props.authView === 'signin' ? 'Sign-In' : 'Sign-Up'} is not ready. Please refresh the page and try again.`,
      'error',
    )
    return
  }

  try {
    // Direct approach: use prompt to show Google sign-in
    ;(window as any).google.accounts.id.prompt()
  } catch (error) {
    console.error('Error with Google Sign-In prompt:', error)

    // Fallback: Create a temporary button and trigger it
    try {
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.top = '-9999px'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)
      ;(window as any).google.accounts.id.renderButton(tempDiv, {
        theme: 'outline',
        size: 'large',
        click_listener: () => {
          // This will be called when the button is clicked
        },
      })

      // Programmatically click the Google button
      const googleBtn = tempDiv.querySelector('[role="button"]') as HTMLElement
      if (googleBtn) {
        googleBtn.click()
      }

      // Clean up
      setTimeout(() => {
        document.body.removeChild(tempDiv)
      }, 100)
    } catch (fallbackError) {
      console.error('Fallback Google Sign-In failed:', fallbackError)
      showNotification(
        'Google Sign-In failed. Please ensure popups are allowed and try again.',
        'error',
      )
    }
  }
}

// Alternative method using a container for Google button
const googleButtonContainer = ref<HTMLElement>()

const renderGoogleButton = () => {
  if ((window as any).google && googleButtonContainer.value) {
    ;(window as any).google.accounts.id.renderButton(googleButtonContainer.value, {
      theme: 'outline',
      size: 'large',
      width: 250,
      type: 'standard',
      shape: 'rectangular',
      logo_alignment: 'left',
    })
  }
}

onMounted(async () => {
  await initGoogleSignIn()
  // Small delay to ensure DOM is ready
  setTimeout(renderGoogleButton, 100)
})
</script>

<template>
  <div class="flex flex-col space-y-3">
    <!-- Official Google Sign-In Button -->
    <a
      href="#"
      class="flex justify-center ma-4 text-white rounded-full border-gray-500 bg-gray-100"
      @click.prevent="handleCustomGoogleSignIn"
    >
      <div class="px-4 py-3">
        <svg class="h-6 w-6" viewBox="0 0 40 40">
          <path
            d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
            fill="#FFC107"
          />
          <path
            d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
            fill="#FF3D00"
          />
          <path
            d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
            fill="#4CAF50"
          />
          <path
            d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
            fill="#1976D2"
          />
        </svg>
      </div>
      <h1 class="px-4 py-3 text-gray-600 font-bold">
        {{ props.authView === 'signin' ? 'Sign In With Google' : 'Sign Up With Google' }}
      </h1>
    </a>
  </div>
</template>
