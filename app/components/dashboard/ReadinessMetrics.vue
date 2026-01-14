<script setup lang="ts">
import type { ReadinessMetrics } from '~/types/dashboard'

interface Props {
  metrics: ReadinessMetrics
}

const props = defineProps<Props>()

const getReadinessColor = (val: number) => {
  if (val >= 80) return 'text-emerald-600'
  if (val >= 60) return 'text-amber-600'
  return 'text-rose-600'
}

const getBarColor = (val: number) => {
  if (val >= 80) return 'bg-emerald-500'
  if (val >= 60) return 'bg-amber-500'
  return 'bg-rose-500'
}

const overallScore = computed(() => {
  const sum = props.metrics.insurance_readiness.score + 
              props.metrics.audit_readiness.score + 
              props.metrics.evidence_completeness.score
  return sum / 3
})
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm p-6 h-full flex flex-col">
    <div class="flex justify-between items-center mb-8">
      <h3 class="text-[16px] font-bold text-[#0e1b1a]">Post-Assessment Readiness</h3>
      <div class="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">
        <UIcon name="i-lucide-trending-up" class="size-3.5" />
        <span class="text-[10px] font-black uppercase tracking-wider">Stable</span>
      </div>
    </div>

    <div class="space-y-8 flex-1">
      <!-- Overall Score -->
      <div class="text-center pb-6 border-b border-[#f8fbfb]">
        <div class="relative inline-flex items-center justify-center">
          <svg class="size-24 transform -rotate-90">
            <circle cx="48" cy="48" r="44" stroke="currentColor" stroke-width="8" fill="transparent" class="text-gray-50" />
            <circle 
              cx="48" cy="48" r="44" stroke="currentColor" stroke-width="8" fill="transparent" 
              :stroke-dasharray="276.46" 
              :stroke-dashoffset="276.46 * (1 - overallScore / 100)"
              class="transition-all duration-1000 ease-out"
              :class="getReadinessColor(overallScore).replace('text-', 'text-')"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[24px] font-black text-[#0e1b1a] leading-none">{{ Math.round(overallScore) }}%</span>
            <span class="text-[9px] font-bold text-[#4f9690] uppercase tracking-widest mt-1">Ready</span>
          </div>
        </div>
      </div>

      <!-- Breakdown -->
      <div class="space-y-6">
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-[11px] font-black text-[#4f9690] uppercase tracking-widest">Insurance Readiness</span>
            <span class="text-[13px] font-black text-[#0e1b1a]">{{ Math.round(metrics.insurance_readiness.score) }}%</span>
          </div>
          <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out"
              :class="getBarColor(metrics.insurance_readiness.score)"
              :style="{ width: `${metrics.insurance_readiness.score}%` }"
            ></div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-[11px] font-black text-[#4f9690] uppercase tracking-widest">Audit Readiness</span>
            <span class="text-[13px] font-black text-[#0e1b1a]">{{ Math.round(metrics.audit_readiness.score) }}%</span>
          </div>
          <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out"
              :class="getBarColor(metrics.audit_readiness.score)"
              :style="{ width: `${metrics.audit_readiness.score}%` }"
            ></div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-[11px] font-black text-[#4f9690] uppercase tracking-widest">Evidence Completeness</span>
            <span class="text-[13px] font-black text-[#0e1b1a]">{{ Math.round(metrics.evidence_completeness.score) }}%</span>
          </div>
          <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out"
              :class="getBarColor(metrics.evidence_completeness.score)"
              :style="{ width: `${metrics.evidence_completeness.score}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <button class="w-full py-3 bg-[#f8fbfb] border border-[#e8f3f2] rounded-xl text-[12px] font-black text-[#09433e] uppercase tracking-widest hover:bg-white hover:border-[#09433e]/30 transition-all cursor-pointer">
        Analyze Readiness Gaps
      </button>
    </div>
  </div>
</template>
