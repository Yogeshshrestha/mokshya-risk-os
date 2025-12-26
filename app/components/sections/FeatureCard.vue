<script setup lang="ts">
interface Props {
  title: string
  description: string
  image: string
  badge: string
}

defineProps<Props>()
</script>

<template>
  <!-- Feature Card - Design accurate to Figma -->
  <div class="bg-mokshya-light border border-green-100/50 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
    <!-- Badge at top right - positioned exactly as in Figma -->
    <div class="absolute top-8 right-8 z-10">
      <span class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-mokshya-light border border-green-100/50 text-mokshya-dark whitespace-nowrap">
        {{ badge }}
      </span>
    </div>
    
    <!-- Content wrapper with proper spacing -->
    <div class="mt-8 flex flex-col flex-1">
      <!-- Icon container - left aligned, specific size matching Figma -->
      <div class="mb-6 w-[128px] h-[128px] flex-shrink-0 flex items-center justify-start">
        <img
          :src="image"
          :alt="title"
          class="object-contain w-full h-full transform group-hover:scale-105 transition-transform duration-300"
          loading="eager"
          decoding="async"
        />
      </div>
      
      <!-- Title - typography matching Figma specs -->
      <h3 class="text-2xl font-bold text-mokshya-dark mb-3 leading-tight">
        {{ title }}
      </h3>
      
      <!-- Description - text styling from Figma -->
      <p class="text-mokshya-dark text-sm leading-relaxed flex-1">
        {{ description }}
      </p>
    </div>
  </div>
</template>


