<script setup lang="ts">
defineProps<{
  statusLabel: string
  trendDescription: string 
  complianceScore?: number
  riskTier?: string
  exposureScore?: number
}>()
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[24px] p-8 flex flex-col items-center justify-center text-center h-full shadow-sm relative overflow-hidden group">
 
    
    <span class="text-[10px] font-black text-[#6b8a87] uppercase tracking-[2px] mb-8 opacity-80">Overall Cyber Risk Status</span>
    
    <div class="relative mb-8">
      <!-- Circular background -->
      <div class="size-40 rounded-full bg-[#ecfdf5] flex items-center justify-center relative shadow-inner">
        <div class="size-20 bg-white rounded-full shadow-lg flex items-center justify-center border border-emerald-100 relative z-10">
          <UIcon name="i-lucide-shield-check" class="size-10 text-[#10b981]" />
        </div>
        
        <!-- Small badge icon -->
        <div class="absolute -bottom-1 -right-1 size-9 bg-white rounded-xl shadow-md flex items-center justify-center border border-[#e8f3f2] ring-4 ring-[#ecfdf5]">
          <UIcon name="i-lucide-activity" class="size-4 text-[#09433e]" />
        </div>
      </div>
    </div>
    
    <h2 class="text-[36px] font-black text-[#0e1b1a] mb-2 tracking-tighter leading-none">{{ statusLabel }}</h2>
    <p class="text-[15px] text-[#4f9690] font-bold opacity-90 mb-8 leading-snug">{{ trendDescription }}</p>

    <!-- Detailed Metrics -->
    <div class="grid grid-cols-3 gap-2 w-full pt-6 border-t border-[#f1f5f9] mt-auto">
      <div class="flex flex-col gap-1 py-1">
        <span class="text-[8px] font-black text-[#94a3b8] uppercase tracking-[1.5px]">Compliance</span>
        <span class="text-[15px] font-black text-[#09433e] tracking-tight">{{ complianceScore || '0' }}%</span>
      </div>
      <div class="flex flex-col gap-1 py-1 border-x border-[#f1f5f9]">
        <span class="text-[8px] font-black text-[#94a3b8] uppercase tracking-[1.5px]">Risk Tier</span>
        <span class="text-[15px] font-black text-[#09433e] tracking-tight">{{ riskTier || '-' }}</span>
      </div>
      <div class="flex flex-col gap-1 py-1">
        <span class="text-[8px] font-black text-[#94a3b8] uppercase tracking-[1.5px]">Exposure</span>
        <span class="text-[15px] font-black text-[#09433e] tracking-tight">{{ exposureScore || '0' }}</span>
      </div>
    </div>
  </div>
</template>
