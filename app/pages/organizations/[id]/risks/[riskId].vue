<script setup lang="ts">
import type { RiskWithAssets, RiskCategory, RiskRating, RiskStatus, RiskTreatment, AssetType, BusinessCriticality } from '~/types/asset-risk'

definePageMeta({
  layout: false
})

const route = useRoute()
const organizationId = route.params.id as string
const riskId = route.params.riskId as string
const riskApi = useRisk()

const risk = ref<RiskWithAssets | null>(null)
const isLoading = ref(true)
const selectedPersona = ref('cro')

const fetchData = async () => {
  try {
    isLoading.value = true
    risk.value = await riskApi.getRisk(organizationId, riskId)
  } catch (error) {
    console.error('Failed to fetch risk:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

const getRatingBadge = (rating: RiskRating) => {
  switch (rating) {
    case 'high': return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const getStatusBadge = (status: RiskStatus) => {
  switch (status) {
    case 'open': return 'bg-rose-50 text-rose-600'
    case 'in_progress': return 'bg-blue-50 text-blue-600'
    case 'mitigated': return 'bg-emerald-50 text-emerald-600'
    case 'accepted': return 'bg-gray-50 text-gray-600'
    default: return 'bg-gray-50 text-gray-600'
  }
}

const riskCategories = [
  { value: 'data_security', label: 'Data Security', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { value: 'access_control', label: 'Access Control', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { value: 'network', label: 'Network', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18' },
  { value: 'third_party', label: 'Third Party', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { value: 'compliance', label: 'Compliance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { value: 'operational', label: 'Operational', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
]

const getCategoryIcon = (category: RiskCategory) => {
  return riskCategories.find(c => c.value === category)?.icon || ''
}

const assetTypes = [
  { value: 'application', label: 'Application', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { value: 'database', label: 'Database', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
  { value: 'server', label: 'Server', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2-2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
  { value: 'cloud_service', label: 'Cloud Service', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
  { value: 'endpoint', label: 'Endpoint', icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25' },
  { value: 'vendor', label: 'Vendor', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { value: 'data', label: 'Data', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' }
]

const getAssetIcon = (type: AssetType) => {
  return assetTypes.find(t => t.value === type)?.icon || ''
}

const getCriticalityBadge = (criticality: BusinessCriticality) => {
  switch (criticality) {
    case 'high': return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleReview = async () => {
  try {
    await riskApi.reviewRisk(organizationId, riskId)
    await fetchData()
  } catch (error) {
    console.error('Failed to review risk:', error)
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-[#f8fbfb]">
    <DashboardSidebar />
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashboardHeader 
        :title="risk?.title || 'Risk Detail'"
        v-model:persona="selectedPersona"
      />
      
      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="flex flex-col items-center justify-center h-full gap-4">
          <div class="size-10 border-4 border-[#09423c] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[14px] text-[#4f9690] font-medium">Loading risk details...</p>
        </div>

        <div v-else-if="risk" class="max-w-[1200px] mx-auto space-y-8">
          <!-- Back Link -->
          <NuxtLink :to="`/organizations/${organizationId}/risks`" class="flex items-center gap-2 text-[14px] font-bold text-[#4f9690] hover:text-[#09423c] transition-colors w-fit group">
            <svg class="size-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Risk
          </NuxtLink>

          <!-- Risk Header Card -->
          <div class="bg-white rounded-[24px] border border-[#e8f3f2] shadow-sm p-8 overflow-hidden relative">
            <div :class="['absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 opacity-20', 
              risk.risk_rating === 'high' ? 'bg-rose-500' : 
              risk.risk_rating === 'medium' ? 'bg-amber-500' : 'bg-emerald-500']"></div>
            
            <div class="relative flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div class="flex items-start gap-6">
                <div :class="['size-20 rounded-[24px] flex items-center justify-center text-white shadow-lg shadow-[#09423c]/20', 
                  risk.risk_rating === 'high' ? 'bg-rose-600' : 
                  risk.risk_rating === 'medium' ? 'bg-amber-600' : 'bg-emerald-600']">
                  <svg class="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIcon(risk.category)" />
                  </svg>
                </div>
                <div class="flex-1">
                  <span class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-[1.5px] mb-1 block">{{ risk.risk_id }}</span>
                  <h2 class="text-[32px] font-extrabold text-[#0e1b1a] mb-3 leading-tight">{{ risk.title }}</h2>
                  <div class="flex flex-wrap items-center gap-3">
                    <span :class="['px-3 py-1 rounded-lg text-[11px] font-extrabold border uppercase tracking-tight', getRatingBadge(risk.risk_rating)]">
                      {{ risk.risk_rating }} Risk
                    </span>
                    <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span class="px-3 py-1 bg-[#f8fbfb] border border-[#e8f3f2] rounded-lg text-[12px] font-bold text-[#09423c] capitalize">
                      {{ risk.category.replace('_', ' ') }}
                    </span>
                    <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div class="flex items-center gap-2">
                      <div :class="['size-1.5 rounded-full', getStatusBadge(risk.status).split(' ')[1].replace('text-', 'bg-')]"></div>
                      <span :class="['text-[12px] font-bold capitalize', getStatusBadge(risk.status).split(' ')[1]]">{{ risk.status.replace('_', ' ') }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  @click="handleReview"
                  class="px-5 py-2.5 bg-[#09423c] text-white rounded-xl text-[14px] font-bold hover:bg-[#07332e] transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as Reviewed
                </button>
                <button class="px-5 py-2.5 bg-white border border-[#e8f3f2] rounded-xl text-[14px] font-bold text-[#0e1b1a] hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                  Update Risk
                </button>
              </div>
            </div>
          </div>

          <!-- Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Details & Assets -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Description -->
              <div class="bg-white rounded-[24px] border border-[#e8f3f2] p-8 shadow-sm">
                <h3 class="text-[18px] font-extrabold text-[#0e1b1a] mb-6">Risk Description</h3>
                <p class="text-[15px] text-[#0e1b1a] leading-relaxed opacity-80">{{ risk.description || 'No detailed description provided.' }}</p>
                
                <div class="mt-8 pt-8 border-t border-[#f8fbfb] grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-3">Existing Controls</label>
                    <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[14px] text-[#0e1b1a] opacity-80">
                      {{ risk.existing_controls || 'No controls documented.' }}
                    </div>
                  </div>
                  <div>
                    <label class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-3">Treatment Strategy</label>
                    <div class="flex items-center gap-3">
                      <span class="px-4 py-2 bg-[#09433e]/5 text-[#09433e] rounded-xl text-[14px] font-bold capitalize border border-[#09433e]/10">
                        {{ risk.treatment }}
                      </span>
                      <span v-if="risk.target_mitigation_date" class="text-[13px] text-[#4f9690]">
                        Due: <span class="font-bold">{{ formatDate(risk.target_mitigation_date) }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Linked Assets -->
              <div class="bg-white rounded-[24px] border border-[#e8f3f2] p-8 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-[18px] font-extrabold text-[#0e1b1a]">Impacted Assets</h3>
                  <span class="bg-[#09433e]/5 text-[#09433e] px-3 py-1 rounded-full text-[12px] font-extrabold">{{ risk.assets.length }} Total</span>
                </div>
                
                <div class="space-y-4">
                  <div v-for="asset in risk.assets" :key="asset.id" class="flex items-center justify-between p-4 rounded-2xl bg-[#f8fbfb] border border-[#e8f3f2] hover:border-[#09423c]/30 transition-all group">
                    <div class="flex items-center gap-4">
                      <div class="size-10 bg-white border border-[#e8f3f2] rounded-xl flex items-center justify-center text-[#09423c]">
                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getAssetIcon(asset.asset_type)" />
                        </svg>
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span class="text-[10px] font-extrabold text-[#4f9690] opacity-60">{{ asset.asset_id }}</span>
                        <NuxtLink :to="`/organizations/${organizationId}/assets/${asset.id}`" class="text-[14px] font-bold text-[#0e1b1a] hover:text-[#09423c] transition-colors">
                          {{ asset.name }}
                        </NuxtLink>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <span :class="['px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border uppercase', getCriticalityBadge(asset.business_criticality)]">
                        {{ asset.business_criticality }}
                      </span>
                      <svg class="size-4 text-gray-300 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Scoring & Review -->
            <div class="space-y-8">
              <!-- Risk Score Breakdown -->
              <div class="bg-white rounded-[24px] border border-[#e8f3f2] p-8 shadow-sm">
                <h3 class="text-[16px] font-extrabold text-[#0e1b1a] mb-6">Score Breakdown</h3>
                <div class="space-y-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-[10px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-1">Likelihood</label>
                      <span class="text-[15px] font-bold text-[#0e1b1a] capitalize">{{ risk.likelihood }}</span>
                    </div>
                    <div class="size-8 rounded-lg bg-gray-50 flex items-center justify-center text-[14px] font-extrabold text-[#0e1b1a]">
                      {{ risk.likelihood === 'high' ? '3' : risk.likelihood === 'medium' ? '2' : '1' }}
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-[10px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-1">Impact</label>
                      <span class="text-[15px] font-bold text-[#0e1b1a] capitalize">{{ risk.impact }}</span>
                    </div>
                    <div class="size-8 rounded-lg bg-gray-50 flex items-center justify-center text-[14px] font-extrabold text-[#0e1b1a]">
                      {{ risk.impact === 'high' ? '3' : risk.impact === 'medium' ? '2' : '1' }}
                    </div>
                  </div>
                  <div class="pt-4 border-t border-[#f8fbfb] flex items-center justify-between">
                    <span class="text-[13px] font-bold text-[#4f9690]">Base Score</span>
                    <span class="text-[18px] font-extrabold text-[#0e1b1a]">{{ risk.base_risk_score }}</span>
                  </div>
                  <div class="p-5 bg-[#09423c] rounded-[20px] text-white">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[12px] font-bold text-emerald-100/70">Final Risk Score</span>
                      <span class="text-[32px] font-extrabold">{{ risk.final_risk_score }}</span>
                    </div>
                    <p class="text-[11px] text-emerald-100/50 leading-tight">
                      Calculated using base score and the highest asset criticality multiplier.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Audit Trail -->
              <div class="bg-white rounded-[24px] border border-[#e8f3f2] p-8 shadow-sm">
                <h3 class="text-[16px] font-extrabold text-[#0e1b1a] mb-6">Audit Trail</h3>
                <div class="space-y-6">
                  <div class="flex gap-4">
                    <div class="size-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p class="text-[13px] font-bold text-[#0e1b1a]">Risk Identified</p>
                      <p class="text-[11px] text-[#4f9690]">{{ formatDate(risk.created_at) }}</p>
                    </div>
                  </div>
                  <div class="flex gap-4" v-if="risk.last_reviewed_at">
                    <div class="size-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p class="text-[13px] font-bold text-[#0e1b1a]">Last Reviewed</p>
                      <p class="text-[11px] text-[#4f9690]">{{ formatDate(risk.last_reviewed_at) }}</p>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <div class="size-2 bg-gray-200 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p class="text-[13px] font-bold text-[#0e1b1a]">Managed By</p>
                      <p class="text-[11px] text-[#4f9690]">{{ risk.risk_owner }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

