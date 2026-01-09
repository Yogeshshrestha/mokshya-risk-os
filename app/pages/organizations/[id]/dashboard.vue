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
  if (!dashboardData.value) return []
  
  const maturity = dashboardData.value.control_maturity
  const assets = dashboardData.value.asset_summary
  
  return [
    { 
      title: 'Control Maturity', 
      value: `${Math.round(maturity.overall_maturity_score)}%`, 
      secondaryValue: maturity.overall_maturity_level.toUpperCase(),
      trend: `Strongest: ${maturity.strongest_domain}`, 
      trendIcon: 'i-lucide-trending-up', 
      trendColor: 'text-emerald-600', 
      icon: 'i-lucide-zap',
      iconBg: 'bg-emerald-50'
    },
    { 
      title: 'Asset Coverage', 
      value: `${Math.round((assets.active_assets / Math.max(assets.total_assets, 1)) * 100)}%`, 
      trend: `${assets.total_assets} Managed Assets`, 
      trendIcon: 'i-lucide-minus', 
      trendColor: 'text-slate-500', 
      icon: 'i-lucide-fingerprint',
      iconBg: 'bg-[#e8f3f2]'
    },
    { 
      title: 'High Risk Assets', 
      value: assets.assets_with_high_risks.toString(), 
      trend: `${assets.high_criticality} Critical Impact`, 
      trendIcon: 'i-lucide-alert-triangle', 
      trendColor: assets.assets_with_high_risks > 0 ? 'text-rose-600' : 'text-emerald-600', 
      icon: 'i-lucide-shield', 
      iconBg: assets.assets_with_high_risks > 0 ? 'bg-rose-50' : 'bg-[#e8f3f2]' 
    },
    { 
      title: 'Compliance Score', 
      value: `${Math.round(dashboardData.value.executive_summary.compliance_score)}%`, 
      secondaryValue: 'Overall',
      trend: 'Based on last assessment', 
      trendIcon: 'i-lucide-check-circle', 
      trendColor: 'text-emerald-600',
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
        
        <div v-else-if="score && dashboardData" class="px-4 sm:px-6 lg:px-8 mx-auto space-y-8 pb-12">
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
            <!-- 1. Stats Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                v-for="stat in (selectedPersona === 'ciso' ? cisoStats : dashboardStats)" 
                :key="stat.title"
                v-bind="stat"
              />
            </div>

            <!-- 2. Primary Intelligence Row -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div class="lg:col-span-8 flex flex-col gap-6">
                <!-- Risk Register Summary -->
                <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full overflow-hidden">
                  <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 class="text-[18px] font-bold text-[#0e1b1a]">Primary Risk Vectors</h3>
                    <NuxtLink :to="`/organizations/${organizationId}/risks`" class="text-[13px] font-bold text-[#09433e] hover:underline">
                      View Register
                    </NuxtLink>
                  </div>
                  <div class="flex-1">
                    <RiskRegisterTable :risks="dashboardData.risk_register.top_risks" />
                  </div>
                </div>
              </div>
              <div class="lg:col-span-4">
                <ControlMaturityChart :domains="dashboardData.control_maturity.domains" />
              </div>
            </div>

            <!-- 3. Intelligence Row 2 (Insights, Exposure, Assets) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              <!-- Risk Factors -->
              <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full">
                <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center">
                  <h3 class="text-[16px] font-bold text-[#0e1b1a]">Score Influencers</h3>
                  <UIcon name="i-lucide-brain-circuit" class="size-4 text-[#4f9690]" />
                </div>
                <div class="p-6 space-y-6 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                  <div v-if="dashboardData.risk_scoring.base_scores.likelihood_factors.length">
                    <h4 class="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Likelihood Factors
                    </h4>
                    <ul class="space-y-2.5">
                      <li v-for="f in dashboardData.risk_scoring.base_scores.likelihood_factors" :key="f" class="flex items-start gap-2 text-[13px] text-[#64748b]">
                        <div class="size-1 rounded-full bg-rose-400 mt-2 flex-shrink-0"></div>
                        <span class="leading-snug">{{ f }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-if="dashboardData.risk_scoring.base_scores.severity_factors.length" class="pt-4 border-t border-gray-50">
                    <h4 class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Severity Factors</h4>
                    <ul class="space-y-2.5">
                      <li v-for="f in dashboardData.risk_scoring.base_scores.severity_factors" :key="f" class="flex items-start gap-2 text-[13px] text-[#64748b]">
                        <div class="size-1 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                        <span class="leading-snug">{{ f }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Exposure Breakdown -->
              <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full">
                <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center">
                  <h3 class="text-[16px] font-bold text-[#0e1b1a]">Exposure breakdown</h3>
                  <UIcon name="i-lucide-dollar-sign" class="size-4 text-[#4f9690]" />
                </div>
                <div class="p-6 flex flex-col flex-1">
                  <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <span class="text-[13px] text-[#4f9690] font-medium">Ransomware Event</span>
                      <span class="text-[14px] font-bold text-[#0e1b1a]">{{ formatCurrency(dashboardData.risk_scoring.financial_exposure.ransomware_loss) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[13px] text-[#4f9690] font-medium">Data Breach Loss</span>
                      <span class="text-[14px] font-bold text-[#0e1b1a]">{{ formatCurrency(dashboardData.risk_scoring.financial_exposure.data_breach_loss) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-[13px] text-[#4f9690] font-medium">Business Interruption</span>
                      <span class="text-[14px] font-bold text-[#0e1b1a]">{{ formatCurrency(dashboardData.risk_scoring.financial_exposure.bec_loss) }}</span>
                    </div>
                  </div>
                  <div class="mt-auto pt-6 border-t border-[#f1f5f9]">
                    <div class="flex justify-between items-end mb-1">
                      <span class="text-[11px] font-black text-[#09433e] uppercase tracking-widest">PML (99% CI)</span>
                      <span class="text-[24px] font-black text-[#09433e] leading-none tracking-tighter">{{ formatCurrency(dashboardData.risk_scoring.financial_exposure.pml_99) }}</span>
                    </div>
                    <p class="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tighter">Probable Maximum Loss Intelligence</p>
                  </div>
                </div>
              </div>

              <!-- Asset Summary -->
              <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full overflow-hidden">
                <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center">
                  <h3 class="text-[16px] font-bold text-[#0e1b1a]">Inventory Intelligence</h3>
                  <NuxtLink :to="`/organizations/${organizationId}/assets`">
                    <UIcon name="i-lucide-arrow-up-right" class="size-4 text-[#09433e]" />
                  </NuxtLink>
                </div>
                <div class="p-6 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                  <div class="space-y-5">
                    <div v-for="cat in dashboardData.asset_summary.categories" :key="cat.category" class="group">
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-[12px] font-black text-[#4f9690] uppercase tracking-widest group-hover:text-[#09433e] transition-colors">{{ cat.display_name }}</span>
                        <span class="text-[13px] font-black text-[#0e1b1a]">{{ cat.count }}</span>
                      </div>
                      <div class="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          class="h-full bg-[#09433e] rounded-full transition-all duration-1000 ease-out shadow-sm" 
                          :style="{ width: `${(cat.count / Math.max(dashboardData.asset_summary.total_assets, 1)) * 100}%` }"
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
                  <span class="text-[18px] font-black text-[#0e1b1a]">{{ dashboardData.asset_summary.total_assets }}</span>
                </div>
              </div>
            </div>

            <!-- 4. Planning & Actions Row -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div class="lg:col-span-8">
                <MitigationRoadmap :actions="dashboardData.priority_actions" />
              </div>
              <div class="lg:col-span-4 flex flex-col gap-6">
                <RenewalCountdown />
                <!-- CISO Specific Insight -->
                <div v-if="selectedPersona === 'ciso'" class="bg-[#09433e] rounded-[16px] p-6 text-white shadow-lg shadow-[#09433e]/20">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <UIcon name="i-lucide-shield-check" class="size-6" />
                    </div>
                    <h3 class="text-[16px] font-bold">Resilience Insight</h3>
                  </div>
                  <p class="text-[13px] text-emerald-100/80 leading-relaxed mb-6 font-medium">
                    Your strongest domain is <span class="text-white font-bold">{{ dashboardData.control_maturity.strongest_domain }}</span>. Consider cross-pollinating these controls to improve <span class="text-white font-bold">{{ dashboardData.control_maturity.weakest_domain }}</span>.
                  </p>
                  <button class="w-full py-3 bg-white text-[#09433e] rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-50 transition-all">
                    Generate Posture Report
                  </button>
                </div>
              </div>
            </div>

            <!-- 5. Bar Chart Overview (CISO specific) -->
            <div v-if="selectedPersona === 'ciso'" class="w-full">
              <ControlMaturityBarChart :domains="dashboardData.control_maturity.domains" />
            </div>
            
            <!-- 6. Control Gaps (Red Flags List) -->
            <div class="w-full">
              <CriticalControlGapsTable :red-flags="dashboardData.executive_summary.red_flags" />
            </div>
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

