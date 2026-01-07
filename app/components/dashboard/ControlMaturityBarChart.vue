<script setup lang="ts">
import type { CategoryScore } from '~/types/global-questionnaire'

const props = defineProps<{
  scores?: Record<string, CategoryScore>
}>()

const defaultDomains = [
  { name: 'IDENTITY & ACCESS', current: 65, target: 80, color: 'bg-[#09433e]' },
  { name: 'ENDPOINT SECURITY', current: 85, target: 80, color: 'bg-[#09433e]' },
  { name: 'NETWORK SECURITY', current: 55, target: 80, color: 'bg-[#09433e]' },
  { name: 'BACKUP & RECOVERY', current: 90, target: 80, color: 'bg-[#09433e]' },
  { name: 'PATCH MGMT', current: 45, target: 80, color: 'bg-[#f59e0b]' },
  { name: 'GOVERNANCE & TRAINING', current: 60, target: 80, color: 'bg-[#09433e]' },
  { name: 'INCIDENT RESPONSE', current: 50, target: 80, color: 'bg-[#09433e]' },
  { name: 'THIRD-PARTY RISK', current: 30, target: 80, color: 'bg-[#ef4444]' }
]

const domainsData = computed(() => {
  if (!props.scores) return defaultDomains
  
  return Object.entries(props.scores).slice(0, 8).map(([name, data]) => {
    const compliance = data.compliance || 0
    let color = 'bg-[#09433e]' // Default Dark Green
    
    // Logic to match the visual design colors
    if (name.toUpperCase().includes('PATCH')) {
      color = 'bg-[#f59e0b]' // Orange for Patch Mgmt
    } else if (name.toUpperCase().includes('THIRD') || name.toUpperCase().includes('RISK')) {
      color = 'bg-[#ef4444]' // Red for Third-Party Risk
    } else if (compliance < 40) {
      color = 'bg-[#ef4444]'
    } else if (compliance < 70) {
      color = 'bg-[#f59e0b]'
    }
    
    return {
      name: name.toUpperCase(),
      current: compliance,
      target: 65, // Match the visual line level in design
      color: color
    }
  })
})
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] p-10 flex flex-col h-full">
    <div class="flex justify-between items-start mb-10">
      <div>
        <h3 class="text-[22px] font-extrabold text-[#0e1b1a] tracking-tight">Control Maturity Overview</h3>
        <p class="text-[15px] font-medium text-[#4f9690] mt-1 opacity-80">Current maturity vs Target (L3) across key domains</p>
      </div>
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-3">
          <div class="size-4 bg-[#09433e] rounded-[4px]"></div>
          <span class="text-[13px] font-bold text-[#4f9690] uppercase tracking-wider">Current Level</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-6 h-0.5 bg-[#4f9690] border-t-2 border-dashed opacity-60"></div>
          <span class="text-[13px] font-bold text-[#4f9690] uppercase tracking-wider">Target (L3)</span>
        </div>
      </div>
    </div>
    
    <div class="flex-1 flex items-end justify-between gap-2 mt-4 min-h-[320px] relative px-2">
      <!-- Background Grid Line for Target (Spans entire width) -->
      <div 
        class="absolute left-0 right-0 border-t-2 border-[#4f9690] border-dashed z-10 pointer-events-none opacity-30"
        style="bottom: calc(65% + 56px)"
      ></div>

      <div v-for="domain in domainsData" :key="domain.name" class="flex-1 flex flex-col items-center group relative z-0">
        <div class="w-full relative flex flex-col items-center justify-end h-[260px]">
          <!-- Bar Background Container (The light grey slot) -->
          <div class="w-[56px] bg-[#f8fbfb] rounded-[14px] absolute inset-0 bottom-0 border border-[#e8f3f2]/30"></div>
          
          <!-- Current Level Bar (The actual data bar) -->
          <div 
            :class="['w-[56px] rounded-[14px] transition-all duration-1000 ease-out relative z-0 group-hover:brightness-95', domain.color]"
            :style="{ height: `${domain.current}%` }"
          ></div>
        </div>
        
        <!-- Label below bar -->
        <span class="text-[11px] font-extrabold text-[#4f9690] text-center mt-6 uppercase leading-tight max-w-[90px] tracking-[0.5px]">
          {{ domain.name }}
        </span>
      </div>
    </div>
  </div>
</template>

