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

definePageMeta({
  layout: false
})

const auth = useAuth()
const router = useRouter()
const route = useRoute()
const questionnaire = useGlobalQuestionnaire()
const organizationId = route.params.id as string

const score = ref<GlobalQuestionnaireScoreResponse | null>(null)
const isLoading = ref(true)
const selectedPersona = ref('cro')

const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    score.value = await questionnaire.getOrganizationScore(organizationId)
    
    // If assessment not completed, redirect back to profile (optional but good for strictness)
    if (score.value && score.value.answered_questions < score.value.total_questions) {
      console.log('Assessment not completed, redirecting...')
      router.push(`/organizations/${organizationId}`)
    }
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
  if (!score.value) return []
  
  const minExposure = score.value.risk_percentage * 50000
  const maxExposure = score.value.risk_percentage * 100000
  
  return [
    { 
      title: 'Risk Tier', 
      value: `Tier ${score.value.risk_grade}`, 
      trend: 'Stable since last check', 
      trendIcon: 'i-lucide-arrow-right', 
      icon: 'i-lucide-layers' 
    },
    { 
      title: 'Financial Exposure', 
      value: `${formatCurrency(minExposure)} - ${formatCurrency(maxExposure)}`, 
      trend: `${score.value.compliance_percentage.toFixed(1)}% Compliance`, 
      trendIcon: 'i-lucide-trending-down', 
      trendColor: 'text-[#16a34a]', 
      icon: 'i-lucide-dollar-sign' 
    },
    { 
      title: 'Red Flags', 
      value: score.value.red_flags_count.toString(), 
      trend: `${score.value.red_flags?.length || 0} critical issues`, 
      trendIcon: 'i-lucide-trending-up', 
      trendColor: score.value.red_flags_count > 0 ? 'text-[#dc2626]' : 'text-[#16a34a]', 
      icon: 'i-lucide-flag', 
      iconBg: score.value.red_flags_count > 0 ? 'bg-[#fef2f2]' : 'bg-[#e8f3f2]' 
    },
    { 
      title: 'Insurance Eligibility', 
      value: score.value.compliance_percentage > 70 ? 'Eligible' : 'At Risk', 
      trend: 'Verified today', 
      trendIcon: 'i-lucide-check-circle', 
      icon: 'i-lucide-shield-check', 
      valueColor: score.value.compliance_percentage > 70 ? 'text-[#09433e]' : 'text-[#dc2626]' 
    }
  ]
})

const cisoStats = computed(() => {
  if (!score.value) return []
  
  return [
    { 
      title: 'Patch Velocity', 
      value: '88%', 
      secondaryValue: '/ 24hrs',
      trend: '+4.2% vs last month', 
      trendIcon: 'i-lucide-trending-up', 
      trendColor: 'text-[#16a34a]', 
      icon: 'i-lucide-zap',
      iconBg: 'bg-[#e8f3f2]'
    },
    { 
      title: 'MFA Coverage', 
      value: '99.2%', 
      trend: 'Stable', 
      trendIcon: 'i-lucide-minus', 
      trendColor: 'text-[#4f9690]', 
      icon: 'i-lucide-fingerprint',
      iconBg: 'bg-[#e8f3f2]'
    },
    { 
      title: 'Endpoint Protection', 
      value: '96%', 
      trend: '42 Unprotected Assets', 
      trendIcon: 'i-lucide-alert-triangle', 
      trendColor: 'text-[#dc2626]', 
      icon: 'i-lucide-shield', 
      iconBg: 'bg-[#fef2f2]' 
    },
    { 
      title: 'Backup Success', 
      value: '100%', 
      secondaryValue: '/ Last Test',
      trend: 'Verified Yesterday', 
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
      
      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <div class="w-12 h-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="score" class="max-w-[1600px] mx-auto space-y-8">
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
                <RiskRegisterTable />
              </div>
              <div class="lg:col-span-4">
                <ControlMaturityChart :scores="score.category_scores" />
              </div>
            </div>
            
            <!-- Bottom Row -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              <CoverageSummary />
              <RenewalCountdown />
              <MitigationRoadmap />
            </div>
          </template>

          <!-- CISO View (Bar Chart -> Stats -> Table) -->
          <template v-else>
            <!-- Top Section: Bar Chart -->
            <div class="w-full">
              <ControlMaturityBarChart :scores="score.category_scores" />
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
              <CriticalControlGapsTable />
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

