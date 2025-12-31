<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const auth = useAuth()

const token = ref<string | null>(null)
const email = ref<string>('')
const isLoading = ref(false)
const isResending = ref(false)
const isVerified = ref(false)
const error = ref<string | null>(null)
const message = ref<string | null>(null)
const resendSuccess = ref(false)

// Get token and email from query parameters
onMounted(() => {
  const tokenParam = route.query.token as string | undefined
  const emailParam = route.query.email as string | undefined
  
  if (emailParam) {
    email.value = emailParam
  }
  
  if (tokenParam) {
    token.value = tokenParam
    verifyEmail(tokenParam)
  } else {
    // If no token, show resend option
    if (!emailParam) {
      error.value = 'Verification token is missing'
    }
  }
})

const verifyEmail = async (verificationToken: string) => {
  isLoading.value = true
  error.value = null
  message.value = null
  resendSuccess.value = false

  try {
    const response = await auth.verifyEmail(verificationToken)
    isVerified.value = response.verified
    message.value = response.message || 'Email verified successfully!'

    // Update user state if authenticated
    if (auth.user.value) {
      auth.user.value.isEmailVerified = true
    }

    // Redirect to home after 3 seconds if verified
    if (response.verified) {
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  } catch (err: any) {
    error.value = err.message || 'Email verification failed. Please try again or request a new verification link.'
    isVerified.value = false
  } finally {
    isLoading.value = false
  }
}

const resendVerification = async () => {
  if (!email.value) {
    error.value = 'Email address is required to resend verification'
    return
  }

  isResending.value = true
  error.value = null
  resendSuccess.value = false

  try {
    const response = await auth.resendVerificationEmail({ email: email.value })
    resendSuccess.value = true
    message.value = response.message || 'Verification email sent successfully! Please check your inbox.'
  } catch (err: any) {
    error.value = err.message || 'Failed to resend verification email. Please try again.'
  } finally {
    isResending.value = false
  }
}

useSeoMeta({
  title: 'Verify Email - Mokshya OS',
  description: 'Verify your email address to complete your account setup',
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F8FCF9CC] px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(9,67,62,0.15)] p-8">
        <!-- Logo/Brand -->
        <div class="text-center mb-6">
          <p
            class="text-[12px] font-bold tracking-[0.18em] text-[#09433e] uppercase"
          >
            Mokshya OS
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#09433e] border-t-transparent mb-4"></div>
          <p class="text-sm text-[#6b7280]">Verifying your email...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isVerified && !error" class="text-center py-8">
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
            Email Verified!
          </h1>
          <p class="text-sm text-[#6b7280] mb-6">
            {{ message || 'Your email has been successfully verified. You can now access all features.' }}
          </p>
          <p class="text-xs text-[#6b7280]">
            Redirecting to home page...
          </p>
        </div>

        <!-- Resend Success State -->
        <div v-else-if="resendSuccess && !isVerified" class="text-center py-8">
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
            Email Sent!
          </h1>
          <p class="text-sm text-[#6b7280] mb-6">
            {{ message || 'Verification email has been sent. Please check your inbox and click the verification link.' }}
          </p>
          <button
            @click="router.push('/')"
            class="w-full h-12 rounded-lg border border-gray-200 bg-white text-base font-semibold text-[#0e1b1a] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Go to Home
          </button>
        </div>

        <!-- Error State -->
        <div v-else-if="error && !isLoading" class="text-center py-8">
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
            Verification Failed
          </h1>
          <p class="text-sm text-[#6b7280] mb-6">
            {{ error }}
          </p>
          
          <!-- Resend Verification Form -->
          <div v-if="!token" class="space-y-4 mb-6">
            <div class="space-y-2 text-left">
              <label
                for="resend-email"
                class="text-sm font-semibold text-[#0e1b1a] block"
              >
                Email Address
              </label>
              <input
                id="resend-email"
                v-model="email"
                type="email"
                required
                placeholder="you@company.com"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
              >
            </div>
            <button
              @click="resendVerification"
              :disabled="isResending"
              class="w-full h-12 rounded-lg bg-[#09433e] text-white text-base font-bold shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#07332f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isResending ? 'Sending...' : 'Resend Verification Email' }}
            </button>
          </div>

          <button
            @click="router.push('/')"
            class="w-full h-12 rounded-lg border border-gray-200 bg-white text-base font-semibold text-[#0e1b1a] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


