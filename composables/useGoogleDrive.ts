import { ref, computed } from 'vue'
import { useNotification } from '~/composables/useNotification'

export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size: string
  webViewLink: string
  thumbnailLink?: string
  modifiedTime?: string
  googleAccessToken: string
}

export interface CommonExtensionType {
  [key: string]: string
}

export const commonExtensionType: CommonExtensionType = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
  'text/markdown': 'Markdown',
  'image/png': 'Image',
  'image/jpeg': 'Image',
  'image/jpg': 'Image',
}

export const useGoogleDrive = () => {
  const config = useRuntimeConfig()
  const { showError, showSuccess, showWarning } = useNotification()
  
  const googleDriveAccessToken = ref<string>('')
  const isLoading = ref(false)
  const isGoogleApiLoaded = ref(false)
  const isGapiLoaded = ref(false)
  
  let googlePicker: any = null

  // Check if required config exists
  const googleClientId = computed(() => config.public.googleClientId)

  const loadGoogleApi = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isGoogleApiLoaded.value) {
        resolve()
        return
      }

      const gsiScript = document.createElement('script')
      gsiScript.src = 'https://accounts.google.com/gsi/client'
      gsiScript.onload = () => {
        console.log('Google Identity Services (GIS) loaded')
        isGoogleApiLoaded.value = true
        resolve()
      }
      gsiScript.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'))
      }
      document.head.appendChild(gsiScript)
    })
  }

  const loadGapi = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isGapiLoaded.value) {
        resolve()
        return
      }

      if (!window.gapi) {
        const script = document.createElement('script')
        script.src = 'https://apis.google.com/js/api.js'
        script.onload = () => {
          window.gapi.load('client:picker', () => {
            isGapiLoaded.value = true
            resolve()
          })
        }
        script.onerror = () => {
          reject(new Error('Failed to load Google API'))
        }
        document.head.appendChild(script)
      } else {
        window.gapi.load('client:picker', () => {
          isGapiLoaded.value = true
          resolve()
        })
      }
    })
  }

  const signInWithGoogle = async (customCallback?: (files: GoogleDriveFile[]) => Promise<void>): Promise<void> => {
    if (!googleClientId.value) {
      showError('Google Client ID is missing.')
      return
    }

    try {
      await loadGoogleApi()

      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google OAuth2 not available')
      }

      isLoading.value = true

      window.google.accounts.oauth2
        .initTokenClient({
          client_id: googleClientId.value,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          ux_mode: 'popup',
          prompt: 'consent',
          callback: (response: any) => {
            if (response.error) {
              console.error('Authentication error:', response.error)
              showError('Authentication failed. Please try again.')
              isLoading.value = false
              return
            }
            googleDriveAccessToken.value = response.access_token
            createPicker(response.access_token, customCallback)
          },
        })
        .requestAccessToken()
    } catch (error) {
      console.error('Google sign-in error:', error)
      showError('Failed to initialize Google sign-in. Please try again.')
      isLoading.value = false
    }
  }

  const createPicker = async (accessToken: string, customCallback?: (files: GoogleDriveFile[]) => Promise<void>): Promise<void> => {
    try {
      await loadGapi()

      if (!window.google?.picker) {
        throw new Error('Google Picker not available')
      }

      const allowedMimeTypes = Object.keys(commonExtensionType).join(',')

      const view = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes(allowedMimeTypes)
        .setMode(window.google.picker.DocsViewMode.LIST)

      // Create a wrapper callback that handles both the default behavior and custom callback
      const wrapperCallback = async (data: any) => {
        const selectedFiles = await pickerCallback(data)

        // If custom callback is provided and files were selected, call it
        if (customCallback && selectedFiles.length > 0) {
          await customCallback(selectedFiles)
        }

        return selectedFiles
      }

      googlePicker = new window.google.picker.PickerBuilder()
        .setOAuthToken(accessToken)
        .addView(view)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setCallback(wrapperCallback)
        .build()

      googlePicker.setVisible(true)
      isLoading.value = false
    } catch (error) {
      console.error('Picker creation error:', error)
      showError('Failed to create file picker. Please try again.')
      isLoading.value = false
    }
  }

  const pickerCallback = async (data: any): Promise<GoogleDriveFile[]> => {
    if (
      data &&
      data.action === window.google.picker.Action.PICKED &&
      data.docs &&
      data.docs.length
    ) {
      const files = data.docs.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.sizeBytes
          ? (Number(file.sizeBytes) / 1024).toFixed(2) + ' KB'
          : 'Unknown',
        webViewLink: file.url,
        thumbnailLink: file.iconUrl,
        modifiedTime: file.lastEditedUtc,
        googleAccessToken: googleDriveAccessToken.value,
      }))

      // Filter out log files and unsupported types
      const filteredFiles = files.filter((file: GoogleDriveFile) => {
        const fileExtension = file.name.toLowerCase().split('.').pop()
        return fileExtension !== 'log' && commonExtensionType[file.mimeType]
      })

      if (filteredFiles.length > 0) {
        showSuccess(`Selected ${filteredFiles.length} file${filteredFiles.length > 1 ? 's' : ''} from Google Drive`)
        if (googlePicker) {
          googlePicker.setVisible(false)
        }
        isLoading.value = false
        return filteredFiles
      } else {
        showWarning('No valid files selected (either .log or unsupported files).')
        isLoading.value = false
        return []
      }
    } else if (data && data.action === window.google.picker.Action.CANCEL) {
      showWarning('File picker cancelled.')
      console.info('Picker closed or cancelled.')
      isLoading.value = false
      return []
    }

    isLoading.value = false
    return []
  }

  const checkFileExistence = (fileName: string, existingFiles: string[] = []): boolean => {
    return existingFiles.includes(fileName)
  }

  const getFileType = (mimeType: string): string => {
    return commonExtensionType[mimeType] || 'Unknown'
  }

  const cleanup = () => {
    if (googlePicker) {
      googlePicker.setVisible(false)
      googlePicker = null
    }
    googleDriveAccessToken.value = ''
    isLoading.value = false
  }

  return {
    // State
    googleDriveAccessToken: readonly(googleDriveAccessToken),
    isLoading: readonly(isLoading),
    isGoogleApiLoaded: readonly(isGoogleApiLoaded),
    isGapiLoaded: readonly(isGapiLoaded),
    
    // Methods
    signInWithGoogle,
    createPicker,
    pickerCallback,
    checkFileExistence,
    getFileType,
    cleanup,
    
    // Utils
    commonExtensionType,
  }
}

// Type declarations for global objects
declare global {
  interface Window {
    gapi: any
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any
        }
      }
      picker: {
        DocsView: any
        PickerBuilder: any
        Action: {
          PICKED: string
          CANCEL: string
        }
        Feature: {
          MULTISELECT_ENABLED: string
        }
        DocsViewMode: {
          LIST: string
        }
      }
    }
  }
}
