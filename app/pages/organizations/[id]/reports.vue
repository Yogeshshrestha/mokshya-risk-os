<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const questionnaire = useGlobalQuestionnaire()
const organizationId = route.params.id as string

const selectedPersona = ref('cro')
const isLoading = ref(true)

interface Report {
  id: string
  name: string
  type: 'Security' | 'Compliance' | 'Risk' | 'Executive'
  status: 'Ready' | 'Generating' | 'Expired'
  date: string
  format: 'PDF' | 'Excel' | 'JSON'
  author: string
}

const reports = ref<Report[]>([
  { id: '1', name: 'Annual Risk Assessment 2025', type: 'Risk', status: 'Ready', date: '2025-12-15', format: 'PDF', author: 'System' },
  { id: '2', name: 'ISO 27001 Compliance Readiness', type: 'Compliance', status: 'Ready', date: '2026-01-02', format: 'PDF', author: 'System' },
  { id: '3', name: 'Quarterly Security Posture - Q4', type: 'Security', status: 'Ready', date: '2025-12-31', format: 'PDF', author: 'Alice Johnson' },
  { id: '4', name: 'Executive Summary for Board', type: 'Executive', status: 'Generating', date: '2026-01-08', format: 'PDF', author: 'System' },
  { id: '5', name: 'Asset Inventory Export', type: 'Security', status: 'Ready', date: '2026-01-05', format: 'Excel', author: 'Bob Williams' }
])

const reportTypes = [
  { name: 'Executive Summary', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-blue-50 text-blue-600' },
  { name: 'Risk Analytics', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'bg-rose-50 text-rose-600' },
  { name: 'Compliance Pack', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Custom Reports', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 4a2 2 0 100-4m0 4a2 2 0 110-4m-6 0a2 2 0 100 4m0-4a2 2 0 110 4m-6 0v2m0-6V4m6 6V4m6 2a2 2 0 100 4m0-4a2 2 0 110 4m0 6v2m0-6V4', color: 'bg-amber-50 text-amber-600' }
]

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  setTimeout(() => isLoading.value = false, 800)
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'Generating': return 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse'
    case 'Expired': return 'bg-gray-50 text-gray-500 border-gray-100'
    default: return 'bg-gray-50 text-gray-500'
  }
}
</script>

<template>
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <DashboardSidebar />
    
    <div class="flex-1 flex flex-col min-w-0">
      <DashboardHeader 
        title="Reports & Analytics"
        v-model:persona="selectedPersona"
      />
      
      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <div class="w-12 h-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else class="max-w-[1600px] mx-auto space-y-8">
          <!-- Page Header -->
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-[24px] font-extrabold text-[#0e1b1a]">Reports Library</h2>
              <p class="text-[15px] text-[#4f9690]">Generate and manage professional security and risk reports.</p>
            </div>
            <button class="bg-[#09423C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer">
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Report
            </button>
          </div>

          <!-- Report Type Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              v-for="type in reportTypes" 
              :key="type.name"
              class="bg-white p-6 rounded-[24px] border border-[#e8f3f2] hover:shadow-xl hover:shadow-[#09433e]/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div :class="['size-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110', type.color]">
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon" />
                </svg>
              </div>
              <h3 class="text-[16px] font-extrabold text-[#0e1b1a] mb-1">{{ type.name }}</h3>
              <p class="text-[13px] text-[#4f9690] font-medium">Generate in one click</p>
            </div>
          </div>

          <!-- Reports List Table -->
          <div class="bg-white rounded-[24px] border border-[#e8f3f2] shadow-sm overflow-hidden">
            <div class="px-8 py-6 border-b border-[#f8fbfb] flex items-center justify-between">
              <h3 class="text-[18px] font-extrabold text-[#0e1b1a]">Generated Reports</h3>
              <div class="relative">
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  class="bg-[#f8fbfb] border border-[#e8f3f2] rounded-xl px-4 py-2 text-[13px] font-medium w-64 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 transition-all"
                >
              </div>
            </div>

            <table class="w-full text-left">
              <thead class="bg-[#09423c]/80 text-white uppercase text-[11px] font-extrabold tracking-[1px]">
                <tr>
                  <th class="px-8 py-5">Report Name</th>
                  <th class="px-8 py-5">Category</th>
                  <th class="px-8 py-5">Status</th>
                  <th class="px-8 py-5">Date</th>
                  <th class="px-8 py-5">Format</th>
                  <th class="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e8f3f2]">
                <tr v-for="report in reports" :key="report.id" class="hover:bg-gray-50/50 transition-all group">
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                      <div class="size-8 bg-[#f8fbfb] rounded-lg flex items-center justify-center text-[#09423C] border border-[#e8f3f2]">
                        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[14px] font-bold text-[#0e1b1a]">{{ report.name }}</span>
                        <span class="text-[11px] text-[#4f9690] font-medium">Generated by {{ report.author }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#f1f5f9] text-[#64748b] uppercase tracking-tight">
                      {{ report.type }}
                    </span>
                  </td>
                  <td class="px-8 py-5">
                    <span :class="['px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border', getStatusColor(report.status)]">
                      {{ report.status }}
                    </span>
                  </td>
                  <td class="px-8 py-5 text-[13px] text-[#4f9690] font-bold">{{ report.date }}</td>
                  <td class="px-8 py-5">
                    <span class="text-[13px] font-extrabold text-[#0e1b1a]">{{ report.format }}</span>
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button class="size-9 rounded-xl flex items-center justify-center text-[#4f9690] hover:bg-gray-100 transition-colors" title="Download">
                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button class="size-9 rounded-xl flex items-center justify-center text-[#4f9690] hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Delete">
                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
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

