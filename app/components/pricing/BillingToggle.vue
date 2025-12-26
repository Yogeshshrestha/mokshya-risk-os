<script setup lang="ts">
const modelValue = defineModel<'monthly' | 'annual'>({ default: 'annual' })

const toggleBilling = () => {
  modelValue.value = modelValue.value === 'monthly' ? 'annual' : 'monthly'
}
</script>

<template>
  <div class="inline-flex items-center bg-gray-100 rounded-full p-1">
    <button
      :class="[
        'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer',
        modelValue === 'monthly'
          ? 'bg-mokshya-dark text-white shadow-sm'
          : 'text-mokshya-gray hover:text-mokshya-dark'
      ]"
      @click="modelValue = 'monthly'"
    >
      Monthly
    </button>
    <button
      :class="[
        'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer',
        modelValue === 'annual'
          ? 'bg-mokshya-dark text-white shadow-sm'
          : 'text-mokshya-gray hover:text-mokshya-dark'
      ]"
      @click="modelValue = 'annual'"
    >
      Annual (Save 20%)
    </button>
  </div>
</template>

