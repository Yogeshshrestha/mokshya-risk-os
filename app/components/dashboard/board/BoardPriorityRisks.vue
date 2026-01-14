<script setup lang="ts">
interface Risk {
  id: string
  risk_name: string
  risk_category: string
  estimated_impact: number
  impact_formatted: string
  description: string
  severity: string
  rank: number
}

defineProps<{
  risks: Risk[]
  rankingCriteria?: string
}>()

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'bg-rose-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-amber-500'
    case 'low': return 'bg-emerald-500'
    default: return 'bg-slate-400'
  }
}
</script>

<template>
  <div class="w-full space-y-6">
    <div class="flex justify-between items-end px-2">
      <div class="space-y-1">
        <h3 class="text-[24px] font-black text-[#0e1b1a] tracking-tight leading-none">Top 3 Priority Risks</h3>
        <p class="text-[12px] text-[#4f9690] font-bold uppercase tracking-widest opacity-70">Critical exposures requiring attention</p>
      </div>
      <div class="px-4 py-2 bg-white text-[#09433e] rounded-xl text-[11px] font-black uppercase tracking-[1.5px] border border-[#e8f3f2] shadow-sm flex items-center gap-2">
        <UIcon name="i-lucide-list-filter" class="size-3.5" />
        {{ rankingCriteria || 'Ranked by Impact' }}
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="(risk, index) in risks" :key="risk.id" 
        class="bg-white border border-[#e8f3f2] rounded-[24px] p-8 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
      >
        <div class="flex justify-between items-start mb-8 relative z-10">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <div :class="['size-2.5 rounded-full shadow-sm', getSeverityColor(risk.severity)]"></div>
              <span class="text-[10px] font-black text-[#94a3b8] uppercase tracking-[1.5px]">{{ risk.severity }}</span>
            </div>
            <h4 class="text-[20px] font-black text-[#0e1b1a] tracking-tight group-hover:text-[#09433e] transition-colors leading-tight">{{ risk.risk_name }}</h4>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[18px] font-black text-[#0e1b1a] tracking-tighter leading-none">{{ risk.impact_formatted }}</span>
            <span class="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mt-1">Impact</span>
          </div>
        </div>
        
        <p class="text-[15px] text-[#4f9690] leading-relaxed font-bold opacity-90 relative z-10 line-clamp-3">
          {{ risk.description }}
        </p>

        <div class="mt-8 pt-6 border-t border-[#f1f5f9] flex justify-between items-center relative z-10">
          <span class="text-[10px] font-black text-[#09433e] uppercase tracking-[1.5px] px-2.5 py-1 bg-[#e8f3f2] rounded-lg">{{ risk.risk_category }}</span>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-[#09433e] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  </div>
</template>
