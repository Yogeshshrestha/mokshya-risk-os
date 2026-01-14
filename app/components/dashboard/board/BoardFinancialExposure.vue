<script setup lang="ts">
defineProps<{
  low: string
  high: string
  trendPercentage: number
}>()
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[24px] p-8 lg:p-10 flex flex-col items-center justify-center relative h-full overflow-hidden group">
    <div class="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 bg-[#f0fdf4] text-[#166534] rounded-xl border border-emerald-100 shadow-sm">
      <UIcon 
        name="i-lucide-trending-up" 
        class="size-4" 
      />
      <span class="text-[11px] font-black uppercase tracking-wider">{{ trendPercentage }}% <span class="opacity-60 font-bold text-[9px]">vs Q2</span></span>
    </div>

    <span class="text-[10px] font-black text-[#6b8a87] uppercase tracking-[2px] mb-12 opacity-80">Estimated Financial Exposure</span>
    
    <div class="flex items-center gap-8 mb-8 transition-transform">
      <span class="text-[56px] sm:text-[72px] font-black text-[#0e1b1a] tracking-tighter leading-none">{{ low }}</span>
      <div class="w-10 h-1.5 bg-[#e2e8f0] rounded-full mt-3 opacity-60"></div>
      <span class="text-[56px] sm:text-[72px] font-black text-[#0e1b1a] tracking-tighter leading-none">{{ high }}</span>
    </div>
    
    <div class="flex items-center gap-4 w-full justify-center">
      <div class="h-px bg-gray-100 flex-1 max-w-[120px]"></div>
      <div class="flex items-center gap-2">
        <p class="text-[10px] text-[#94a3b8] font-black uppercase tracking-[2px]">Potential annual cyber loss range <span class="text-[#09433e] opacity-60">(VaR 95%)</span></p>
      </div>
      <div class="h-px bg-gray-100 flex-1 max-w-[120px]"></div>
    </div>
  </div>
</template>
