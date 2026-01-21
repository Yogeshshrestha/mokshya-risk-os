<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDashboard } from '~/composables/useDashboard'
import { useOrganization } from '~/composables/useOrganization'
import StatCard from '~/components/dashboard/StatCard.vue'
import ControlMaturityChart from '~/components/dashboard/ControlMaturityChart.vue'
import RiskTable from '~/components/dashboard/RiskTable.vue'
import CoverageSummary from '~/components/dashboard/CoverageSummary.vue'
import RenewalCountdown from '~/components/dashboard/RenewalCountdown.vue'
import ReadinessMetrics from '~/components/dashboard/ReadinessMetrics.vue'
import MitigationRoadmap from '~/components/dashboard/MitigationRoadmap.vue'
import RemediationTaskTracker from '~/components/dashboard/RemediationTaskTracker.vue'
import type { CRODashboardResponse } from '~/types/dashboard'

const props = defineProps<{ organizationId: string }>()

const dashboard = useDashboard()
const orgApi = useOrganization()
const isLoading = ref(true)
const data = ref<CRODashboardResponse | null>(null)
const organization = ref<any>(null)

const formatCurrency = (val: number) => {
  if (!val && val !== 0) return '$0'
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(1)}M`
  }
  if (val >= 1000) {
    return `$${Math.round(val / 1000).toLocaleString()}K`
  }
  return `$${Math.round(val).toLocaleString()}`
}

const dashboardStats = computed(() => {
  if (!data.value) return []
  
  const summary = data.value.executive_summary
  const scoring = data.value.risk_scoring
  
  return [
    { 
      title: 'Cyber Risk Tier', 
      value: `Grade ${summary.risk_tier_grade}`, 
      trend: `Base Tier: ${summary.base_tier}`, 
      trendIcon: summary.risk_tier_grade > summary.base_tier ? 'i-lucide-trending-up' : 'i-lucide-arrow-right', 
      trendColor: summary.risk_tier_grade > 'C' ? 'text-rose-600' : 'text-emerald-600',
      icon: 'i-lucide-layers',
      valueColor: summary.risk_tier_grade > 'C' ? 'text-rose-600' : 'text-[#0e1b1a]'
    },
    { 
      title: 'Est. Exposure', 
      value: formatCurrency(scoring.financial_exposure.single_event_mid), 
      trend: `Probable Max: ${formatCurrency(scoring.financial_exposure.pml_99)}`, 
      trendIcon: 'i-lucide-dollar-sign', 
      icon: 'i-lucide-dollar-sign' 
    },
    { 
      title: 'Red Flags', 
      value: summary.red_flags_count.toString(), 
      trend: `${summary.critical_red_flags} Critical Issues`, 
      trendIcon: 'i-lucide-flag', 
      trendColor: summary.critical_red_flags > 0 ? 'text-rose-600' : 'text-emerald-600', 
      icon: 'i-lucide-flag', 
      iconBg: summary.critical_red_flags > 0 ? 'bg-rose-50' : 'bg-[#e8f3f2]' 
    },
    { 
      title: 'Insurance Eligibility', 
      value: scoring.eligibility.toUpperCase(), 
      trend: scoring.eligibility_reason, 
      trendIcon: scoring.eligibility === 'decline' ? 'i-lucide-alert-circle' : 'i-lucide-check-circle', 
      icon: 'i-lucide-shield-check', 
      valueColor: scoring.eligibility === 'eligible' ? 'text-emerald-600' : (scoring.eligibility === 'conditional' ? 'text-amber-600' : 'text-rose-600'),
      trendColor: scoring.eligibility === 'decline' ? 'text-rose-500' : 'text-slate-500'
    }
  ]
})

const sortedTopRisks = computed(() => {
  if (!data.value?.risk_register?.top_risks) return []
  return [...data.value.risk_register.top_risks].sort((a, b) => 
    a.risk_id.localeCompare(b.risk_id)
  )
})

onMounted(async () => {
  try {
    organization.value = await orgApi.getOrganization(props.organizationId)
    data.value = await dashboard.getCRODashboard(props.organizationId, { include_financial_exposure: true, include_insurance_assessment: true })
  } catch (e) {
    console.error('ReportCRO load failed', e)
  } finally {
    isLoading.value = false

    // Wait for DOM + charts to render and trigger resize so chart libraries can reflow
    await nextTick()
    try { window.dispatchEvent(new Event('resize')) } catch (e) { /* ignore */ }
    await new Promise(resolve => setTimeout(resolve, 300))

    // Notify any listeners that this report is ready for capture
    try {
      window.dispatchEvent(new CustomEvent('report-ready', { detail: { persona: 'cro' } }))
    } catch (e) { /* ignore */ }
  }
})
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-100">
    <div class="text-sm text-gray-500">Preparing CRO report...</div>
  </div>

  <div v-else-if="data" class="space-y-6">
      <!-- Top Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          v-for="stat in dashboardStats"
          :key="stat.title"
          v-bind="stat"
        />
      </div>

      <!-- Executive Summary -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm report-full">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Executive Summary</h3>
        <div class="space-y-3 text-[14px]">
          <div class="flex justify-between">
            <span class="text-[#6b8a87] font-medium">Risk Tier</span>
            <span class="font-bold text-[#09423c]">Grade {{ data.executive_summary.risk_tier_grade }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#6b8a87] font-medium">Base Tier</span>
            <span class="font-bold text-[#09423c]">{{ data.executive_summary.base_tier }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#6b8a87] font-medium">Red Flags</span>
            <span class="font-bold text-[#09423c]">{{ data.executive_summary.red_flags_count }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#6b8a87] font-medium">Critical Issues</span>
            <span class="font-bold text-rose-600">{{ data.executive_summary.critical_red_flags }}</span>
          </div>
        </div>
      </div>

      <!-- Risk Register -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Top Risks</h3>
        <RiskTable 
          v-if="sortedTopRisks.length"
          :items="sortedTopRisks as any"
          :organization-id="props.organizationId"
        />
        <div v-else class="text-sm text-[#6b8a87] text-center py-8">
          No risks to display
        </div>
      </div>

      <!-- Control Maturity Chart -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm report-full">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Control Maturity</h3>
        <ControlMaturityChart 
          v-if="data.control_maturity"
          :data="data.control_maturity" 
        />
      </div>

      <!-- Score Influencers -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Score Influencers</h3>
        <div class="space-y-6">
          <div v-if="data.risk_scoring.base_scores.likelihood_factors.length">
            <h4 class="text-[11px] font-bold text-[#e74c3c] uppercase tracking-widest mb-3">Likelihood Factors</h4>
            <ul class="space-y-2.5">
              <li v-for="f in data.risk_scoring.base_scores.likelihood_factors" :key="f" class="flex items-start gap-2 text-[13px] text-[#64748b]">
                <div class="w-1 h-1 rounded-full bg-rose-400 mt-2 shrink-0"></div>
                <span>{{ f }}</span>
              </li>
            </ul>
          </div>
          <div v-if="data.risk_scoring.base_scores.severity_factors.length">
            <h4 class="text-[11px] font-bold text-[#f39c12] uppercase tracking-widest mb-3">Severity Factors</h4>
            <ul class="space-y-2.5">
              <li v-for="f in data.risk_scoring.base_scores.severity_factors" :key="f" class="flex items-start gap-2 text-[13px] text-[#64748b]">
                <div class="w-1 h-1 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                <span>{{ f }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Exposure Breakdown -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Exposure Breakdown</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-[#4f9690] font-medium">Ransomware Event</span>
            <span class="text-[14px] font-bold text-[#09423c]">{{ formatCurrency(data.risk_scoring.financial_exposure.ransomware_loss) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-[#4f9690] font-medium">Data Breach Loss</span>
            <span class="text-[14px] font-bold text-[#09423c]">{{ formatCurrency(data.risk_scoring.financial_exposure.data_breach_loss) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-[#4f9690] font-medium">Business Interruption</span>
            <span class="text-[14px] font-bold text-[#09423c]">{{ formatCurrency(data.risk_scoring.financial_exposure.bec_loss) }}</span>
          </div>
          <div class="pt-4 border-t border-[#f1f5f9]">
            <div class="flex justify-between items-end mb-1">
              <span class="text-[11px] font-bold text-[#09423c] uppercase tracking-widest">PML (99% CI)</span>
              <span class="text-[24px] font-black text-[#09423c]">{{ formatCurrency(data.risk_scoring.financial_exposure.pml_99) }}</span>
            </div>
            <p class="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tighter">Probable Maximum Loss Intelligence</p>
          </div>
        </div>
      </div>

      <!-- Asset Summary -->
      <div v-if="data.asset_summary" class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Inventory Intelligence</h3>
        <div class="space-y-5">
          <div v-for="cat in data.asset_summary.categories" :key="cat.category">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[12px] font-black text-[#4f9690] uppercase tracking-widest">{{ cat.display_name }}</span>
              <span class="text-[13px] font-black text-[#09423c]">{{ cat.count }}</span>
            </div>
            <div class="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <div 
                class="h-full bg-[#09423c] rounded-full"
                :style="{ width: `${(cat.count / Math.max(data.asset_summary.total_assets, 1)) * 100}%` }"
              ></div>
            </div>
            <div class="flex justify-between mt-2">
              <span class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter">{{ cat.linked_risks }} Linked Risks</span>
              <span v-if="cat.high_criticality > 0" class="text-[11px] font-bold text-[#f39c12] uppercase tracking-tighter">{{ cat.high_criticality }} High Impact</span>
            </div>
          </div>
        </div>
        <div class="mt-6 pt-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center rounded-lg p-4">
          <span class="text-[11px] font-bold text-[#09423c] uppercase tracking-widest">Managed Assets</span>
          <span class="text-[18px] font-black text-[#09423c]">{{ data.asset_summary.total_assets }}</span>
        </div>
      </div>

      <!-- Mitigation Roadmap -->
      <div v-if="data.priority_actions" class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <MitigationRoadmap :actions="data.priority_actions" />
      </div>

      <!-- Renewal Countdown -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <RenewalCountdown />
      </div>

      <!-- Critical Control Gaps -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <CriticalControlGapsTable 
          :red-flags="data.executive_summary.red_flags"
        />
      </div>
    </div>
</template>