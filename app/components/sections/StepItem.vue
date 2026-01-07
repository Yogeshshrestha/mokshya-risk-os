<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string
  duration: string
  index: number
}

defineProps<Props>()
</script>

<template>
  <div class="relative pl-16 sm:pl-20 md:pl-24">
    <div class="absolute left-0 top-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-mokshya-dark border border-mokshya-dark flex items-center justify-center z-10">
      <UIcon :name="icon" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" :aria-label="title" />
    </div>
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
      <h3 class="text-xl sm:text-2xl font-bold text-mokshya-text">
        {{ title }}
      </h3>
      <span class="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
        {{ duration }}
      </span>
    </div>
    <p class="text-mokshya-gray text-base sm:text-lg">
      {{ description }}
    </p>
  </div>
</template>

