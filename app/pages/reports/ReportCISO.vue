<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDashboard } from '~/composables/useDashboard'
import { useOrganization } from '~/composables/useOrganization'
import StatCard from '~/components/dashboard/StatCard.vue'
import ControlMaturityChart from '~/components/dashboard/ControlMaturityChart.vue'
import ControlMaturityBarChart from '~/components/dashboard/ControlMaturityBarChart.vue'
import CriticalControlGapsTable from '~/components/dashboard/CriticalControlGapsTable.vue'
import RemediationTaskTracker from '~/components/dashboard/RemediationTaskTracker.vue'
import ReadinessMetrics from '~/components/dashboard/ReadinessMetrics.vue'
import type { CISODashboardResponse } from '~/types/dashboard'

const props = defineProps<{ organizationId: string }>()

const dashboard = useDashboard()
const orgApi = useOrganization()
const isLoading = ref(true)
const data = ref<CISODashboardResponse | null>(null)
const organization = ref<any>(null)

const cisoStats = computed(() => {
  if (!data.value) return []
  
  const maturity = data.value.control_maturity_overview
  
  return [
    { 
      title: 'Control Maturity', 
      value: `${maturity.overall_current_level.toFixed(1)}`, 
      secondaryValue: `Target: ${maturity.overall_target_level}`,
      trend: `${maturity.domains_above_target} Domains on Track`, 
      trendIcon: 'i-lucide-trending-up', 
      trendColor: 'text-emerald-600', 
      icon: 'i-lucide-zap',
      iconBg: 'bg-emerald-50'
    },
    { 
      title: 'Patch Velocity', 
      value: `${Math.round(maturity.patch_velocity.value)}%`, 
      trend: maturity.patch_velocity.additional_info || '24hr SLA', 
      trendIcon: 'i-lucide-clock', 
      trendColor: 'text-slate-500', 
      icon: 'i-lucide-activity',
      iconBg: 'bg-[#e8f3f2]'
    },
    { 
      title: 'MFA Coverage', 
      value: `${Math.round(maturity.mfa_coverage.value)}%`, 
      trend: maturity.mfa_coverage.status || 'Stable', 
      trendIcon: 'i-lucide-shield-check', 
      trendColor: 'text-emerald-600', 
      icon: 'i-lucide-fingerprint', 
      iconBg: 'bg-[#e8f3f2]' 
    },
    { 
      title: 'Security Score', 
      value: `${Math.round(data.value.overall_security_score)}%`, 
      secondaryValue: 'Overall',
      trend: 'Intelligence Driven', 
      trendIcon: 'i-lucide-brain-circuit', 
      trendColor: 'text-emerald-600',
      icon: 'i-lucide-database', 
      iconBg: 'bg-[#e8f3f2]'
    }
  ]
})

