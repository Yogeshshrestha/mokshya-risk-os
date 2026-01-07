<script setup lang="ts">
interface Props {
  title: string
  icon: string
  position: { x: number; y: number }
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  scale: 1
})

// Calculate sizes based on scale
const orbSize = computed(() => 119 * props.scale)
const iconSize = computed(() => 32 * props.scale)
</script>

<template>
  <div
    class="absolute animate-orbit-counter"
    :style="{
      width: `${orbSize}px`,
      height: `${orbSize}px`,
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
          :style="{ width: `${iconSize}px`, height: `${iconSize}px` }"
          class="text-white"
          :aria-label="title"
        />
      </div>
      <span
        v-if="title.split(' ').length === 1"
        class="font-bold text-xs sm:text-sm lg:text-base uppercase tracking-[0.3104px] leading-tight lg:leading-[18.624px]"
      >
        {{ title }}
      </span>
      <span
        v-else
        class="font-bold text-[10px] sm:text-xs lg:text-sm uppercase tracking-[0.3104px] text-center leading-tight lg:leading-[15.52px]"
      >
        <div v-for="(word, index) in title.split(' ')" :key="index">
          {{ word }}
        </div>
      </span>
    </div>
  </div>
</template>

