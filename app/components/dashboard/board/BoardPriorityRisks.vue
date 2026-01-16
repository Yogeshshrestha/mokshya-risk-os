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

const getSeverityDotColor = (severity: string) => {
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
    <div class="flex justify-between items-center">
      <h3 class="text-[20px] font-bold text-[#0e1b1a]">Top 3 Priority Risks</h3>
      <div class="px-3 py-1 bg-[#f1f5f9] text-[#64748b] rounded text-[11px] font-medium">
        {{ rankingCriteria || 'Ranked by Impact' }}
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="risk in risks" :key="risk.id" 
        class="bg-white border border-[#e8f3f2] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <div :class="['size-2.5 rounded-full', getSeverityDotColor(risk.severity)]"></div>
            <h4 class="text-[16px] font-bold text-[#0e1b1a]">{{ risk.risk_name }}</h4>
          </div>
          <span class="text-[16px] font-bold text-[#0e1b1a]">{{ risk.impact_formatted }}</span>
        </div>
        
        <p class="text-[14px] text-[#64748b] leading-relaxed">
          {{ risk.description }}
        </p>
      </div>
    </div>
  </div>
</template>