onMounted(async () => {
  try {
    organization.value = await orgApi.getOrganization(props.organizationId)
    data.value = await dashboard.getCISODashboard(props.organizationId, { include_completed_tasks: false })
  } catch (e) {
    console.error('ReportCISO load failed', e)
  } finally {
    isLoading.value = false

    // Wait for DOM + charts to render and trigger resize so chart libraries can reflow
    await nextTick()
    try { window.dispatchEvent(new Event('resize')) } catch (e) { /* ignore */ }
    await new Promise(resolve => setTimeout(resolve, 300))

    // Notify any listeners that this report is ready for capture
    try {
      window.dispatchEvent(new CustomEvent('report-ready', { detail: { persona: 'ciso' } }))
    } catch (e) { /* ignore */ }
  }
})
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-100">
    <div class="text-sm text-gray-500">Preparing CISO report...</div>
  </div>

  <div v-else-if="data" class="space-y-6">
      <!-- Top Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          v-for="stat in cisoStats"
          :key="stat.title"
          v-bind="stat"
        />
      </div>

      <!-- Control Maturity Overview -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Control Maturity Overview</h3>
        <ControlMaturityBarChart 
          v-if="data.control_maturity_overview"
          :data="data.control_maturity_overview" 
        />
      </div>

      <!-- Critical Control Gaps -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Critical Control Gaps</h3>
        <CriticalControlGapsTable 
          v-if="data.critical_control_gaps?.gaps"
          :red-flags="data.critical_control_gaps.gaps"
          :gaps-section="data.critical_control_gaps"
        />
        <div v-else class="text-sm text-[#6b8a87] text-center py-8">
          No critical gaps identified
        </div>
      </div>

      <!-- Readiness Metrics -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Readiness Metrics</h3>
        <div class="space-y-3 text-[14px]">
          <div class="flex justify-between">
            <span class="text-[#6b8a87] font-medium">Insurance Ready</span>
            <span class="font-bold" :class="data.insurance_ready ? 'text-emerald-600' : 'text-amber-600'">
              {{ data.insurance_ready ? 'YES' : 'NO' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#6b8a87] font-medium">Overall Security Score</span>
            <span class="font-bold text-[#09423c]">{{ Math.round(data.overall_security_score) }}%</span>
          </div>
        </div>
      </div>

      <!-- Control Maturity Chart -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Control Maturity</h3>
        <ControlMaturityChart 
          v-if="data.control_maturity_overview.domains"
          :domains="data.control_maturity_overview.domains" 
        />
      </div>

      <!-- Remediation Task Tracker -->
      <div v-if="data.remediation_task_tracker" class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <RemediationTaskTracker :tracker="data.remediation_task_tracker" />
      </div>

      <!-- Readiness Metrics Detail -->
      <div v-if="data.readiness_metrics" class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <ReadinessMetrics :metrics="data.readiness_metrics" />
      </div>

      <!-- Security Metrics -->
      <div v-if="data.control_maturity_overview.domains.length > 0" class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Security Metrics</h3>
        <div class="space-y-4">
          <div v-if="data.control_maturity_overview.endpoint_protection">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider">Endpoint Protection</span>
              <span class="text-[13px] font-black text-[#09423c]">{{ Math.round(data.control_maturity_overview.endpoint_protection.value) }}{{ data.control_maturity_overview.endpoint_protection.unit || '%' }}</span>
            </div>
            <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <div 
                class="h-full bg-[#09423c] rounded-full"
                :style="{ width: `${data.control_maturity_overview.endpoint_protection.value}%` }"
              ></div>
            </div>
          </div>
          <div v-if="data.control_maturity_overview.backup_success">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider">Backup Success</span>
              <span class="text-[13px] font-black text-[#09423c]">{{ Math.round(data.control_maturity_overview.backup_success.value) }}{{ data.control_maturity_overview.backup_success.unit || '%' }}</span>
            </div>
            <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <div 
                class="h-full bg-[#09423c] rounded-full"
                :style="{ width: `${data.control_maturity_overview.backup_success.value}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resilience Insight -->
      <div v-if="data.control_maturity_overview.domains.length > 0" class="bg-[#09423c] rounded-[20px] p-6 text-white shadow-sm">
        <h3 class="text-[16px] font-extrabold mb-4">Resilience Insight</h3>
        <p class="text-[13px] text-emerald-100/80 leading-relaxed">
          Your strongest domain is <span class="font-bold">{{ data.control_maturity_overview.domains.reduce((a, b) => (a.current_level > b.current_level ? a : b)).domain }}</span>. 
          Improvement needed in <span class="font-bold">{{ data.control_maturity_overview.domains.reduce((a, b) => (a.current_level < b.current_level ? a : b)).domain }}</span>.
        </p>
      </div>

      <!-- Control Maturity Bar Chart Overview -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <ControlMaturityBarChart 
          v-if="data.control_maturity_overview"
          :data="data.control_maturity_overview" 
        />
      </div>

      <!-- Critical Control Gaps -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <CriticalControlGapsTable 
          v-if="data.critical_control_gaps?.gaps"
          :red-flags="data.critical_control_gaps.gaps"
          :gaps-section="data.critical_control_gaps"
        />
      </div>
    </div>
</template>