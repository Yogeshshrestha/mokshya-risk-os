<script setup lang="ts">
const imgPlus = "https://www.figma.com/api/mcp/asset/aec0ea96-7183-4207-9561-d75d5bec7e42";

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const auth = useAuth()
const isRegisterMode = ref(false)
const isLoading = computed(() => auth.isLoading.value)
const error = computed(() => auth.error.value)
const showVerificationMessage = ref(false)
const registeredEmail = ref('')

// Form data
const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
const rememberMe = ref(false)

const close = () => {
  emit('update:modelValue', false)
  // Reset form
  email.value = ''
  password.value = ''
  firstName.value = ''
  lastName.value = ''
  rememberMe.value = false
  showVerificationMessage.value = false
  registeredEmail.value = ''
  auth.clearError()
}

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  showVerificationMessage.value = false
  registeredEmail.value = ''
  auth.clearError()
}

const handleGoogleLogin = () => {
  auth.loginWithGoogle()
}

const submit = async (event: Event) => {
  event.preventDefault()
  auth.clearError()
  showVerificationMessage.value = false

  try {
    if (isRegisterMode.value) {
      const response = await auth.register({
        email: email.value,
        password: password.value,
        firstName: firstName.value || undefined,
        lastName: lastName.value || undefined,
      })
      
      // Check if email verification is needed
      if (response.user && !response.user.isEmailVerified) {
        registeredEmail.value = email.value
        showVerificationMessage.value = true
        // Don't close dialog yet, show verification message
        return
      }
    } else {
      await auth.login({
        email: email.value,
        password: password.value,
        rememberMe: rememberMe.value,
      })
    }

    emit('success')
    emit('update:modelValue', false)
    
    // Reset form
    email.value = ''
    password.value = ''
    firstName.value = ''
    lastName.value = ''
    rememberMe.value = false
    showVerificationMessage.value = false
    registeredEmail.value = ''
  } catch (err) {
    // Error is handled by auth composable
    console.error('Auth error:', err)
  }
}

const resendVerification = async () => {
  if (!registeredEmail.value) return
  
  try {
    await auth.resendVerificationEmail({ email: registeredEmail.value })
    // Show success message
    error.value = null
  } catch (err) {
    // Error is handled by auth composable
    console.error('Resend verification error:', err)
  }
}

const continueToHome = () => {
  emit('update:modelValue', false)
  showVerificationMessage.value = false
  registeredEmail.value = ''
  // Reset form
  email.value = ''
  password.value = ''
  firstName.value = ''
  lastName.value = ''
  rememberMe.value = false
}
</script>

