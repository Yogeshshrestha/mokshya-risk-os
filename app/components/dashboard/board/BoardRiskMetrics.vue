<script setup lang="ts">
defineProps<{
  insuranceStatus: string
  insuranceReadinessScore: number
  totalOpenRisks: number
  highSeverityRisks: number
  overdueMitigations: number
}>()

const getInsuranceStatusColor = (status: string) => {
  const statusLower = status.toLowerCase()
  if (statusLower === 'eligible' || statusLower === 'ready') {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: 'i-lucide-check-circle'
    }
  }
  if (statusLower === 'conditional') {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: 'i-lucide-alert-triangle'
    }
  }
  return {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: 'i-lucide-x-circle'
  }
}
</script>

<template>
  <div class="w-full">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Insurance Status -->
      <div class="bg-white rounded-[20px] p-6 border border-[#e8f3f2] shadow-sm flex flex-col justify-between h-full">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[12px] font-semibold text-[#64748b]">Insurance Status</span>
          <UIcon :name="getInsuranceStatusColor(insuranceStatus).icon" 
            :class="['size-4', getInsuranceStatusColor(insuranceStatus).text]" 
          />
        </div>
        <div class="flex items-end justify-between">
          <span class="text-[20px] font-bold text-[#0e1b1a]">{{ insuranceStatus }}</span>
          <span class="text-[12px] font-medium text-[#64748b]">{{ Math.round(insuranceReadinessScore) }}% Ready</span>
        </div>
        <div class="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-[#09433e] rounded-full" :style="{ width: `${insuranceReadinessScore}%` }"></div>
        </div>
      </div>

      <!-- Total Open Risks -->
      <div class="bg-white rounded-[20px] p-6 border border-[#e8f3f2] shadow-sm flex flex-col justify-between h-full">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[12px] font-semibold text-[#64748b]">Open Risks</span>
          <UIcon name="i-lucide-alert-circle" class="size-4 text-[#4f9690]" />
        </div>
        <div class="flex items-end justify-between">
          <span class="text-[24px] font-bold text-[#0e1b1a]">{{ totalOpenRisks }}</span>
          <div class="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[11px] font-medium">
             <span>{{ highSeverityRisks }} High</span>
          </div>
        </div>
      </div>

      <!-- Overdue Mitigations -->
      <div class="bg-white rounded-[20px] p-6 border border-[#e8f3f2] shadow-sm flex flex-col justify-between h-full">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[12px] font-semibold text-[#64748b]">Overdue Mitigations</span>
          <UIcon name="i-lucide-clock" class="size-4 text-[#64748b]" />
        </div>
        <div class="flex items-end justify-between">
           <span :class="['text-[24px] font-bold', overdueMitigations > 0 ? 'text-rose-600' : 'text-[#0e1b1a]']">{{ overdueMitigations }}</span>
           <span class="text-[12px] font-medium text-[#64748b]" v-if="overdueMitigations === 0">On Track</span>
           <span class="text-[12px] font-medium text-rose-600" v-else>Action Required</span>
        </div>
      </div>
    </div>
  </div>
</template>
