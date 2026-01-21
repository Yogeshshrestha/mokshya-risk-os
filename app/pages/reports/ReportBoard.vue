<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDashboard } from '~/composables/useDashboard'
import { useOrganization } from '~/composables/useOrganization'
import BoardRiskStatus from '~/components/dashboard/board/BoardRiskStatus.vue'
import BoardFinancialExposure from '~/components/dashboard/board/BoardFinancialExposure.vue'
import BoardPriorityRisks from '~/components/dashboard/board/BoardPriorityRisks.vue'
import BoardRiskMetrics from '~/components/dashboard/board/BoardRiskMetrics.vue'
import BoardDecisionsRequired from '~/components/dashboard/board/BoardDecisionsRequired.vue'
import BoardDashboardFooter from '~/components/dashboard/board/BoardDashboardFooter.vue'
import type { BoardDashboardResponse } from '~/types/dashboard'

const props = defineProps<{ organizationId: string }>()

const dashboard = useDashboard()
const orgApi = useOrganization()
const isLoading = ref(true)
const data = ref<BoardDashboardResponse | null>(null)
const organization = ref<any>(null)

onMounted(async () => {
  try {
    organization.value = await orgApi.getOrganization(props.organizationId)
    data.value = await dashboard.getBoardDashboard(props.organizationId)
  } catch (e) {
    console.error('ReportBoard load failed', e)
  } finally {
    isLoading.value = false

    // Wait for DOM + charts to render and trigger resize so chart libraries can reflow
    await nextTick()
    try { window.dispatchEvent(new Event('resize')) } catch (e) { /* ignore */ }
    await new Promise(resolve => setTimeout(resolve, 300))

    // Notify any listeners that this report is ready for capture
    try {
      window.dispatchEvent(new CustomEvent('report-ready', { detail: { persona: 'board' } }))
    } catch (e) { /* ignore */ }
  }
})
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-100">
    <div class="text-sm text-gray-500">Preparing Board report...</div>
  </div>

  <div v-else-if="data" class="space-y-6">
      <!-- Risk Status -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <BoardRiskStatus 
          :status-label="data.overall_cyber_risk_status.status_label"
          :trend-description="data.overall_cyber_risk_status.trend_description"
          :compliance-score="data.overall_cyber_risk_status.compliance_score"
          :risk-tier="data.overall_cyber_risk_status.risk_tier"
          :exposure-score="data.overall_cyber_risk_status.exposure_score"
          :trend="data.overall_cyber_risk_status.trend"
          :trend-percentage="data.overall_cyber_risk_status.trend_percentage"
        />
      </div>

      <!-- Financial Exposure -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <BoardFinancialExposure 
          :low="data.estimated_financial_exposure.low_formatted"
          :high="data.estimated_financial_exposure.high_formatted"
          :trend-percentage="data.estimated_financial_exposure.trend_percentage"
          :confidence-level="data.estimated_financial_exposure.confidence_level"
          :description="data.estimated_financial_exposure.description"
          :exposure-breakdown="data.estimated_financial_exposure.exposure_breakdown"
          :pml99="data.estimated_financial_exposure.pml_99_formatted"
        />
      </div>

      <!-- Risk Metrics -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <BoardRiskMetrics 
          :insurance-status="data.insurance_status"
          :insurance-readiness-score="data.insurance_readiness_score"
          :total-open-risks="data.total_open_risks"
          :high-severity-risks="data.high_severity_risks"
          :overdue-mitigations="data.overdue_mitigations"
        />
      </div>

      <!-- Priority Risks -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <BoardPriorityRisks 
          :risks="data.top_3_priority_risks.risks"
          :ranking-criteria="data.top_3_priority_risks.ranking_criteria"
        />
      </div>

      <!-- Insurance Status -->
      <div class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <h3 class="text-[16px] font-extrabold text-[#09423c] mb-4">Insurance Readiness</h3>
        <div class="space-y-3 text-[14px]">
          <div class="flex justify-between">
            <span class="text-[#6b8a87] font-medium">Status</span>
            <span class="font-bold text-[#09423c]">{{ data.insurance_status }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#6b8a87] font-medium">Readiness Score</span>
            <span class="font-bold text-[#09423c]">{{ data.insurance_readiness_score }}%</span>
          </div>
        </div>
      </div>

      <!-- Decisions Required -->
      <div v-if="data.decisions_required?.length" class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <BoardDecisionsRequired :decisions="data.decisions_required" />
      </div>

      <!-- Dashboard Footer (Peer Comparison & Trend Summary) -->
      <div v-if="data.peer_comparison" class="bg-white rounded-[20px] border border-[#e8f3f2] p-6 shadow-sm">
        <BoardDashboardFooter 
          :trend-summary="data.trend_summary || ''"
          :peer-percentile="data.peer_comparison.percentile"
          :sector="data.peer_comparison.sector"
        />
      </div>
    </div>
</template>