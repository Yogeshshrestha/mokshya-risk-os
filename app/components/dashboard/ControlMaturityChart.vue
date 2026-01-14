<script setup lang="ts">
import type { CategoryScore } from '~/types/global-questionnaire'
import type { ControlDomain } from '~/types/dashboard'

const props = defineProps<{
  scores?: Record<string, CategoryScore>
  domains?: ControlDomain[]
}>()

// Default categories if none provided
const defaultCategories = ['Cloud', 'DataPriv', 'IdAM', 'AppSec', 'NetSec', 'Endpt']

const chartPoints = computed(() => {
  let categories: string[] = []
  let values: number[] = []

  if (props.domains && props.domains.length > 0) {
    categories = props.domains.slice(0, 8).map(d => d.display_name)
    // Map to score_percentage for radar visualization
    values = props.domains.slice(0, 8).map(d => (d as any).score_percentage || (d as any).score || 0)
  } else if (props.scores) {
    categories = Object.keys(props.scores).slice(0, 8)
    values = categories.map(cat => props.scores?.[cat]?.compliance || 0)
  } else {
    categories = defaultCategories
    values = new Array(categories.length).fill(50)
  }

  const radius = 120 // Max radius from center (200, 200)
  
  return categories.map((cat, i) => {
    const angle = (i * (360 / categories.length) - 90) * (Math.PI / 180)
    const score = values[i]
    const r = (score / 100) * radius
    
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

