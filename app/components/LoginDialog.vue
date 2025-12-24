<script setup lang="ts">
const imgPlus = "https://www.figma.com/api/mcp/asset/aec0ea96-7183-4207-9561-d75d5bec7e42";

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const close = () => {
  emit('update:modelValue', false)
}

const submit = (event: Event) => {
  event.preventDefault()
  // Here you can later plug real auth.
  emit('success')
  emit('update:modelValue', false)
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
        class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
        @click="close"
        aria-label="Close login dialog"
      >
        <span class="sr-only">Close</span>
        <img :src="imgPlus" class="w-6 h-6 transform transition-transform duration-300 rotate-45"  />

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
          Log in to your account
        </h2>
        <p
          class="mt-1 text-sm text-[#6b7280] text-center"
        >
          Access your risk intelligence dashboard
        </p>

        <form class="mt-8 space-y-6" @submit="submit">
          <!-- Email -->
          <div class="space-y-2">
            <label
              for="login-email"
              class="text-sm font-semibold text-[#0e1b1a]"
            >
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              placeholder="you@company.com"
              class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
            >
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label
              for="login-password"
              class="text-sm font-semibold text-[#0e1b1a]"
            >
              Password
            </label>
            <div class="relative">
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full h-12 rounded-lg border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-mokshya-dark/70 focus:border-mokshya-dark/70"
              >
              <div
                class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
              >
                <span class="h-5 w-5 rounded-full border border-gray-300" />
              </div>
            </div>
          </div>

          <!-- Remember + forgot -->
          <div class="flex items-center justify-between text-sm mt-2">
            <label class="inline-flex items-center gap-2 text-[#4b5563]">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border border-gray-300 text-mokshya-dark focus:ring-mokshya-dark/70"
              >
              <span class="font-medium">Remember me</span>
            </label>

            <button
              type="button"
              class="font-semibold text-[#09433e] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="mt-4 h-12 w-full rounded-lg bg-[#09433e] text-white text-base font-bold shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#07332f] transition-colors"
          >
            Log In
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
            class="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#0e1b1a] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors"
          >
            <span
              class="h-5 w-5 rounded-full bg-white border border-gray-200"
            />
            <span>Continue with Google</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-auto pt-6 text-center text-sm">
          <span class="text-[#4b5563]">
            Don’t have an account?
          </span>
          <button
            type="button"
            class="ml-1 font-bold text-[#09433e] hover:underline"
          >
            Request access
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


