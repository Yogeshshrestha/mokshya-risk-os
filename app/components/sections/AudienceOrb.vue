<script setup lang="ts">
interface Props {
  title: string
  icon: string
  position: { x: number; y: number }
}

defineProps<Props>()
</script>

<template>
  <div
    class="absolute w-[119px] h-[119px] animate-orbit-counter"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: 'translate(-50%, -50%)',
      transformOrigin: 'center center',
      willChange: 'transform',
      backfaceVisibility: 'hidden'
    }"
  >
    <div class="w-full h-full bg-mokshya-dark rounded-full shadow-lg flex flex-col items-center justify-center text-white hover:scale-110 transition-transform duration-300 cursor-default">
      <div class="flex items-center justify-center mb-1.5">
        <UIcon
          :name="icon"
          class="w-[32px] h-[32px] text-white"
          :aria-label="title"
        />
      </div>
      <span
        v-if="title.split(' ').length === 1"
        class="font-bold text-base uppercase tracking-[0.3104px] leading-[18.624px]"
      >
        {{ title }}
      </span>
      <span
        v-else
        class="font-bold text-sm uppercase tracking-[0.3104px] text-center leading-[15.52px]"
      >
        <div v-for="(word, index) in title.split(' ')" :key="index">
          {{ word }}
        </div>
      </span>
    </div>
  </div>
</template>

