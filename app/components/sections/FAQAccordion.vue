<script setup lang="ts">
import { IMAGES } from '~/constants/images'

interface Props {
  question: string
  answer: string
  isActive: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300"
    :class="{ 'ring-2 ring-mokshya-green/20': isActive }"
  >
    <button
      class="w-full flex items-center justify-between p-6 text-left font-bold text-xl text-mokshya-text hover:bg-gray-50 transition-colors cursor-pointer"
      @click="emit('toggle')"
    >
      <span>{{ question }}</span>
      <img
        :src="IMAGES.plusIcon"
        class="w-6 h-6 transform transition-transform duration-300"
        :class="{ 'rotate-45': isActive }"
      />
    </button>
    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :style="{ maxHeight: isActive ? '200px' : '0' }"
    >
      <div class="p-6 pt-0 text-mokshya-gray leading-relaxed">
        {{ answer }}
      </div>
    </div>
  </div>
</template>


