<script setup lang="ts">
interface ExposureBreakdown {
  scenario_name: string
  amount: number
  amount_formatted: string
}

defineProps<{
  low: string
  high: string
  trendPercentage: number
  confidenceLevel?: string
  description?: string
  exposureBreakdown?: ExposureBreakdown[]
  pml99?: string
}>()
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[24px] p-8 lg:p-10 flex flex-col relative h-full group">
    <div class="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdf4] text-[#166534] rounded-full">
      <UIcon 
        name="i-lucide-trending-up" 
        class="size-3.5" 
      />
      <span class="text-[11px] font-bold uppercase tracking-wider">{{ trendPercentage }}% <span class="opacity-60 text-[10px]">vs Q2</span></span>
    </div>

    <div class="flex items-center justify-center mb-6 mt-4">
      <span class="text-[11px] font-bold text-[#64748b] uppercase tracking-[2px] opacity-80">Estimated Financial Exposure</span>
    </div>
    
    <div class="flex items-center gap-6 mb-8 justify-center">
      <span class="text-[48px] sm:text-[64px] font-black text-[#0e1b1a] tracking-tight leading-none">{{ low }}</span>
      <div class="w-8 h-1 bg-[#e2e8f0] rounded-full opacity-60"></div>
      <span class="text-[48px] sm:text-[64px] font-black text-[#0e1b1a] tracking-tight leading-none">{{ high }}</span>
    </div>
    
    <div class="flex items-center gap-4 w-full justify-center mb-10">
      <div class="h-px bg-gray-100 flex-1 max-w-[80px]"></div>
      <p class="text-[13px] text-[#64748b] font-medium">{{ description || 'Potential annual cyber loss range' }} ({{ confidenceLevel || 'VaR 95%' }})</p>
      <div class="h-px bg-gray-100 flex-1 max-w-[80px]"></div>
    </div>

    <!-- Exposure Drivers & PML Grid -->
    <div class="mt-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="(item, index) in exposureBreakdown" :key="index" 
        class="bg-[#f8fbfb] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 border border-[#e8f3f2]"
      >
        <span class="text-[10px] font-bold text-[#64748b] uppercase tracking-wider line-clamp-1" :title="item.scenario_name">{{ item.scenario_name }}</span>
        <span class="text-[18px] font-black text-[#0e1b1a] tracking-tight">{{ item.amount_formatted }}</span>
      </div>
      
      <!-- PML Card -->
      <div v-if="pml99" class="bg-[#09433e] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 shadow-lg shadow-[#09433e]/10">
        <span class="text-[10px] font-bold text-emerald-200/80 uppercase tracking-wider">PML (99%)</span>
        <span class="text-[18px] font-black text-white tracking-tight">{{ pml99 }}</span>
      </div>
    </div>
  </div>
</template>
