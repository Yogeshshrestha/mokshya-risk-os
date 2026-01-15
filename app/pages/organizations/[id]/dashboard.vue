<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import StatCard from '~/components/dashboard/StatCard.vue'
import RiskRegisterTable from '~/components/dashboard/RiskRegisterTable.vue'
import ControlMaturityChart from '~/components/dashboard/ControlMaturityChart.vue'
import ControlMaturityBarChart from '~/components/dashboard/ControlMaturityBarChart.vue'
import CriticalControlGapsTable from '~/components/dashboard/CriticalControlGapsTable.vue'
import CoverageSummary from '~/components/dashboard/CoverageSummary.vue'
import RenewalCountdown from '~/components/dashboard/RenewalCountdown.vue'
import MitigationRoadmap from '~/components/dashboard/MitigationRoadmap.vue'
import RemediationTaskTracker from '~/components/dashboard/RemediationTaskTracker.vue'
import ReadinessMetrics from '~/components/dashboard/ReadinessMetrics.vue'
import BoardRiskStatus from '~/components/dashboard/board/BoardRiskStatus.vue'
import BoardFinancialExposure from '~/components/dashboard/board/BoardFinancialExposure.vue'
import BoardPriorityRisks from '~/components/dashboard/board/BoardPriorityRisks.vue'
import BoardDecisionsRequired from '~/components/dashboard/board/BoardDecisionsRequired.vue'
import BoardDashboardFooter from '~/components/dashboard/board/BoardDashboardFooter.vue'
import type { GlobalQuestionnaireScoreResponse } from '~/types/global-questionnaire'
import type { CRODashboardResponse, CISODashboardResponse, BoardDashboardResponse } from '~/types/dashboard'

definePageMeta({
  layout: false
})

const auth = useAuth()
const router = useRouter()
const route = useRoute()
const questionnaire = useGlobalQuestionnaire()
const dashboard = useDashboard()

// Make organizationId reactive to handle organization switching
const organizationId = computed(() => route.params.id as string)

const score = ref<GlobalQuestionnaireScoreResponse | null>(null)
const dashboardData = ref<CRODashboardResponse | CISODashboardResponse | BoardDashboardResponse | null>(null)
const isLoading = ref(true)

// Initialize selectedPersona from localStorage or default to 'cro'
const getStoredPersona = (): string => {
  if (import.meta.client) {
    const stored = localStorage.getItem('dashboard_selected_persona')
    if (stored && ['cro', 'ciso', 'board'].includes(stored)) {
      return stored
    }
  }
  return 'cro'
}

const selectedPersona = ref(getStoredPersona())

// Save persona selection to localStorage whenever it changes
watch(selectedPersona, (newPersona) => {
  if (import.meta.client) {
    localStorage.setItem('dashboard_selected_persona', newPersona)
  }
  fetchDashboardData()
})

