<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const auth = useAuth()
const api = useApi()

const API_BASE_URL = 'https://riskos-stage-api.mokshya.ai/api/v1'

const isLoading = ref(true)
const isSuccess = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // Get query parameters
    const code = route.query.code as string | undefined
    const state = route.query.state as string | undefined
    const errorParam = route.query.error as string | undefined
    const redirectUri = route.query.redirect_uri as string | undefined

    if (errorParam) {
      error.value = 'Google authentication was cancelled or failed'
      isLoading.value = false
      setTimeout(() => {
        router.push('/')
      }, 3000)
      return
    }

    if (!code) {
      error.value = 'Authorization code is missing'
      isLoading.value = false
      setTimeout(() => {
        router.push('/')
      }, 3000)
      return
    }

    if (!state) {
      error.value = 'State parameter is missing'
      isLoading.value = false
      setTimeout(() => {
        router.push('/')
      }, 3000)
      return
    }

    // Verify state matches the one we stored
    const storedState = sessionStorage.getItem('google_oauth_state')
    if (storedState && storedState !== state) {
      error.value = 'Invalid state parameter. Security check failed.'
      sessionStorage.removeItem('google_oauth_state')
      isLoading.value = false
      setTimeout(() => {
        router.push('/')
      }, 3000)
      return
    }

    // Get the redirect_uri that was used in the initial request (must match exactly)
    const storedRedirectUri = sessionStorage.getItem('google_oauth_redirect_uri')
    const callbackUrl = storedRedirectUri || redirectUri || `${window.location.origin}/auth/google/callback`

    // Call the callback endpoint (POST request)
    const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        state: state,
        redirect_uri: callbackUrl,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
        statusCode: response.status,
      }))
      throw errorData
    }

    // Handle OAuth2 token response (snake_case)
    const tokenResponse = await response.json() as { access_token?: string; refresh_token?: string; accessToken?: string; refreshToken?: string; user?: any }
    
    // Clean up stored state and redirect_uri
    sessionStorage.removeItem('google_oauth_state')
    sessionStorage.removeItem('google_oauth_redirect_uri')

    // Set tokens (handle both snake_case and camelCase)
    const accessToken = tokenResponse.access_token || tokenResponse.accessToken
    const refreshToken = tokenResponse.refresh_token || tokenResponse.refreshToken

    if (accessToken && refreshToken) {
      api.setAuthTokens(accessToken, refreshToken)
      
      // Fetch user data (user is readonly, so use fetchUser method)
      await auth.fetchUser()
      
      // Show success message before redirecting
      isLoading.value = false
      isSuccess.value = true
      
      // Redirect to home after showing success message
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      throw { message: 'Tokens not received from server' }
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred during Google authentication'
    isLoading.value = false
    // Clean up stored state and redirect_uri on error
    sessionStorage.removeItem('google_oauth_state')
    sessionStorage.removeItem('google_oauth_redirect_uri')
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
})

useSeoMeta({
  title: 'Google Authentication - Mokshya OS',
  description: 'Completing Google authentication',
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F8FCF9CC] px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(9,67,62,0.15)] p-8 text-center">
        <!-- Logo/Brand -->
        <div class="mb-6">
          <p
            class="text-[12px] font-bold tracking-[0.18em] text-[#09433e] uppercase"
          >
            Mokshya OS
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#09433e] border-t-transparent mb-4"></div>
          <p class="text-sm text-[#6b7280]">Completing Google authentication...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isSuccess" class="py-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg
              class="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-[#0e1b1a] mb-2">
            Successfully Authenticated!
          </h1>
          <p class="text-sm text-[#6b7280] mb-6">
            You have been logged in with Google. Redirecting to home page...
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="py-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              class="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-[#0e1b1a] mb-2">
            Authentication Failed
          </h1>
          <p class="text-sm text-[#6b7280] mb-6">
            {{ error }}
          </p>
          <p class="text-xs text-[#6b7280]">
            Redirecting to home page...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>


