<script setup lang="ts">
const router = useRouter()
const auth = useAuth()
const route = useRoute()

const email = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const isVerified = ref(false)
const error = ref<string | null>(null)
const message = ref<string | null>(null)
const resendSuccess = ref(false)
const token = ref<string | null>(null)

// Get token and email from query parameters (if coming from email link)
onMounted(() => {
  const tokenParam = route.query.token as string | undefined
  const emailParam = route.query.email as string | undefined
  
  // If user is logged in, use their email
  if (auth.user.value?.email) {
    email.value = auth.user.value.email
  } else if (emailParam) {
    email.value = emailParam
  }
  
  // If token is provided, verify immediately
  if (tokenParam) {
    token.value = tokenParam
    verifyEmail(tokenParam)
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

    // Refresh user data to get updated verification status
    if (auth.isAuthenticated.value) {
      await auth.fetchUser()
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
  message.value = null

  try {
    const response = await auth.resendVerificationEmail({ email: email.value })
    resendSuccess.value = true
    message.value = response.message || 'Verification email sent successfully! Please check your inbox and click the verification link.'
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
  <div class="min-h-screen flex items-center justify-center bg-[#F8FCF9CC] px-4 py-12">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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

        <!-- Main Content: Request/Resend Verification -->
        <div v-else class="space-y-6">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-[#0e1b1a] mb-2">
              Verify Your Email
            </h1>
            <p class="text-sm text-[#6b7280]">
              {{ auth.isAuthenticated.value && !auth.user.value?.is_verified
                ? 'Please verify your email address to access all features.'
                : 'Enter your email address to receive a verification link.' }}
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="error"
            class="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600"
          >
            {{ error }}
          </div>

          <!-- Email Input Form -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label
                for="verify-email"
                class="text-sm font-semibold text-[#0e1b1a] block"
              >
                Email Address
              </label>
              <input
                id="verify-email"
                v-model="email"
                type="email"
                required
                :disabled="isResending || (auth.isAuthenticated.value && auth.user.value?.email)"
                placeholder="you@company.com"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
            </div>

            <button
              @click="resendVerification"
              :disabled="isResending || !email"
              class="w-full h-12 rounded-lg bg-[#09433e] text-white text-base font-bold shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#07332f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isResending ? 'Sending...' : 'Send Verification Email' }}
            </button>
          </div>

          <!-- Additional Info -->
          <div class="pt-4 border-t border-gray-200">
            <p class="text-xs text-[#6b7280] text-center">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <!-- Back to Home -->
          <button
            @click="router.push('/')"
            class="w-full h-12 rounded-lg border border-gray-200 bg-white text-base font-semibold text-[#0e1b1a] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