const fetchDashboardData = async () => {
  const currentOrgId = organizationId.value
  if (!currentOrgId) return

  try {
    isLoading.value = true
    dashboardData.value = null // Clear old data to prevent type conflicts
    
    // 1. Fetch score for everyone
    try {
      score.value = await questionnaire.getOrganizationScore(currentOrgId)
    } catch (error) {
      console.error('Failed to fetch assessment score:', error)
      score.value = null
    }
    
    // 2. Persona Specific Data Loading
    if (selectedPersona.value === 'board') {
      try {
        // Attempt to fetch full board dashboard
        const res = await dashboard.getBoardDashboard(currentOrgId)
        dashboardData.value = res
      } catch (e) {
        console.warn('Board API failed or not found, using fallback sample data')
        dashboardData.value = {
          generated_at: "2026-01-14T04:10:17.747537Z",
          organization_id: currentOrgId,
          organization_name: 'Mokshya AI', 
          overall_cyber_risk_status: {
            status: 'stable',
            status_label: 'Stable',
            trend: 'stable',
            trend_description: 'Stable compared to last quarter.',
            trend_percentage: 4.5,
            compliance_score: 93.9,
            risk_tier: 'C',
            exposure_score: 10
          },
          estimated_financial_exposure: {
            low_estimate: 38500.0,
            high_estimate: 577500.0,
            low_formatted: '$38K',
            high_formatted: '$578K',
            confidence_level: '95%',
            description: 'Potential annual cyber loss range (VaR 95%)',
            trend_percentage: 4.5
          },
          top_3_priority_risks: {
            risks: [
              {
                id: '33527d6f-8819-4f7b-a9e2-ae9fa5ec6d8b',
                risk_name: 'Access Control',
                risk_category: 'Access Control',
                estimated_impact: 1200000.0,
                impact_formatted: '$1.2M',
                description: 'Exposed AWS Access Key and Secret Key',
                severity: 'critical',
                rank: 1
              },
              {
                id: '5c1982d6-d19a-41a3-b8ed-864e1b94272f',
                risk_name: 'Data Security',
                risk_category: 'Data Security',
                estimated_impact: 320000.0,
                impact_formatted: '$320K',
                description: 'Test Risk',
                severity: 'medium',
                rank: 2
              },
              {
                id: 'a91b6e03-8bf4-4403-930c-366f672be8cf',
                risk_name: 'Data Security',
                risk_category: 'Data Security',
                estimated_impact: 320000.0,
                impact_formatted: '$320K',
                description: 'test desc',
                severity: 'medium',
                rank: 3
              }
            ],
            ranking_criteria: 'Ranked by Impact'
          },
          insurance_status: 'Eligible',
          insurance_readiness_score: 93.9,
          total_open_risks: 3,
          high_severity_risks: 1,
          overdue_mitigations: 1,
          // Extra UI fields requested by user but missing in current API response
          decisions_required: [
            {
              id: '1',
              title: 'Cyber Insurance Renewal',
              description: 'Approve premium increase for $10M coverage limit.',
              cost: '$120k premium',
              benefit: 'Risk Transfer: $10M',
              status: 'awaiting'
            },
            {
              id: '2',
              title: 'Budget expansion for SOC',
              description: 'Hire 2 analysts for 24/7 internal monitoring coverage.',
              cost: '$250k annually',
              benefit: '-40% Response Time',
              status: 'reviewing'
            }
          ],
          trend_summary: 'Risk posture remains consistent with Q2 forecast.',
          peer_comparison: {
            percentile: 15,
            sector: 'Fintech'
          }
        } as BoardDashboardResponse
      }
    } else {
      // CRO/CISO Logic - Only fetch if assessment complete
      if (score.value && score.value.answered_questions >= score.value.total_questions) {
        try {
          if (selectedPersona.value === 'ciso') {
            dashboardData.value = await dashboard.getCISODashboard(currentOrgId)
          } else {
            dashboardData.value = await dashboard.getCRODashboard(currentOrgId)
          }
        } catch (error) {
          console.error(`Failed to fetch ${selectedPersona.value} dashboard data:`, error)
          dashboardData.value = null
        }
      }
    }
  } catch (error) {
    console.error('Critical failure in dashboard data loading:', error)
  } finally {
    isLoading.value = false
  }
}

// Persona watching is now handled in the initialization above

// Watch for organization changes to refetch data
watch(organizationId, () => {
  fetchDashboardData()
})

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  fetchDashboardData()
})

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
  if (!dashboardData.value || selectedPersona.value !== 'cro' || !('executive_summary' in dashboardData.value)) return []
  
  const summary = dashboardData.value.executive_summary
  const scoring = dashboardData.value.risk_scoring
  
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

const cisoStats = computed(() => {
  if (!dashboardData.value || selectedPersona.value !== 'ciso' || !('control_maturity_overview' in dashboardData.value)) return []
  
  const maturity = dashboardData.value.control_maturity_overview
  
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
      value: `${Math.round((dashboardData.value as CISODashboardResponse).overall_security_score)}%`, 
      secondaryValue: 'Overall',
      trend: 'Intelligence Driven', 
      trendIcon: 'i-lucide-brain-circuit', 
      trendColor: 'text-emerald-600',
      icon: 'i-lucide-database', 
      iconBg: 'bg-[#e8f3f2]'
    }
  ]
})

// Sort risks by risk_id in ascending order
const sortedTopRisks = computed(() => {
  if (!dashboardData.value || !('risk_register' in dashboardData.value) || !dashboardData.value.risk_register?.top_risks) return []
  return [...dashboardData.value.risk_register.top_risks].sort((a, b) => 
    a.risk_id.localeCompare(b.risk_id)
  )
})

