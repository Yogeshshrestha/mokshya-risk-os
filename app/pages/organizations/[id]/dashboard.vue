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
import type { GlobalQuestionnaireScoreResponse } from '~/types/global-questionnaire'
import type { CRODashboardResponse } from '~/types/dashboard'

definePageMeta({
  layout: false
})

const auth = useAuth()
const router = useRouter()
const route = useRoute()
const questionnaire = useGlobalQuestionnaire()
const dashboard = useDashboard()
const organizationId = route.params.id as string

const score = ref<GlobalQuestionnaireScoreResponse | null>(null)
const dashboardData = ref<CRODashboardResponse | null>(null)
const isLoading = ref(true)
const selectedPersona = ref('cro')

const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    // Fetch both assessment score and full CRO dashboard
    const [scoreRes, dashboardRes] = await Promise.all([
      questionnaire.getOrganizationScore(organizationId),
      dashboard.getCRODashboard(organizationId)
    ])
    score.value = scoreRes
    dashboardData.value = dashboardRes
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  fetchDashboardData()
})

const formatCurrency = (val: number) => {
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(1)}M`
  }
  if (val >= 1000) {
    return `$${Math.round(val / 1000).toLocaleString()}K`
  }
  return `$${Math.round(val).toLocaleString()}`
}

const dashboardStats = computed(() => {
  if (!dashboardData.value) return []
  
  const summary = dashboardData.value.executive_summary
  
  return [
    { 
      title: 'Risk Tier', 
      value: `Tier ${summary.risk_grade}`, 
      trend: summary.risk_trend === 'improving' ? 'Improving' : summary.risk_trend === 'worsening' ? 'Action required' : 'Stable', 
      trendIcon: summary.risk_trend === 'improving' ? 'i-lucide-trending-down' : summary.risk_trend === 'worsening' ? 'i-lucide-trending-up' : 'i-lucide-arrow-right', 
      trendColor: summary.risk_trend === 'improving' ? 'text-[#16a34a]' : summary.risk_trend === 'worsening' ? 'text-[#dc2626]' : 'text-[#4f9690]',
      icon: 'i-lucide-layers' 
    },
    { 
      title: 'Financial Exposure', 
      value: formatCurrency(summary.financial_exposure.total_estimated_exposure_usd), 
      trend: `${summary.compliance_score.toFixed(1)}% Compliance`, 
      trendIcon: 'i-lucide-dollar-sign', 
      icon: 'i-lucide-dollar-sign' 
    },
    { 
      title: 'Red Flags', 
      value: summary.red_flags_count.toString(), 
      trend: `${summary.critical_red_flags} critical issues`, 
      trendIcon: 'i-lucide-flag', 
      trendColor: summary.critical_red_flags > 0 ? 'text-[#dc2626]' : 'text-[#16a34a]', 
      icon: 'i-lucide-flag', 
      iconBg: summary.critical_red_flags > 0 ? 'bg-[#fef2f2]' : 'bg-[#e8f3f2]' 
    },
    { 
      title: 'Insurance Eligibility', 
      value: summary.insurance_readiness.eligibility.charAt(0).toUpperCase() + summary.insurance_readiness.eligibility.slice(1), 
      trend: `Score: ${summary.insurance_readiness.score}/100`, 
      trendIcon: 'i-lucide-check-circle', 
      icon: 'i-lucide-shield-check', 
      valueColor: summary.insurance_readiness.eligibility === 'eligible' ? 'text-[#09433e]' : (summary.insurance_readiness.eligibility === 'conditional' ? 'text-[#854d0e]' : 'text-[#dc2626]')
    }
  ]
})

const cisoStats = computed(() => {
  if (!dashboardData.value) return []
  
  const maturity = dashboardData.value.control_maturity
  const assets = dashboardData.value.asset_summary
  
  // Mapping API fields to CISO dashboard layout (using best matches)
  return [
    { 
      title: 'Overall Maturity', 
      value: `${Math.round(maturity.overall_maturity_score)}%`, 
      secondaryValue: `/ ${maturity.overall_maturity_level}`,
      trend: `Maturity level: ${maturity.overall_maturity_level}`, 
      trendIcon: 'i-lucide-trending-up', 
      trendColor: 'text-[#16a34a]', 
      icon: 'i-lucide-zap',
      iconBg: 'bg-[#e8f3f2]'
    },
    { 
      title: 'Asset Coverage', 
      value: `${Math.round((assets.active_assets / assets.total_assets) * 100)}%`, 
      trend: `${assets.total_assets} total assets`, 
      trendIcon: 'i-lucide-minus', 
      trendColor: 'text-[#4f9690]', 
      icon: 'i-lucide-fingerprint',
      iconBg: 'bg-[#e8f3f2]'
    },
    { 
      title: 'High Risk Assets', 
      value: assets.assets_with_high_risks.toString(), 
      trend: `${assets.high_criticality} high criticality`, 
      trendIcon: 'i-lucide-alert-triangle', 
      trendColor: assets.assets_with_high_risks > 0 ? 'text-[#dc2626]' : 'text-[#16a34a]', 
      icon: 'i-lucide-shield', 
      iconBg: assets.assets_with_high_risks > 0 ? 'bg-[#fef2f2]' : 'bg-[#e8f3f2]' 
    },
    { 
      title: 'Critical Gaps', 
      value: maturity.domains.reduce((sum, d) => sum + (d.critical_gaps?.length || 0), 0).toString(), 
      secondaryValue: 'Detected',
      trend: 'Across all domains', 
      trendIcon: 'i-lucide-check-circle', 
      icon: 'i-lucide-database', 
      iconBg: 'bg-[#e8f3f2]'
    }
  ]
})
</script>

<template>
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <DashboardSidebar />
    
    <div class="flex-1 flex flex-col min-w-0">
      <DashboardHeader 
        :title="selectedPersona === 'ciso' ? 'CISO Dashboard' : 'CRO Dashboard'"
        v-model:persona="selectedPersona"
      />
      
      <main class="flex-1 overflow-y-auto py-8">
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <div class="w-12 h-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="score" class="px-4 sm:px-6 lg:px-8 mx-auto space-y-8">
          <!-- Assessment Incomplete Notice -->
          <div v-if="score.answered_questions < score.total_questions" class="relative overflow-hidden bg-white rounded-[24px] border border-[#e8f3f2] p-12 text-center shadow-sm min-h-[500px] flex items-center justify-center">
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

          <!-- Dashboard Content (only visible if assessment complete) -->
          <template v-else>
            <!-- CRO View (Stats at Top) -->
            <template v-if="selectedPersona !== 'ciso'">
              <!-- Stats Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  v-for="stat in dashboardStats" 
                  :key="stat.title"
                  v-bind="stat"
                />
              </div>

              <!-- Middle Row -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div class="lg:col-span-8">
                  <RiskRegisterTable :risks="dashboardData.risk_register.top_risks" />
                </div>
                <div class="lg:col-span-4">
                  <ControlMaturityChart :domains="dashboardData.control_maturity.domains" />
                </div>
              </div>
              
              <!-- Bottom Row -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <CoverageSummary />
                <RenewalCountdown />
                <MitigationRoadmap :actions="dashboardData.priority_actions" />
              </div>
            </template>

            <!-- CISO View (Bar Chart -> Stats -> Table) -->
            <template v-else>
              <!-- Top Section: Bar Chart -->
              <div class="w-full">
                <ControlMaturityBarChart :domains="dashboardData.control_maturity.domains" />
              </div>
              
              <!-- Middle Section: Stats Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  v-for="stat in cisoStats" 
                  :key="stat.title"
                  v-bind="stat"
                />
              </div>

              <!-- Bottom Section: Table -->
              <div class="w-full">
                <CriticalControlGapsTable :red-flags="dashboardData.executive_summary.red_flags" />
              </div>
            </template>
          </template>
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

