<script setup lang="ts">
defineProps<{
  trendSummary: string
  peerPercentile: number
  sector: string
}>()
</script>

<template>
  <div class="flex flex-col lg:flex-row items-center justify-between py-10 lg:py-12 border-t border-[#f1f5f9] gap-10 lg:gap-0 mt-16 mb-8">
    <!-- Trend Summary -->
    <div class="flex flex-col sm:flex-row items-center gap-6 lg:gap-10 w-full lg:w-auto">
      <span class="text-[10px] font-black text-[#94a3b8] uppercase tracking-[3px] whitespace-nowrap opacity-60">TREND SUMMARY</span>
      <div class="flex items-center gap-6 bg-white px-6 py-4 rounded-[20px] border border-[#e8f3f2] shadow-sm flex-1 sm:flex-none">
        <div class="size-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <UIcon name="i-lucide-arrow-up-right" class="size-5 text-[#10b981]" stroke-width="3" />
        </div>
        <div class="space-y-0.5">
          <p class="text-[16px] lg:text-[18px] text-[#1e293b] font-black tracking-tight leading-none">{{ trendSummary }}</p>
          <p class="text-[9px] text-[#4f9690] font-bold uppercase tracking-widest opacity-70">Security Intelligence</p>
        </div>
      </div>
    </div>
    
    <!-- Peer Comparison -->
    <div class="flex items-center gap-5 lg:gap-6 bg-[#09433e] px-8 py-5 rounded-[22px] text-white shadow-lg">
      <div class="flex flex-col items-end">
        <span class="text-[9px] font-black text-emerald-300/60 uppercase tracking-[2px] mb-0.5">Benchmark</span>
        <div class="flex items-center gap-2">
          <span class="text-[16px] text-emerald-100 font-bold">Top</span>
          <span class="text-[26px] font-black tracking-tighter leading-none">{{ peerPercentile }}%</span>
        </div>
      </div>
      <div class="w-px h-8 bg-white/10"></div>
      <div class="flex flex-col">
        <span class="text-[16px] font-black tracking-tight">{{ sector }}</span>
        <span class="text-[9px] text-emerald-100/60 font-bold uppercase tracking-widest">Global Sector</span>
      </div>
    </div>
  </div>
</template>
