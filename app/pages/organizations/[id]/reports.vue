<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import type { CRODashboardResponse } from '~/types/dashboard'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const dashboard = useDashboard()
const organizationId = route.params.id as string

const isLoading = ref(true)
const isGeneratingReport = ref(false)
const croDashboardData = ref<CRODashboardResponse | null>(null)
const previewLoading = ref(false)

interface Template {
  id: string
  title: string
  description: string
  icon: string
  features: string[]
  tags: string[]
  formats: string[]
}

const templates: Template[] = [
  {
    id: 'board-pack',
    title: 'Board Pack',
    description: 'High-level executive summary focusing on risk quantification, exposure changes, and strategic recommendations.',
    icon: 'i-lucide-layout-grid',
    features: ['Risk Exposure Summary', 'YoY Trends'],
    tags: ['BOARD / C-SUITE'],
    formats: ['PDF', 'PPTX']
  },
  {
    id: 'cro-report',
    title: 'CRO Report',
    description: 'Detailed technical analysis including control maturity assessments, vulnerability density, and compliance status.',
    icon: 'i-lucide-shield-check',
    features: [],
    tags: ['RISK OFFICERS'],
    formats: ['PDF']
  },
  {
    id: 'broker-submission',
    title: 'Broker Submission',
    description: 'Standardized insurance application data, claims history, and asset schedules formatted for broker review.',
    icon: 'i-lucide-file-edit',
    features: [],
    tags: ['BROKERS'],
    formats: ['PDF', 'XLSX']
  },
  {
    id: 'underwriter-summary',
    title: 'Underwriter Summary',
    description: 'Standardized risk summary for underwriters, highlighting control effectiveness and mitigation strategies.',
    icon: 'i-lucide-file-text',
    features: [],
    tags: ['UNDERWRITERS'],
    formats: ['PDF']
  }
]

const selectedTemplateId = ref('board-pack')
const exportFormat = ref('pdf')

const selectedTemplate = computed(() => 
  templates.find(t => t.id === selectedTemplateId.value) || templates[0]
)

// Watch for template changes to load preview data
watch(selectedTemplateId, async (newTemplateId) => {
  if (newTemplateId === 'cro-report') {
    await loadCRODashboardData()
  } else {
    croDashboardData.value = null
  }
}, { immediate: false })

// Load CRO dashboard data for preview
const loadCRODashboardData = async () => {
  if (selectedTemplateId.value !== 'cro-report') return
  
  try {
    previewLoading.value = true
    croDashboardData.value = await dashboard.getCRODashboard(organizationId, {
      include_retired_assets: false,
      risk_limit: 20,
      include_financial_exposure: true,
      include_insurance_assessment: true
    })
  } catch (error) {
    console.error('Failed to load CRO dashboard data:', error)
    croDashboardData.value = null
  } finally {
    previewLoading.value = false
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  
  setTimeout(() => isLoading.value = false, 500)
  
  // Load CRO data if CRO report is selected
  if (selectedTemplateId.value === 'cro-report') {
    await loadCRODashboardData()
  }
})

const handleGenerate = async () => {
  if (isGeneratingReport.value) return
  
  try {
    isGeneratingReport.value = true
    
    // For CRO report, ensure we have the data
    if (selectedTemplateId.value === 'cro-report' && !croDashboardData.value) {
      await loadCRODashboardData()
    }
    
    // Generate report based on template and format
    const reportData = {
      template: selectedTemplateId.value,
      format: exportFormat.value,
      organizationId: organizationId,
      data: selectedTemplateId.value === 'cro-report' ? croDashboardData.value : null
    }
    
    // TODO: Implement actual report generation API call
    console.log('Generating report:', reportData)
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For now, trigger download (in real implementation, this would be an API call)
    alert(`Report generation initiated for ${selectedTemplate.value.title} in ${exportFormat.value.toUpperCase()} format.`)
  } catch (error) {
    console.error('Failed to generate report:', error)
    alert('Failed to generate report. Please try again.')
  } finally {
    isGeneratingReport.value = false
  }
}

