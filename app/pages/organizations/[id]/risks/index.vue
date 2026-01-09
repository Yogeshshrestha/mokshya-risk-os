<script setup lang="ts">
import type { Risk, RiskCategory, RiskRating, RiskStatistics, RiskStatus } from '~/types/asset-risk'

definePageMeta({
  layout: false
})

const route = useRoute()
const organizationId = route.params.id as string
const riskApi = useRisk()

const risks = ref<Risk[]>([])
const stats = ref<RiskStatistics | null>(null)
const isLoading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref<RiskCategory | ''>('')
const selectedRating = ref<RiskRating | ''>('')

const fetchData = async () => {
  try {
    isLoading.value = true
    const params: any = {}
    if (selectedCategory.value) params.category = selectedCategory.value
    if (selectedRating.value) params.risk_rating = selectedRating.value
    if (searchQuery.value) params.search = searchQuery.value
    
    const [risksData, statsData] = await Promise.all([
      riskApi.listRisks(organizationId, params),
      riskApi.getStatistics(organizationId).catch(() => null)
    ])
    
    risks.value = risksData
    stats.value = statsData
  } catch (error) {
    console.error('Failed to fetch risks:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

const riskCategories = [
  { value: 'data_security', label: 'Data Security', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { value: 'access_control', label: 'Access Control', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { value: 'network', label: 'Network', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18' },
  { value: 'third_party', label: 'Third Party', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { value: 'compliance', label: 'Compliance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { value: 'operational', label: 'Operational', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
]

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

const getCategoryIcon = (category: RiskCategory) => {
  return riskCategories.find(c => c.value === category)?.icon || ''
}

const showCreateRiskModal = ref(false)
const selectedPersona = ref('cro')
</script>

<template>
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <DashboardSidebar />
    
    <div class="flex-1 flex flex-col min-w-0">
      <DashboardHeader 
        title="Risk Register"
        v-model:persona="selectedPersona"
      />
      
      <main class="flex-1 overflow-y-auto py-8">
        <div class="px-4 sm:px-6 lg:px-8 mx-auto space-y-8">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-[24px] font-extrabold text-[#0e1b1a]">Risk Register</h2>
              <p class="text-[15px] text-[#4f9690]">Comprehensive list of identified security risks and their status.</p>
            </div>
            <button 
              @click="showCreateRiskModal = true"
              class="bg-[#09423C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Report Risk
            </button>
          </div>

          <!-- Statistics Cards -->
          <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-[20px] border border-[#e8f3f2] shadow-sm flex items-center gap-5">
              <div class="size-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p class="text-[12px] font-bold text-[#4f9690] uppercase tracking-wider mb-0.5">High Risks</p>
                <p class="text-[24px] font-extrabold text-[#0e1b1a]">{{ stats.high_risks }}</p>
              </div>
            </div>
            <div class="bg-white p-6 rounded-[20px] border border-[#e8f3f2] shadow-sm flex items-center gap-5">
              <div class="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-[12px] font-bold text-[#4f9690] uppercase tracking-wider mb-0.5">Open Risks</p>
                <p class="text-[24px] font-extrabold text-[#0e1b1a]">{{ stats.open_risks }}</p>
              </div>
            </div>
            <div class="bg-white p-6 rounded-[20px] border border-[#e8f3f2] shadow-sm flex items-center gap-5">
              <div class="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-[12px] font-bold text-[#4f9690] uppercase tracking-wider mb-0.5">Mitigated</p>
                <p class="text-[24px] font-extrabold text-[#0e1b1a]">{{ stats.mitigated_risks }}</p>
              </div>
            </div>
            <div class="bg-white p-6 rounded-[20px] border border-[#e8f3f2] shadow-sm flex items-center gap-5">
              <div class="size-12 rounded-2xl bg-[#09423c]/5 flex items-center justify-center text-[#09423c]">
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p class="text-[12px] font-bold text-[#4f9690] uppercase tracking-wider mb-0.5">Avg Score</p>
                <p class="text-[24px] font-extrabold text-[#0e1b1a]">{{ stats.average_risk_score.toFixed(1) }}</p>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white p-4 rounded-2xl border border-[#e8f3f2] shadow-sm flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-[300px] relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                v-model="searchQuery"
                @input="fetchData"
                type="text" 
                placeholder="Search risks by title or ID..."
                class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#09423c]/20 focus:border-[#09423c]/30"
              />
            </div>
            <select 
              v-model="selectedCategory" 
              @change="fetchData"
              class="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] focus:outline-none min-w-[180px]"
            >
              <option value="">All Categories</option>
              <option v-for="cat in riskCategories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
            <select 
              v-model="selectedRating" 
              @change="fetchData"
              class="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] focus:outline-none min-w-[150px]"
            >
              <option value="">All Ratings</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <!-- Risks Table -->
          <div class="bg-white rounded-[24px] border border-[#e8f3f2] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] overflow-hidden">
            <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center gap-4">
              <div class="size-10 border-4 border-[#09423c] border-t-transparent rounded-full animate-spin"></div>
              <p class="text-[14px] text-[#4f9690] font-medium">Loading risk register...</p>
            </div>
            
            <div v-else-if="risks.length === 0" class="p-16 flex flex-col items-center justify-center text-center">
              <div class="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg class="size-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 class="text-[18px] font-extrabold text-[#0e1b1a] mb-2">No Risks Reported</h3>
              <p class="text-[14px] text-[#4f9690] max-w-sm mb-8">Identification of risks is the first step in protecting your organization.</p>
              <button 
                @click="showCreateRiskModal = true"
                class="bg-[#09423C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#07332e] transition-all cursor-pointer"
              >
                Report Your First Risk
              </button>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-[#09423c]/80 text-white uppercase text-[11px] font-extrabold tracking-[1px] sticky top-0">
                  <tr>
                    <th class="px-8 py-5">ID & Title</th>
                    <th class="px-8 py-5">Category</th>
                    <th class="px-8 py-5 text-center">Rating</th>
                    <th class="px-8 py-5 text-center">Score</th>
                    <th class="px-8 py-5">Owner</th>
                    <th class="px-8 py-5">Status</th>
                    <th class="px-8 py-5 text-right px-8">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#e8f3f2]">
                  <tr v-for="risk in risks" :key="risk.id" class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-8 py-5">
                      <div class="flex flex-col gap-0.5">
                        <span class="text-[11px] font-extrabold text-[#4f9690] opacity-60">{{ risk.risk_id }}</span>
                        <NuxtLink :to="`/organizations/${organizationId}/risks/${risk.id}`" class="text-[14px] font-bold text-[#0e1b1a] hover:text-[#09423c] transition-colors">
                          {{ risk.title }}
                        </NuxtLink>
                      </div>
                    </td>
                    <td class="px-8 py-5">
                      <div class="flex items-center gap-2.5">
                        <div class="size-8 bg-[#f8fbfb] border border-[#e8f3f2] rounded-lg flex items-center justify-center text-[#09423c]">
                          <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIcon(risk.category)" />
                          </svg>
                        </div>
                        <span class="text-[13px] font-bold text-[#0e1b1a] capitalize">{{ risk.category.replace('_', ' ') }}</span>
                      </div>
                    </td>
                    <td class="px-8 py-5 text-center">
                      <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-extrabold border uppercase tracking-tight', getRatingBadge(risk.risk_rating)]">
                        {{ risk.risk_rating }}
                      </span>
                    </td>
                    <td class="px-8 py-5 text-center">
                      <span class="text-[14px] font-extrabold text-[#0e1b1a]">{{ risk.final_risk_score }}</span>
                    </td>
                    <td class="px-8 py-5 text-[14px] text-[#4f9690] font-medium">{{ risk.risk_owner }}</td>
                    <td class="px-8 py-5">
                      <div class="flex items-center gap-2">
                        <div :class="['size-1.5 rounded-full', getStatusBadge(risk.status).split(' ')[1].replace('text-', 'bg-')]"></div>
                        <span :class="['text-[12px] font-bold capitalize', getStatusBadge(risk.status).split(' ')[1]]">{{ risk.status.replace('_', ' ') }}</span>
                      </div>
                    </td>
                    <td class="px-8 py-5 text-right px-8">
                      <button class="text-[13px] font-extrabold text-[#09433e] hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <ReportRiskModal 
      v-model="showCreateRiskModal"
      :organization-id="organizationId"
      @created="fetchData"
    />
  </div>
</template>

