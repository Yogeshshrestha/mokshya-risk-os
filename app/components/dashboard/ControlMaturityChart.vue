<script setup lang="ts">
import type { CategoryScore } from '~/types/global-questionnaire'

const props = defineProps<{
  scores?: Record<string, CategoryScore>
}>()

// Default categories if none provided
const defaultCategories = ['Cloud', 'DataPriv', 'IdAM', 'AppSec', 'NetSec', 'Endpt']

const chartPoints = computed(() => {
  const categories = props.scores ? Object.keys(props.scores).slice(0, 6) : defaultCategories
  const radius = 120 // Max radius from center (200, 200)
  
  return categories.map((cat, i) => {
    const angle = (i * (360 / categories.length) - 90) * (Math.PI / 180)
    const compliance = props.scores?.[cat]?.compliance || 50 // Default to 50% if no data
    const r = (compliance / 100) * radius
    
    return {
      name: cat,
      x: 200 + r * Math.cos(angle),
      y: 200 + r * Math.sin(angle),
      labelX: 200 + (radius + 25) * Math.cos(angle),
      labelY: 200 + (radius + 25) * Math.sin(angle)
    }
  })
})

const polyPath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  return chartPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
    <h3 class="text-[17px] font-bold text-[#0e1b1a] mb-8">Control Maturity</h3>
    
    <div class="relative flex-1 flex items-center justify-center min-h-[280px]">
      <!-- Background Circles -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="size-[240px] rounded-full border border-gray-100 border-dashed"></div>
        <div class="size-[160px] rounded-full border border-gray-100 border-dashed absolute"></div>
        <div class="size-[80px] rounded-full border border-gray-100 border-dashed absolute"></div>
      </div>
      
      <!-- Axis Lines -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div v-for="i in 3" :key="i" class="w-[240px] h-px bg-gray-50 absolute" :style="{ transform: `rotate(${(i-1) * 60}deg)` }"></div>
      </div>
      
      <!-- Radar Shape (SVG) -->
      <svg class="size-full absolute inset-0" viewBox="0 0 400 400">
        <polygon 
          :points="polyPath" 
          fill="rgba(9, 67, 62, 0.15)" 
          stroke="#09433e" 
          stroke-width="2.5" 
          stroke-linejoin="round"
        />
        <!-- Points -->
        <circle 
          v-for="p in chartPoints" 
          :key="p.name"
          :cx="p.x" 
          :cy="p.y" 
          r="4.5" 
          fill="#09433e" 
          class="drop-shadow-sm"
        />
      </svg>
      
      <!-- Labels -->
      <div 
        v-for="p in chartPoints" 
        :key="p.name + '-label'"
        class="absolute text-[11px] text-[#4f9690] font-bold uppercase tracking-wider transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
        :style="{ left: `${(p.labelX / 400) * 100}%`, top: `${(p.labelY / 400) * 100}%` }"
      >
        {{ p.name }}
      </div>
    </div>
  </div>
</template>