// Format currency helper
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

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

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
    
    <div class="flex-1 flex flex-col min-w-0 relative overflow-hidden">
      <DashboardHeader 
        title="Reports"
        :show-persona="false"
        @toggle-sidebar="toggleSidebar"
      />
      
      <main class="flex-1 overflow-y-auto pb-24">
        <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-4">
          <div class="size-12 border-4 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[14px] text-[#4f9690] font-medium text-center">Loading reports...</p>
        </div>
        
        <div v-else class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            
            <!-- Left Column: Template Selection -->
            <div class="lg:col-span-7 space-y-6 lg:space-y-8">
              <div>
                <h1 class="text-[24px] sm:text-[32px] font-extrabold text-[#09423c] mb-2 sm:mb-3 tracking-tight">Select Report Template</h1>
                <p class="text-[14px] sm:text-[16px] text-[#6b8a87] font-medium leading-relaxed max-w-2xl">
                  Choose a standardized template below to configure export settings. Official documentation is generated with the latest risk data.
                </p>
              </div>

              <div class="space-y-4">
                <div 
                  v-for="template in templates" 
                  :key="template.id"
                  @click="selectedTemplateId = template.id"
                  class="bg-white border rounded-2xl p-4 sm:p-6 transition-all cursor-pointer group relative flex flex-col sm:flex-row gap-4 sm:gap-6"
                  :class="selectedTemplateId === template.id ? 'border-[#09423c] ring-1 ring-[#09423c] shadow-sm' : 'border-[#e8f3f2] hover:border-[#09423c]/30'"
                >
                  <!-- Selection Indicator -->
                  <div 
                    v-if="selectedTemplateId === template.id"
                    class="absolute top-4 sm:top-6 right-4 sm:right-6"
                  >
                    <div class="size-5 sm:size-6 bg-[#f1f7f6] rounded-full border border-[#09423c] flex items-center justify-center">
                      <UIcon name="i-lucide-check" class="size-3 sm:size-4 text-[#09423c]" />
                    </div>
                  </div>

                  <!-- Icon -->
                  <div class="size-12 sm:size-14 rounded-xl bg-[#f1f7f6] flex items-center justify-center flex-shrink-0 group-hover:bg-[#09423c]/5 transition-colors">
                    <UIcon :name="template.icon" class="size-6 sm:size-7 text-[#09423c]" />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 space-y-4">
                    <div>
                      <h3 class="text-[16px] sm:text-[18px] font-extrabold text-[#09423c] mb-1 sm:mb-2">{{ template.title }}</h3>
                      <p class="text-[13px] sm:text-[14px] text-[#6b8a87] leading-relaxed font-medium sm:pr-12">
                        {{ template.description }}
                      </p>
                    </div>

                    <!-- Features -->
                    <div v-if="template.features.length > 0" class="flex flex-wrap gap-4 sm:gap-6 items-center">
                      <div v-for="feature in template.features" :key="feature" class="flex items-center gap-2 text-[11px] sm:text-[12px] font-bold text-[#09423c]">
                        <UIcon :name="feature.includes('Trends') ? 'i-lucide-trending-up' : 'i-lucide-list'" class="size-4" />
                        {{ feature }}
                      </div>
                    </div>

                    <!-- Tags -->
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="tag in template.tags" 
                        :key="tag"
                        class="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#09423c] text-white text-[9px] sm:text-[10px] font-black rounded-md tracking-wider"
                      >
                        {{ tag }}
                      </span>
                      <span 
                        v-for="format in template.formats" 
                        :key="format"
                        class="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#f1f7f6] text-[#6b8a87] text-[9px] sm:text-[10px] font-black rounded-md border border-[#e8f3f2]"
                      >
                        {{ format }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Preview & Options -->
            <div class="lg:col-span-5 space-y-8 lg:space-y-10">
              <!-- Report Preview -->
              <div class="space-y-4 lg:space-y-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-[12px] sm:text-[14px] font-black text-[#6b8a87] uppercase tracking-widest">Report Preview</h2>
                  <button 
                    v-if="selectedTemplateId === 'cro-report' && !croDashboardData && !previewLoading"
                    @click="loadCRODashboardData"
                    class="text-[11px] font-bold text-[#09423c] hover:text-[#07332e] transition-colors flex items-center gap-1.5"
                  >
                    <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
                    Load Preview
                  </button>
                </div>
                
                <!-- CRO Report Preview -->
                <div v-if="selectedTemplateId === 'cro-report'" class="bg-white border border-[#e8f3f2] rounded-3xl p-4 sm:p-6 shadow-sm overflow-y-auto max-h-[600px]">
                  <div v-if="previewLoading" class="flex flex-col items-center justify-center py-12 gap-4">
                    <div class="size-8 border-3 border-[#09423C] border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-[12px] text-[#6b8a87] font-medium">Loading preview data...</p>
                  </div>
                  
                  <div v-else-if="croDashboardData" class="space-y-6">
                    <!-- Header -->
                    <div class="border-b border-[#e8f3f2] pb-4">
                      <h3 class="text-[18px] font-extrabold text-[#09423c] mb-1">CRO Risk Report</h3>
                      <p class="text-[12px] text-[#6b8a87] font-medium">
                        {{ croDashboardData.executive_summary.organization_name }}
                      </p>
                      <p class="text-[10px] text-[#6b8a87] mt-1">
                        Generated: {{ formatDate(croDashboardData.generated_at) }}
                      </p>
                    </div>

                    <!-- Executive Summary -->
                    <div class="space-y-3">
                      <h4 class="text-[13px] font-black text-[#09423c] uppercase tracking-wide">Executive Summary</h4>
                      <div class="grid grid-cols-2 gap-3">
                        <div class="bg-[#f8fbfb] rounded-lg p-3 border border-[#e8f3f2]">
                          <p class="text-[10px] text-[#6b8a87] font-bold uppercase mb-1">Risk Tier</p>
                          <p class="text-[16px] font-extrabold text-[#09423c]">Grade {{ croDashboardData.executive_summary.risk_tier_grade }}</p>
                        </div>
                        <div class="bg-[#f8fbfb] rounded-lg p-3 border border-[#e8f3f2]">
                          <p class="text-[10px] text-[#6b8a87] font-bold uppercase mb-1">Exposure Score</p>
                          <p class="text-[16px] font-extrabold text-[#09423c]">{{ croDashboardData.executive_summary.exposure_score }}</p>
                        </div>
                        <div class="bg-[#f8fbfb] rounded-lg p-3 border border-[#e8f3f2]">
                          <p class="text-[10px] text-[#6b8a87] font-bold uppercase mb-1">Red Flags</p>
                          <p class="text-[16px] font-extrabold text-[#09423c]">{{ croDashboardData.executive_summary.red_flags_count }}</p>
                          <p class="text-[9px] text-[#6b8a87] mt-0.5">{{ croDashboardData.executive_summary.critical_red_flags }} Critical</p>
                        </div>
                        <div class="bg-[#f8fbfb] rounded-lg p-3 border border-[#e8f3f2]">
                          <p class="text-[10px] text-[#6b8a87] font-bold uppercase mb-1">Insurance</p>
                          <p class="text-[14px] font-extrabold" :class="croDashboardData.risk_scoring.eligibility === 'eligible' ? 'text-[var(--color-complete)]' : 'text-[var(--color-critical)]'">
                            {{ croDashboardData.risk_scoring.eligibility.toUpperCase() }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Risk Register Summary -->
                    <div class="space-y-3">
                      <h4 class="text-[13px] font-black text-[#09423c] uppercase tracking-wide">Risk Register</h4>
                      <div class="bg-[#f8fbfb] rounded-lg p-3 border border-[#e8f3f2] space-y-2">
                        <div class="flex justify-between text-[11px]">
                          <span class="text-[#6b8a87] font-bold">Total Risks:</span>
                          <span class="text-[#09423c] font-extrabold">{{ croDashboardData.risk_register.total_risks }}</span>
                        </div>
                        <div class="flex justify-between text-[11px]">
                          <span class="text-[#6b8a87] font-bold">Open Risks:</span>
                          <span class="text-[#09423c] font-extrabold">{{ croDashboardData.risk_register.open_risks }}</span>
                        </div>
                        <div class="flex justify-between text-[11px]">
                          <span class="text-[#6b8a87] font-bold">Critical/High:</span>
                          <span class="text-[var(--color-critical)] font-extrabold">{{ croDashboardData.risk_register.critical_risks + croDashboardData.risk_register.high_risks }}</span>
                        </div>
                        <div class="flex justify-between text-[11px]">
                          <span class="text-[#6b8a87] font-bold">Overdue:</span>
                          <span class="text-[var(--color-critical)] font-extrabold">{{ croDashboardData.risk_register.overdue_mitigations }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Financial Exposure -->
                    <div class="space-y-3">
                      <h4 class="text-[13px] font-black text-[#09423c] uppercase tracking-wide">Financial Exposure</h4>
                      <div class="bg-[#f8fbfb] rounded-lg p-3 border border-[#e8f3f2]">
                        <p class="text-[10px] text-[#6b8a87] font-bold uppercase mb-1">Single Event (Mid)</p>
                        <p class="text-[16px] font-extrabold text-[#09423c]">
                          {{ formatCurrency(croDashboardData.risk_scoring.financial_exposure.single_event_mid) }}
                        </p>
                        <p class="text-[9px] text-[#6b8a87] mt-1">
                          PML 99: {{ formatCurrency(croDashboardData.risk_scoring.financial_exposure.pml_99) }}
                        </p>
                      </div>
                    </div>

                    <!-- Top Risks Preview -->
                    <div v-if="croDashboardData.risk_register.top_risks && croDashboardData.risk_register.top_risks.length > 0" class="space-y-3">
                      <h4 class="text-[13px] font-black text-[#09423c] uppercase tracking-wide">Top Risks</h4>
                      <div class="space-y-2">
                        <div 
                          v-for="(risk, idx) in croDashboardData.risk_register.top_risks.slice(0, 3)" 
                          :key="risk.id"
                          class="bg-[#f8fbfb] rounded-lg p-2.5 border border-[#e8f3f2]"
                        >
                          <div class="flex items-start justify-between gap-2 mb-1">
                            <p class="text-[11px] font-extrabold text-[#09423c] flex-1 line-clamp-1">{{ risk.title }}</p>
                            <span class="text-[9px] font-black px-1.5 py-0.5 rounded" 
                              :class="risk.risk_rating === 'Critical' ? 'bg-[var(--color-critical)]/10 text-[var(--color-critical)]' : 
                                      risk.risk_rating === 'High' ? 'bg-[var(--color-high)]/10 text-[var(--color-high)]' : 
                                      'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'">
                              {{ risk.risk_rating }}
                            </span>
                          </div>
                          <p class="text-[9px] text-[#6b8a87] line-clamp-2">{{ risk.description || 'No description' }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Priority Actions -->
                    <div v-if="croDashboardData.priority_actions && croDashboardData.priority_actions.length > 0" class="space-y-3">
                      <h4 class="text-[13px] font-black text-[#09423c] uppercase tracking-wide">Priority Actions</h4>
                      <ul class="space-y-1.5">
                        <li 
                          v-for="(action, idx) in croDashboardData.priority_actions.slice(0, 3)" 
                          :key="idx"
                          class="text-[11px] text-[#09423c] font-medium flex items-start gap-2"
                        >
                          <span class="text-[var(--color-warning)] mt-0.5">•</span>
                          <span>{{ action }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div v-else class="flex flex-col items-center justify-center py-12 gap-3">
                    <UIcon name="i-lucide-file-text" class="size-10 text-[#6b8a87]/40" />
                    <p class="text-[12px] text-[#6b8a87] font-medium text-center">Preview will appear here</p>
                    <p class="text-[10px] text-[#6b8a87]/60 text-center">Click "Load Preview" to see report data</p>
                  </div>
                </div>

                <!-- Generic Preview for other templates -->
                <div v-else class="bg-white border border-[#e8f3f2] rounded-3xl p-4 sm:p-8 aspect-[4/5] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                  <!-- Stylized Document Mockup -->
                  <div class="w-full h-full bg-[#f8fbfb] rounded-xl border border-[#e8f3f2] p-6 sm:p-10 space-y-6 sm:space-y-8 relative z-10 overflow-hidden">
                    <div class="flex justify-between items-start">
                      <div class="size-10 sm:size-12 bg-[#09423c]/10 rounded-lg flex items-center justify-center">
                        <UIcon name="i-lucide-box" class="size-5 sm:size-6 text-[#09423c]" />
                      </div>
                      <div class="space-y-1.5 sm:space-y-2">
                        <div class="w-24 sm:w-32 h-1.5 sm:h-2 bg-gray-200 rounded-full ml-auto"></div>
                        <div class="w-16 sm:w-24 h-1 sm:h-1.5 bg-gray-100 rounded-full ml-auto"></div>
                      </div>
                    </div>
                    
                    <div class="space-y-3 sm:space-y-4">
                      <div class="w-full h-8 sm:h-10 bg-[#09423c] rounded-md opacity-90 shadow-sm"></div>
                      <div class="w-2/3 h-2 sm:h-3 bg-gray-200 rounded-full"></div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
                      <div class="space-y-2 sm:space-y-3">
                        <div class="w-full h-0.5 sm:h-1 bg-gray-200 rounded-full"></div>
                        <div class="w-full h-0.5 sm:h-1 bg-gray-200 rounded-full"></div>
                        <div class="w-full h-0.5 sm:h-1 bg-gray-200 rounded-full"></div>
                        <div class="w-2/3 h-0.5 sm:h-1 bg-gray-200 rounded-full"></div>
                      </div>
                      <div class="aspect-[4/3] bg-white border-2 border-dashed border-[#e8f3f2] rounded-xl flex items-center justify-center">
                        <UIcon name="i-lucide-bar-chart-2" class="size-6 sm:size-8 text-[#09423c]/20" />
                      </div>
                    </div>

                    <div class="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
                      <div class="w-full h-3 sm:h-4 bg-gray-100 rounded-md"></div>
                      <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
                        <div class="h-6 sm:h-8 bg-[#09423c]/5 rounded"></div>
                        <div class="h-6 sm:h-8 bg-[#09423c]/5 rounded"></div>
                        <div class="h-6 sm:h-8 bg-[#09423c]/5 rounded"></div>
                        <div class="h-6 sm:h-8 bg-[#09423c]/5 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Watermark text -->
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] rotate-[-25deg]">
                    <span class="text-[40px] sm:text-[80px] font-black text-[#09423c] whitespace-nowrap">MOKSHYA OS</span>
                  </div>
                </div>
              </div>

              <!-- Export Options -->
              <div class="space-y-4 lg:space-y-6">
                <h2 class="text-[12px] sm:text-[14px] font-black text-[#6b8a87] uppercase tracking-widest">Export Options</h2>
                <div class="space-y-4">
                  <p class="text-[13px] sm:text-[14px] font-extrabold text-[#09423c]">Format</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      @click="exportFormat = 'pdf'"
                      class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all text-left group"
                      :class="exportFormat === 'pdf' ? 'border-[#09423c] bg-[#f1f7f6]' : 'border-[#e8f3f2] bg-white hover:border-[#09423c]/20'"
                    >
                      <div 
                        class="size-4 sm:size-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        :class="exportFormat === 'pdf' ? 'border-[#09423c]' : 'border-[#e8f3f2]'"
                      >
                        <div v-if="exportFormat === 'pdf'" class="size-2 sm:size-2.5 bg-[#09423c] rounded-full"></div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="size-9 sm:size-10 bg-white rounded-lg border border-[#e8f3f2] flex items-center justify-center">
                          <UIcon name="i-lucide-file-text" class="size-5 sm:size-6 text-[#09423c]" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[13px] sm:text-[14px] font-bold text-[#09423c]">PDF</span>
                          <span class="text-[10px] sm:text-[11px] text-[#6b8a87] font-medium">Document</span>
                        </div>
                      </div>
                    </button>

                    <button 
                      @click="exportFormat = 'ppt'"
                      class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all text-left group"
                      :class="exportFormat === 'ppt' ? 'border-[#09423c] bg-[#f1f7f6]' : 'border-[#e8f3f2] bg-white hover:border-[#09423c]/20'"
                    >
                      <div 
                        class="size-4 sm:size-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        :class="exportFormat === 'ppt' ? 'border-[#09423c]' : 'border-[#e8f3f2]'"
                      >
                        <div v-if="exportFormat === 'ppt'" class="size-2 sm:size-2.5 bg-[#09423c] rounded-full"></div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="size-9 sm:size-10 bg-white rounded-lg border border-[#e8f3f2] flex items-center justify-center">
                          <UIcon name="i-lucide-presentation" class="size-5 sm:size-6 text-[#09423c]" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[13px] sm:text-[14px] font-bold text-[#09423c]">Presentation</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <!-- Bottom Action Bar -->
      <footer class="h-auto sm:h-24 bg-white border-t border-[#e8f3f2] px-4 sm:px-8 py-4 sm:py-0 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        <div class="flex items-center gap-3 text-[#6b8a87] text-center sm:text-left">
          <UIcon name="i-lucide-lock" class="size-4 sm:size-5 flex-shrink-0" />
          <span class="text-[11px] sm:text-[13px] font-bold leading-tight">All generated reports are audit-logged and tamper-evident</span>
        </div>
        
        <button 
          @click="handleGenerate"
          :disabled="isGeneratingReport || (selectedTemplateId === 'cro-report' && !croDashboardData && previewLoading)"
          class="w-full sm:w-auto bg-[#09423c] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#07332e] transition-all shadow-xl shadow-[#09423c]/20 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UIcon 
            v-if="!isGeneratingReport"
            name="i-lucide-download" 
            class="size-4 sm:size-5 group-hover:translate-y-0.5 transition-transform" 
          />
          <div v-else class="size-4 sm:size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>{{ isGeneratingReport ? 'Generating...' : 'Generate & Download' }}</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for main content */
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