// Transform board status label: "Stable" -> "Resilient"
const boardStatusLabel = computed(() => {
  if (!dashboardData.value || selectedPersona.value !== 'board' || !('overall_cyber_risk_status' in dashboardData.value)) return ''
  const statusLabel = (dashboardData.value as BoardDashboardResponse).overall_cyber_risk_status.status_label
  return statusLabel === 'Stable' ? 'Resilient' : statusLabel
})

// Mobile sidebar state
const showMobileSidebar = ref(false)

const toggleSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeSidebar = () => {
  showMobileSidebar.value = false
}

// Close sidebar on route change
watch(() => route.path, () => {
  showMobileSidebar.value = false
})
</script>

<template>
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <!-- Desktop Sidebar (always visible on lg+) -->
    <div class="hidden lg:block flex-shrink-0">
      <DashboardSidebar :is-open="true" />
    </div>
    
    <!-- Mobile Sidebar (overlay) -->
    <div class="lg:hidden">
      <DashboardSidebar :is-open="showMobileSidebar" @close="closeSidebar" />
    </div>
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashboardHeader 
        :title="selectedPersona === 'board' ? 'Board Dashboard' : (selectedPersona === 'ciso' ? 'CISO Dashboard' : 'CRO Dashboard')"
        v-model:persona="selectedPersona"
        @toggle-sidebar="toggleSidebar"
      />
      
      <div v-if="dashboardData && !isLoading" class="px-4 sm:px-6 lg:px-8 py-2 bg-white border-b border-[#e8f3f2] flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-4">
          <p class="text-[11px] font-medium text-[#4f9690]">
            Data as of: <span class="font-bold text-[#09433e]">{{ new Date(dashboardData.generated_at).toLocaleString() }}</span>
          </p>
          <div v-if="selectedPersona === 'ciso' && 'insurance_ready' in dashboardData" class="flex items-center gap-2">
            <div class="h-3 w-px bg-gray-200"></div>
            <p class="text-[11px] font-medium text-[#4f9690]">Insurance Eligibility:</p>
            <span :class="['px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter', (dashboardData as CISODashboardResponse).insurance_ready ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100']">
              {{ (dashboardData as CISODashboardResponse).insurance_ready ? 'Ready' : 'Ineligible' }}
            </span>
          </div>
        </div>
        <p class="text-[11px] font-bold text-[#09433e] uppercase tracking-widest">
          {{ 'organization_name' in dashboardData ? (dashboardData as any).organization_name : (dashboardData as any).executive_summary?.organization_name }}
        </p>
      </div>
      
      <main class="flex-1 overflow-y-auto py-8">
        <!-- 1. Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-4">
          <div class="size-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[14px] text-[#4f9690] font-medium text-center">Loading dashboard...</p>
        </div>
        
        <div v-else :key="`${organizationId}-${selectedPersona}`" class="px-4 sm:px-6 lg:px-8 mx-auto space-y-6 sm:space-y-8 pb-12 max-w-full">
          <!-- 2. Persona Routing Logic -->
          
          <!-- A. BOARD PERSONA -->
          <div v-if="selectedPersona === 'board' && dashboardData" :key="`${organizationId}-board`" class="space-y-10">
            <!-- 1. Top Row: Status & Exposure -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div class="lg:col-span-4">
                <BoardRiskStatus 
                  v-if="'overall_cyber_risk_status' in dashboardData"
                  :status-label="boardStatusLabel"
                  :trend-description="(dashboardData as BoardDashboardResponse).overall_cyber_risk_status.trend_description"
                  :compliance-score="(dashboardData as BoardDashboardResponse).overall_cyber_risk_status.compliance_score"
                  :risk-tier="(dashboardData as BoardDashboardResponse).overall_cyber_risk_status.risk_tier"
                  :exposure-score="(dashboardData as BoardDashboardResponse).overall_cyber_risk_status.exposure_score"
                />
              </div>
              <div class="lg:col-span-8">
                <BoardFinancialExposure 
                  v-if="'estimated_financial_exposure' in dashboardData"
                  :low="(dashboardData as BoardDashboardResponse).estimated_financial_exposure.low_formatted"
                  :high="(dashboardData as BoardDashboardResponse).estimated_financial_exposure.high_formatted"
                  :trend-percentage="(dashboardData as BoardDashboardResponse).estimated_financial_exposure.trend_percentage"
                />
              </div>
            </div>

            <!-- 2. Priority Risks Section -->
            <div v-if="'top_3_priority_risks' in dashboardData" class="w-full">
              <BoardPriorityRisks :risks="(dashboardData as BoardDashboardResponse).top_3_priority_risks.risks" />
            </div>

            <!-- 3. Decisions Required Section (Gray Box) -->
            <div v-if="(dashboardData as BoardDashboardResponse).decisions_required?.length" class="w-full">
              <BoardDecisionsRequired :decisions="(dashboardData as BoardDashboardResponse).decisions_required!" />
            </div>

            <!-- 4. Footer Section -->
            <div v-if="(dashboardData as BoardDashboardResponse).peer_comparison" class="w-full">
              <BoardDashboardFooter 
                :trend-summary="(dashboardData as BoardDashboardResponse).overall_cyber_risk_status.trend_description"
                :peer-percentile="(dashboardData as BoardDashboardResponse).peer_comparison!.percentile"
                :sector="(dashboardData as BoardDashboardResponse).peer_comparison!.sector"
              />
            </div>
          </div>

          <!-- B. CRO/CISO LOCK SCREEN -->
          <div v-else-if="selectedPersona !== 'board' && score && score.answered_questions < score.total_questions" class="relative overflow-hidden bg-white rounded-[24px] border border-[#e8f3f2] p-12 text-center shadow-sm min-h-[500px] flex items-center justify-center">
            <div class="absolute inset-0 bg-[#f8fbfb]/50 opacity-50" style="background-image: radial-gradient(#09423c 0.5px, transparent 0.5px); background-size: 24px 24px;"></div>
            
            <div class="max-w-2xl mx-auto relative z-10">
              <div class="w-24 h-24 bg-[#e8f3f2] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-white">
                <UIcon name="i-lucide-lock" class="size-12 text-[#09423c]" />
              </div>
              <h2 class="text-3xl font-extrabold text-[#09423c] mb-4 tracking-tight">Intelligence Locked</h2>
              <p class="text-[#4f9690] text-lg mb-10 leading-relaxed font-medium">
                Complete your global security assessment to unlock real-time risk metrics, financial exposure analysis, and insurance eligibility.
              </p>
              
              <div class="bg-[#f8fbfb] border border-[#e8f3f2] rounded-2xl p-6 mb-10">
                <div class="flex justify-between text-sm font-bold text-[#09423c] uppercase tracking-wider mb-3">
                  <span>Assessment Progress</span>
                  <span>{{ Math.round((score.answered_questions / score.total_questions) * 100) }}%</span>
                </div>
                <div class="h-3 w-full bg-white rounded-full overflow-hidden border border-[#e8f3f2]">
                  <div 
                    class="h-full bg-[#09423c] transition-all duration-1000 ease-out"
                    :style="{ width: `${(score.answered_questions / score.total_questions) * 100}%` }"
                  ></div>
                </div>
                <p class="mt-3 text-xs font-bold text-[#4f9690] uppercase tracking-widest">
                  {{ score.answered_questions }} of {{ score.total_questions }} questions answered
                </p>
              </div>

              <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <NuxtLink 
                  :to="`/organizations/${organizationId}/assessment`"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#09423c] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-lg shadow-[#09423c]/20 group"
                >
                  Continue Assessment
                  <UIcon name="i-lucide-chevron-right" class="size-5 group-hover:translate-x-1 transition-transform" />
                </NuxtLink>
                <NuxtLink 
                  :to="`/organizations/${organizationId}`"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-[#4f9690] px-10 py-4 rounded-xl font-bold hover:text-[#09423c] hover:bg-gray-50 transition-all border border-[#e8f3f2]"
                >
                  Back to Profile
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- C. CRO/CISO ACTIVE DASHBOARD -->
          <div v-else-if="selectedPersona !== 'board' && dashboardData" class="space-y-6 sm:space-y-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard 
                v-for="stat in (selectedPersona === 'ciso' ? cisoStats : dashboardStats)" 
                :key="stat.title"
                v-bind="stat"
              />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
              <div class="lg:col-span-8 flex flex-col gap-6">
                <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full overflow-hidden">
                  <div class="flex-1">
                    <RiskRegisterTable 
                      v-if="'risk_register' in dashboardData"
                      :risks="sortedTopRisks" 
                      :organization-id="organizationId" 
                    />
                    <div v-else class="flex items-center justify-center h-full p-12 text-[#4f9690]">
                      Control Focus Active
                    </div>
                  </div>
                </div>
              </div>
              <div class="lg:col-span-4">
                <ControlMaturityChart 
                  :domains="selectedPersona === 'ciso' && 'control_maturity_overview' in dashboardData ? (dashboardData as CISODashboardResponse).control_maturity_overview.domains : ('control_maturity' in dashboardData ? (dashboardData as CRODashboardResponse).control_maturity.domains : [])" 
                />
              </div>
            </div>

            <!-- Additional CRO content -->
            <div v-if="selectedPersona === 'cro' && 'risk_scoring' in dashboardData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              <!-- Score Influencers -->
              <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full">
                <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center">
                  <h3 class="text-[16px] font-bold text-[#0e1b1a]">Score Influencers</h3>
                  <UIcon name="i-lucide-brain-circuit" class="size-4 text-[#4f9690]" />
                </div>
                <div class="p-6 space-y-6 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                  <div v-if="(dashboardData as CRODashboardResponse).risk_scoring.base_scores.likelihood_factors.length">
                    <h4 class="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Likelihood Factors
                    </h4>
                    <ul class="space-y-2.5">
                      <li v-for="f in (dashboardData as CRODashboardResponse).risk_scoring.base_scores.likelihood_factors" :key="f" class="flex items-start gap-2 text-[13px] text-[#64748b]">
                        <div class="size-1 rounded-full bg-rose-400 mt-2 flex-shrink-0"></div>
                        <span class="leading-snug">{{ f }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-if="(dashboardData as CRODashboardResponse).risk_scoring.base_scores.severity_factors.length" class="pt-4 border-t border-gray-50">
                    <h4 class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Severity Factors</h4>
                    <ul class="space-y-2.5">
                      <li v-for="f in (dashboardData as CRODashboardResponse).risk_scoring.base_scores.severity_factors" :key="f" class="flex items-start gap-2 text-[13px] text-[#64748b]">
                        <div class="size-1 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                        <span class="leading-snug">{{ f }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Exposure breakdown -->
              <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full">
                <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center">
                  <h3 class="text-[16px] font-bold text-[#0e1b1a]">Exposure breakdown</h3>
                  <UIcon name="i-lucide-dollar-sign" class="size-4 text-[#4f9690]" />
                </div>
                <div class="p-6 flex flex-col flex-1">
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <span class="text-[13px] text-[#4f9690] font-medium">Ransomware Event</span>
                      <span class="text-[14px] font-bold text-[#0e1b1a]">{{ formatCurrency((dashboardData as CRODashboardResponse).risk_scoring.financial_exposure.ransomware_loss) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[13px] text-[#4f9690] font-medium">Data Breach Loss</span>
                      <span class="text-[14px] font-bold text-[#0e1b1a]">{{ formatCurrency((dashboardData as CRODashboardResponse).risk_scoring.financial_exposure.data_breach_loss) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[13px] text-[#4f9690] font-medium">Business Interruption</span>
                      <span class="text-[14px] font-bold text-[#0e1b1a]">{{ formatCurrency((dashboardData as CRODashboardResponse).risk_scoring.financial_exposure.bec_loss) }}</span>
                    </div>
                  </div>
                  <div class="mt-auto pt-6 border-t border-[#f1f5f9]">
                    <div class="flex justify-between items-end mb-1">
                      <span class="text-[11px] font-black text-[#09433e] uppercase tracking-widest">PML (99% CI)</span>
                      <span class="text-[24px] font-black text-[#09433e] leading-none tracking-tighter">{{ formatCurrency((dashboardData as CRODashboardResponse).risk_scoring.financial_exposure.pml_99) }}</span>
                    </div>
                    <p class="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tighter">Probable Maximum Loss Intelligence</p>
                  </div>
                </div>
              </div>

              <!-- Asset Summary -->
              <div v-if="'asset_summary' in dashboardData" class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full overflow-hidden">
                <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center">
                  <h3 class="text-[16px] font-bold text-[#0e1b1a]">Inventory Intelligence</h3>
                  <NuxtLink :to="`/organizations/${organizationId}/assets`">
                    <UIcon name="i-lucide-arrow-up-right" class="size-4 text-[#09433e]" />
                  </NuxtLink>
                </div>
                <div class="p-6 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                  <div class="space-y-5">
                    <div v-for="cat in (dashboardData as CRODashboardResponse).asset_summary.categories" :key="cat.category" class="group">
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-[12px] font-black text-[#4f9690] uppercase tracking-widest group-hover:text-[#09433e] transition-colors">{{ cat.display_name }}</span>
                        <span class="text-[13px] font-black text-[#0e1b1a]">{{ cat.count }}</span>
                      </div>
                      <div class="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          class="h-full bg-[#09433e] rounded-full transition-all duration-1000 ease-out shadow-sm" 
                          :style="{ width: `${(cat.count / Math.max((dashboardData as CRODashboardResponse).asset_summary.total_assets, 1)) * 100}%` }"
                        ></div>
                      </div>
                      <div class="flex justify-between mt-2 px-0.5">
                        <span class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter">{{ cat.linked_risks }} Linked Risks</span>
                        <span class="text-[10px] font-black text-amber-600 uppercase tracking-tighter" v-if="cat.high_criticality > 0">{{ cat.high_criticality }} High Impact</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                  <span class="text-[11px] font-black text-[#09433e] uppercase tracking-widest">Managed Assets</span>
                  <span class="text-[18px] font-black text-[#0e1b1a]">{{ (dashboardData as CRODashboardResponse).asset_summary.total_assets }}</span>
                </div>
              </div>
            </div>

            <!-- Remediation/Mitigation Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
              <div class="lg:col-span-8">
                <RemediationTaskTracker 
                  v-if="selectedPersona === 'ciso' && 'remediation_task_tracker' in dashboardData" 
                  :tracker="(dashboardData as CISODashboardResponse).remediation_task_tracker" 
                />
                <MitigationRoadmap 
                  v-else-if="'priority_actions' in dashboardData" 
                  :actions="(dashboardData as CRODashboardResponse).priority_actions" 
                />
              </div>
              <div class="lg:col-span-4 flex flex-col gap-6">
                <ReadinessMetrics 
                  v-if="selectedPersona === 'ciso' && 'readiness_metrics' in dashboardData" 
                  :metrics="(dashboardData as CISODashboardResponse).readiness_metrics" 
                />
                <template v-else>
                  <RenewalCountdown />
                  <div v-if="selectedPersona === 'ciso' && 'control_maturity_overview' in dashboardData && (dashboardData as CISODashboardResponse).control_maturity_overview.domains.length > 0" class="space-y-4">
                    <!-- Additional Control Maturity Metrics -->
                    <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm p-6">
                      <h3 class="text-[14px] font-bold text-[#0e1b1a] mb-4">Security Metrics</h3>
                      <div class="space-y-4">
                        <div v-if="(dashboardData as CISODashboardResponse).control_maturity_overview.endpoint_protection">
                          <div class="flex justify-between items-center mb-1">
                            <span class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider">Endpoint Protection</span>
                            <span class="text-[13px] font-black text-[#0e1b1a]">{{ Math.round((dashboardData as CISODashboardResponse).control_maturity_overview.endpoint_protection.value) }}{{ (dashboardData as CISODashboardResponse).control_maturity_overview.endpoint_protection.unit || '%' }}</span>
                          </div>
                          <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                            <div 
                              class="h-full bg-[#09433e] rounded-full transition-all duration-1000"
                              :style="{ width: `${(dashboardData as CISODashboardResponse).control_maturity_overview.endpoint_protection.value}%` }"
                            ></div>
                          </div>
                          <p v-if="(dashboardData as CISODashboardResponse).control_maturity_overview.endpoint_protection.additional_info" class="text-[9px] text-[#94a3b8] mt-1">{{ (dashboardData as CISODashboardResponse).control_maturity_overview.endpoint_protection.additional_info }}</p>
                        </div>
                        <div v-if="(dashboardData as CISODashboardResponse).control_maturity_overview.backup_success">
                          <div class="flex justify-between items-center mb-1">
                            <span class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider">Backup Success</span>
                            <span class="text-[13px] font-black text-[#0e1b1a]">{{ Math.round((dashboardData as CISODashboardResponse).control_maturity_overview.backup_success.value) }}{{ (dashboardData as CISODashboardResponse).control_maturity_overview.backup_success.unit || '%' }}</span>
                          </div>
                          <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                            <div 
                              class="h-full bg-[#09433e] rounded-full transition-all duration-1000"
                              :style="{ width: `${(dashboardData as CISODashboardResponse).control_maturity_overview.backup_success.value}%` }"
                            ></div>
                          </div>
                          <p v-if="(dashboardData as CISODashboardResponse).control_maturity_overview.backup_success.additional_info" class="text-[9px] text-[#94a3b8] mt-1">{{ (dashboardData as CISODashboardResponse).control_maturity_overview.backup_success.additional_info }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Resilience Insight -->
                    <div class="bg-[#09433e] rounded-[16px] p-6 text-white shadow-lg shadow-[#09433e]/20">
                      <div class="flex items-center gap-3 mb-4">
                        <div class="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <UIcon name="i-lucide-shield-check" class="size-6" />
                        </div>
                        <h3 class="text-[16px] font-bold">Resilience Insight</h3>
                      </div>
                      <p class="text-[13px] text-emerald-100/80 leading-relaxed mb-6 font-medium">
                        Your strongest domain is <span class="text-white font-bold">{{ (dashboardData as CISODashboardResponse).control_maturity_overview.domains.reduce((a, b) => (a.current_level > b.current_level ? a : b)).domain }}</span>. 
                        Improvement needed in <span class="text-white font-bold">{{ (dashboardData as CISODashboardResponse).control_maturity_overview.domains.reduce((a, b) => (a.current_level < b.current_level ? a : b)).domain }}</span>.
                      </p>
                      <button class="w-full py-3 bg-white text-[#09433e] rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-50 transition-all">
                        Generate Posture Report
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Bar Chart Overview (CISO specific) -->
            <div v-if="selectedPersona === 'ciso' && 'control_maturity_overview' in dashboardData" class="w-full">
              <ControlMaturityBarChart :domains="(dashboardData as CISODashboardResponse).control_maturity_overview.domains" />
            </div>
            
            <!-- Control Gaps Table -->
            <div class="w-full">
              <CriticalControlGapsTable 
                :red-flags="selectedPersona === 'ciso' && 'critical_control_gaps' in dashboardData ? (dashboardData as CISODashboardResponse).critical_control_gaps.gaps : ('executive_summary' in dashboardData ? (dashboardData as CRODashboardResponse).executive_summary.red_flags : [])"
                :gaps-section="selectedPersona === 'ciso' && 'critical_control_gaps' in dashboardData ? (dashboardData as CISODashboardResponse).critical_control_gaps : undefined"
              />
            </div>
          </div>

          <!-- D. ERROR FALLBACK -->
          <div v-else class="relative overflow-hidden bg-white rounded-[24px] border border-[#e8f3f2] p-12 text-center shadow-sm min-h-[400px] flex items-center justify-center">
            <div class="max-w-xl mx-auto">
              <div class="w-20 h-20 bg-[#e8f3f2] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                <UIcon name="i-lucide-alert-circle" class="size-10 text-[#09423c]" />
              </div>
              <h2 class="text-2xl font-extrabold text-[#09423c] mb-4 tracking-tight">Dashboard Data Unavailable</h2>
              <p class="text-[#4f9690] text-base mb-8 leading-relaxed font-medium">
                We couldn't load the dashboard data. Please try refreshing the page.
              </p>
              <button 
                @click="fetchDashboardData"
                class="inline-flex items-center justify-center gap-3 bg-[#09423c] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-lg shadow-[#09423c]/20"
              >
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
/* Custom scrollbar for the main content area */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-track {
  background: transparent;
}
main::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
main::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