<template>
  <div
    v-if="props.modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(9,67,62,0.1)] backdrop-blur-[2px]"
  >
    <div
      class="relative w-[460px] h-[668px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(9,67,62,0.15)] overflow-hidden"
    >
      <!-- Close button -->
      <button
        type="button"
        class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
        @click="close"
        aria-label="Close login dialog"
      >
        <span class="sr-only">Close</span>
        <img :src="imgPlus" class="w-6 h-6 transform transition-transform duration-300 rotate-45" alt="plus"  />

      </button>

      <!-- Content -->
      <div class="px-8 pt-14 pb-8 flex flex-col h-full">
        <p
          class="text-[12px] font-bold tracking-[0.18em] text-[#09433e] text-center uppercase"
        >
          Mokshya OS
        </p>
        <h2
          class="mt-2 text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#0e1b1a] text-center"
        >
          {{ isRegisterMode ? 'Create your account' : 'Log in to your account' }}
        </h2>
        <p
          class="mt-1 text-sm text-[#6b7280] text-center"
        >
          {{ isRegisterMode ? 'Get started with Mokshya OS' : 'Access your risk intelligence dashboard' }}
        </p>

        <!-- Error message -->
        <div
          v-if="error && !showVerificationMessage"
          class="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600"
        >
          {{ error }}
        </div>

        <!-- Email Verification Message -->
        <div
          v-if="showVerificationMessage"
          class="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <svg
                class="w-5 h-5 text-blue-600 mt-0.5"
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
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-blue-900 mb-1">
                Verification Email Sent
              </h3>
              <p class="text-sm text-blue-700 mb-3">
                We've sent a verification email to <strong>{{ registeredEmail }}</strong>. 
                Please check your inbox and click the verification link to activate your account.
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="resendVerification"
                  :disabled="isLoading"
                  class="text-sm font-semibold text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                >
                  Resend Email
                </button>
                <span class="text-blue-400">|</span>
                <button
                  type="button"
                  @click="continueToHome"
                  class="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
                >
                  Continue to Home
                </button>
              </div>
            </div>
          </div>
        </div>

        <form v-if="!showVerificationMessage" class="mt-8 space-y-6" @submit="submit">
          <!-- First Name & Last Name (Register only) -->
          <div v-if="isRegisterMode" class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label
                for="register-firstname"
                class="text-sm font-semibold text-[#0e1b1a]"
              >
                First Name
              </label>
              <input
                id="register-firstname"
                v-model="firstName"
                type="text"
                placeholder="John"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
              >
            </div>
            <div class="space-y-2">
              <label
                for="register-lastname"
                class="text-sm font-semibold text-[#0e1b1a]"
              >
                Last Name
              </label>
              <input
                id="register-lastname"
                v-model="lastName"
                type="text"
                placeholder="Doe"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
              >
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label
              :for="isRegisterMode ? 'register-email' : 'login-email'"
              class="text-sm font-semibold text-[#0e1b1a]"
            >
              Work Email
            </label>
            <input
              :id="isRegisterMode ? 'register-email' : 'login-email'"
              v-model="email"
              type="email"
              required
              placeholder="you@company.com"
              class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
            >
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label
              :for="isRegisterMode ? 'register-password' : 'login-password'"
              class="text-sm font-semibold text-[#0e1b1a]"
            >
              Password
            </label>
            <div class="relative">
              <input
                :id="isRegisterMode ? 'register-password' : 'login-password'"
                v-model="password"
                type="password"
                required
                :placeholder="isRegisterMode ? 'Create a strong password' : '••••••••'"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
              >
              <div
                class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
              >
                <span class="h-5 w-5 rounded-full border border-gray-300" />
              </div>
            </div>
          </div>

          <!-- Remember + forgot (Login only) -->
          <div v-if="!isRegisterMode" class="flex items-center justify-between text-sm mt-2">
            <label class="inline-flex items-center gap-2 text-[#4b5563]">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border border-gray-300 text-mokshya-dark focus:ring-mokshya-dark/70"
              >
              <span class="font-medium">Remember me</span>
            </label>

            <button
              type="button"
              class="font-semibold text-[#09433e] hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="mt-4 h-12 w-full rounded-lg bg-[#09433e] text-white text-base font-bold shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#07332f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Please wait...' : (isRegisterMode ? 'Create Account' : 'Log In') }}
          </button>

          <!-- Divider -->
          <div class="relative mt-6">
            <div class="h-px w-full bg-gray-200" />
            <div
              class="absolute inset-0 flex items-center justify-center"
            >
              <span class="bg-white px-2 text-sm text-[#6b7280]">
                or continue with
              </span>
            </div>
          </div>

          <!-- Google button -->
          <button
            type="button"
            @click="handleGoogleLogin"
            class="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#0e1b1a] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span
              class="h-5 w-5 rounded-full bg-white border border-gray-200"
            />
            <span>Continue with Google</span>
          </button>
        </form>

        <!-- Footer -->
        <div v-if="!showVerificationMessage" class="mt-auto pt-6 text-center text-sm">
          <span class="text-[#4b5563]">
            {{ isRegisterMode ? 'Already have an account?' : "Don't have an account?" }}
          </span>
          <button
            type="button"
            @click="toggleMode"
            class="ml-1 font-bold text-[#09433e] hover:underline cursor-pointer"
          >
            {{ isRegisterMode ? 'Log in' : 'Sign up' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



