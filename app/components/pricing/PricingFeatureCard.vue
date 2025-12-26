<script setup lang="ts">
interface Props {
  title: string
  description: string
  description2?: string
  icon: string
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0
})

const isFirst = computed(() => props.index === 0)
</script>

<template>
  <div class="bg-white border-gray-200 px-6 pt-6 pb-12 text-start border-t-1 border-[#E8F3F2]">
    <div :class="['pl-4', !isFirst && 'border-l-1 border-[#E8F3F2]']">
      <div class="w-12 h-12 flex items-center justify-start">
        <UIcon :name="icon" class="w-6 h-6 text-mokshya-green-dark" />
      </div>
      <h3 class="text-lg font-bold text-mokshya-dark mb-2">
        {{ title }}
      </h3>
      <p class="text-sm text-mokshya-gray mb-1">
        {{ description }}
      </p>
      <p v-if="description2" class="text-sm text-mokshya-gray font-semibold">
        {{ description2 }}
      </p>
    </div>
  </div>
</template>

