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
  <div class="relative pl-24">
    <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-mokshya-dark border border-mokshya-dark flex items-center justify-center z-10">
      <UIcon :name="icon" class="w-8 h-8 text-white" :aria-label="title" />
    </div>
    <div class="flex items-center gap-4 mb-2">
      <h3 class="text-2xl font-bold text-mokshya-text">
        {{ title }}
      </h3>
      <span class="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        {{ duration }}
      </span>
    </div>
    <p class="text-mokshya-gray text-lg">
      {{ description }}
    </p>
  </div>
</template>

