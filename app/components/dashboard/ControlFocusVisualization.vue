<script setup lang="ts">
import type { CISODashboardResponse, CRODashboardResponse, ControlDomain } from '~/types/dashboard'

interface Props {
  dashboardData: CISODashboardResponse | CRODashboardResponse
  persona: 'ciso' | 'cro'
}

const props = defineProps<Props>()

const domains = computed(() => {
  if (props.persona === 'ciso' && 'control_maturity_overview' in props.dashboardData) {
    return (props.dashboardData as CISODashboardResponse).control_maturity_overview.domains
  } else if (props.persona === 'cro' && 'control_maturity' in props.dashboardData) {
    return (props.dashboardData as CRODashboardResponse).control_maturity.domains
  }
  return []
})

const overallLevel = computed(() => {
  if (props.persona === 'ciso' && 'control_maturity_overview' in props.dashboardData) {
    return (props.dashboardData as CISODashboardResponse).control_maturity_overview.overall_current_level
  } else if (props.persona === 'cro' && 'control_maturity' in props.dashboardData) {
    return (props.dashboardData as CRODashboardResponse).control_maturity.overall_current_level
  }
  return 0
})

const overallTarget = computed(() => {
  if (props.persona === 'ciso' && 'control_maturity_overview' in props.dashboardData) {
    return (props.dashboardData as CISODashboardResponse).control_maturity_overview.overall_target_level
  } else if (props.persona === 'cro' && 'control_maturity' in props.dashboardData) {
    return (props.dashboardData as CRODashboardResponse).control_maturity.overall_target_level
  }
  return 0
})

const getLevelColor = (current: number, target: number) => {
  const gap = target - current
  if (gap <= 0) return 'bg-emerald-500'
  if (gap <= 1) return 'bg-amber-500'
  return 'bg-red-500'
}

const getLevelStatus = (current: number, target: number) => {
  const gap = target - current
  if (gap <= 0) return { text: 'On Track', color: 'text-emerald-600', bg: 'bg-emerald-50' }
  if (gap <= 1) return { text: 'Near Target', color: 'text-amber-600', bg: 'bg-amber-50' }
  return { text: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50' }
}

const formatDomainName = (name: string) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center bg-white sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <div class="size-10 rounded-xl bg-[#09433e]/10 flex items-center justify-center">
          <UIcon name="i-lucide-layers" class="size-5 text-[#09433e]" />
        </div>
        <div>
          <h3 class="text-[18px] font-bold text-[#0e1b1a]">Control Maturity Overview</h3>
          <p class="text-[12px] text-[#4f9690] mt-0.5">Domain performance and status</p>
        </div>
      </div>
    </div>

    <!-- Overall Score -->
    <div class="px-6 py-5 bg-gradient-to-br from-[#09433e]/5 to-transparent border-b border-[#e8f3f2]">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[13px] font-bold text-[#4f9690] uppercase tracking-wider">Overall Maturity Level</span>
        <span :class="['px-3 py-1 rounded-lg text-xs font-bold', getLevelStatus(overallLevel, overallTarget).bg, getLevelStatus(overallLevel, overallTarget).color]">
          {{ getLevelStatus(overallLevel, overallTarget).text }}
        </span>
      </div>
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-[32px] font-black text-[#0e1b1a]">{{ overallLevel.toFixed(1) }}</span>
            <span class="text-[14px] text-[#4f9690] font-medium">/ {{ overallTarget }}</span>
          </div>
          <div class="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div 
              :class="['h-full rounded-full transition-all duration-1000', getLevelColor(overallLevel, overallTarget)]"
              :style="{ width: `${Math.min((overallLevel / overallTarget) * 100, 100)}%` }"
            ></div>
          </div>
        </div>
        <div class="text-right">
          <p class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider mb-1">Target</p>
          <p class="text-[24px] font-black text-[#09433e]">{{ overallTarget }}</p>
        </div>
      </div>
    </div>

    <!-- Domains Grid -->
    <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="domain in domains" 
          :key="domain.domain"
          class="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h4 class="text-[14px] font-bold text-[#0e1b1a] mb-1 truncate group-hover:text-[#09433e] transition-colors">
                {{ formatDomainName(domain.display_name || domain.domain) }}
              </h4>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-medium text-[#4f9690]">Current:</span>
                <span class="text-[13px] font-bold text-[#0e1b1a]">{{ domain.current_level.toFixed(1) }}</span>
                <span class="text-[11px] text-gray-400">/</span>
                <span class="text-[13px] font-medium text-gray-600">Target: {{ domain.target_level }}</span>
              </div>
            </div>
            <span 
              :class="['px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap', getLevelStatus(domain.current_level, domain.target_level).bg, getLevelStatus(domain.current_level, domain.target_level).color]"
            >
              {{ domain.status || (domain.current_level >= domain.target_level ? 'On Track' : 'Below') }}
            </span>
          </div>
          
          <div class="space-y-2">
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div 
                :class="['h-full rounded-full transition-all duration-1000', getLevelColor(domain.current_level, domain.target_level)]"
                :style="{ width: `${Math.min((domain.current_level / domain.target_level) * 100, 100)}%` }"
              ></div>
            </div>
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-[#4f9690] font-medium">
                Gap: {{ (domain.target_level - domain.current_level).toFixed(1) }}
              </span>
              <span class="text-gray-500">
                {{ domain.questions_answered || 0 }}/{{ domain.total_questions || 0 }} answered
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Stats -->
    <div v-if="domains.length > 0" class="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <div class="text-center">
          <p class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider mb-1">Above Target</p>
          <p class="text-[18px] font-black text-emerald-600">
            {{ props.persona === 'ciso' && 'control_maturity_overview' in props.dashboardData 
              ? (props.dashboardData as CISODashboardResponse).control_maturity_overview.domains_above_target
              : (props.dashboardData as CRODashboardResponse).control_maturity.domains_above_target }}
          </p>
        </div>
        <div class="h-12 w-px bg-gray-200"></div>
        <div class="text-center">
          <p class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider mb-1">At Target</p>
          <p class="text-[18px] font-black text-[#09433e]">
            {{ props.persona === 'ciso' && 'control_maturity_overview' in props.dashboardData 
              ? (props.dashboardData as CISODashboardResponse).control_maturity_overview.domains_at_target
              : (props.dashboardData as CRODashboardResponse).control_maturity.domains_at_target }}
          </p>
        </div>
        <div class="h-12 w-px bg-gray-200"></div>
        <div class="text-center">
          <p class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider mb-1">Below Target</p>
          <p class="text-[18px] font-black text-red-600">
            {{ props.persona === 'ciso' && 'control_maturity_overview' in props.dashboardData 
              ? (props.dashboardData as CISODashboardResponse).control_maturity_overview.domains_below_target
              : (props.dashboardData as CRODashboardResponse).control_maturity.domains_below_target }}
          </p>
        </div>
      </div>
      <NuxtLink 
        :to="`/organizations/${props.dashboardData.organization_id}/assessment`"
        class="px-4 py-2 rounded-xl bg-[#09433e] text-white text-[12px] font-bold hover:bg-[#07332e] transition-colors"
      >
        View Details
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
