<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import { createApp, nextTick } from 'vue'
import CoverPage from '~/pages/reports/CoverPage.vue'
import ReportCRO from '~/pages/reports/ReportCRO.vue'
import ReportCISO from '~/pages/reports/ReportCISO.vue'
import ReportBoard from '~/pages/reports/ReportBoard.vue'
import { generateDashboardPDF } from '~/utils/pdfGenerator'
import { generateDashboardWord } from '~/utils/wordGenerator'
import { useOrganization } from '~/composables/useOrganization'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const organizationId = route.params.id as string

const isLoading = ref(true)

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
    id: 'cro-report',
    title: 'CRO Report',
    description: 'Comprehensive risk assessment report for Chief Risk Officers. Includes detailed technical analysis, control maturity assessments, vulnerability analysis, and compliance status.',
    icon: 'i-lucide-shield-check',
    features: ['Control Maturity', 'Risk Register', 'Financial Exposure', 'Priority Actions'],
    tags: ['RISK OFFICERS'],
    formats: ['PDF']
  },
  {
    id: 'ciso-report',
    title: 'CISO Report',
    description: 'Security-focused report for Chief Information Security Officers. Features control gaps analysis, remediation tracking, readiness metrics, and security posture overview.',
    icon: 'i-lucide-shield-alert',
    features: ['Control Gaps', 'Remediation Tasks', 'Readiness Metrics', 'Security Score'],
    tags: ['SECURITY OFFICERS'],
    formats: ['PDF']
  },
  {
    id: 'board-report',
    title: 'Board Report',
    description: 'Executive summary for board members and C-suite. High-level risk quantification, financial exposure trends, strategic recommendations, and decision points.',
    icon: 'i-lucide-trending-up',
    features: ['Risk Exposure', 'Financial Impact', 'Strategic Recommendations', 'YoY Trends'],
    tags: ['BOARD / C-SUITE'],
    formats: ['PDF', 'PPTX']
  }
]

const selectedTemplateId = ref('cro-report')
const exportFormat = ref('pdf')
const isExporting = ref(false)

const selectedTemplate = computed(() => 
  templates.find(t => t.id === selectedTemplateId.value) || templates[0]
)

onMounted(() => {
  if (!auth.isAuthenticated.value) {
    router.push('/')
    return
  }
  setTimeout(() => isLoading.value = false, 500)
})

const handleGenerate = async () => {
  if (isExporting.value) return
  isExporting.value = true

  try {
    const filename = `${(selectedTemplate.value?.title || 'Report').replace(/\s+/g, '-')}.${exportFormat.value}`

    // Create container that pdfGenerator expects (.space-y-8)
    const container = document.createElement('div')
    container.className = 'space-y-8'
    container.style.width = '816px'
    container.style.margin = '0 auto'
    document.body.appendChild(container)

      // Fetch organization name for cover before mounting cover component
    const orgApi = useOrganization()
    let orgName = 'Organization'
    try {
      const org = await orgApi.getOrganization(organizationId)
      orgName = org.name || orgName
    } catch (e) {
      console.warn('Failed to fetch organization name for report cover', e)
    }

    // Cover page (mount the real CoverPage component for accurate rendering)
    const coverEl = document.createElement('div')
    coverEl.className = 'report-cover'
    container.appendChild(coverEl)
    const coverApp = createApp(CoverPage, {
      companyName: orgName,
      companyAddress: undefined,
      companyCity: undefined,
      reportDate: new Date().toISOString(),
      reportReferenceId: `ORG-${organizationId}`
    })
    coverApp.mount(coverEl)

    // Persona page (mount the actual dashboard-like sections into container)
    const personaEl = document.createElement('main')
    personaEl.className = 'flex-1 overflow-y-auto'
    container.appendChild(personaEl)

    let personaApp
    if (selectedTemplateId.value === 'cro-report') {
      personaApp = createApp(ReportCRO, { organizationId })
    } else if (selectedTemplateId.value === 'ciso-report') {
      personaApp = createApp(ReportCISO, { organizationId })
    } else {
      personaApp = createApp(ReportBoard, { organizationId })
    }

    personaApp.mount(personaEl)

    // Wait for components to fetch data and render
    await nextTick()

    // Wait for a deterministic "report-ready" signal from the mounted components (cover + persona), fallback to timeout
    await new Promise<void>((resolve) => {
      let resolved = false
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve()
        }
      }, 4000)

      const expectedPersona = selectedTemplateId.value === 'cro-report' ? 'cro' : (selectedTemplateId.value === 'ciso-report' ? 'ciso' : 'board')
      let coverReady = false
      let personaReady = false

      const handler = (ev: Event) => {
        const ce = ev as CustomEvent
        const persona = ce?.detail?.persona
        if (persona === 'cover') coverReady = true
        if (persona === expectedPersona) personaReady = true

        if (coverReady && personaReady && !resolved) {
          resolved = true
          clearTimeout(timeout)
          window.removeEventListener('report-ready', handler)
          resolve()
        }
      }

      window.addEventListener('report-ready', handler)
    })

    // Final small pause for last-pixel rendering
    await new Promise(resolve => setTimeout(resolve, 350))

    // Trigger a window resize just in case (some libs only redraw on resize)
    try { window.dispatchEvent(new Event('resize')) } catch (e) { /* ignore */ }

    // Allow reflow/redraw to finish
    await new Promise(resolve => setTimeout(resolve, 250))

    // Generate document based on selected format
    const reportTypeValue = selectedTemplateId.value === 'cro-report' ? 'cro' : (selectedTemplateId.value === 'ciso-report' ? 'ciso' : 'board');
    
    if (exportFormat.value === 'pdf') {
      await generateDashboardPDF(
        reportTypeValue,
        orgName,
        new Date().toISOString(),
        (msg) => console.log('Export:', msg),
        container
      );
    } else if (exportFormat.value === 'docx') {
      await generateDashboardWord(
        reportTypeValue,
        orgName,
        new Date().toISOString(),
        (msg) => console.log('Export:', msg),
        container
      );
    }

    // Unmount & cleanup
    try { personaApp.unmount() } catch (e) { /* ignore */ }
    try { coverApp.unmount() } catch (e) { /* ignore */ }
    if (document.body.contains(container)) document.body.removeChild(container)

    console.log('Report exported:', filename)
  } catch (error) {
    console.error('Export failed:', error)
    // Let user know somehow - for now console
  } finally {
    isExporting.value = false
  }
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

              <div class="grid grid-cols-1 gap-4">
                <div 
                  v-for="template in templates" 
                  :key="template.id"
                  @click="selectedTemplateId = template.id"
                  class="bg-white border-2 rounded-2xl p-5 sm:p-6 transition-all cursor-pointer group relative overflow-hidden"
                  :class="selectedTemplateId === template.id 
                    ? 'border-[#09423c] ring-2 ring-[#09423c] ring-opacity-20 shadow-lg bg-gradient-to-br from-white to-[#f1f7f6]' 
                    : 'border-[#e8f3f2] hover:border-[#09423c]/40 hover:shadow-md'"
                >
                  <!-- Selected Background Accent -->
                  <div 
                    v-if="selectedTemplateId === template.id"
                    class="absolute top-0 left-0 w-1 h-full bg-[#09423c]"
                  ></div>

                  <!-- Selection Indicator -->
                  <div 
                    class="absolute top-4 right-4 sm:top-6 sm:right-6 transition-all"
                    :class="selectedTemplateId === template.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
                  >
                    <div class="size-6 sm:size-7 bg-[#09423c] rounded-full flex items-center justify-center shadow-lg">
                      <UIcon name="i-lucide-check" class="size-4 sm:size-5 text-white" />
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-5 sm:gap-6">
                    <!-- Icon -->
                    <div 
                      class="size-14 sm:size-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      :class="selectedTemplateId === template.id 
                        ? 'bg-[#09423c] shadow-lg scale-105' 
                        : 'bg-[#f1f7f6] group-hover:bg-[#09423c]/10'"
                    >
                      <UIcon 
                        :name="template.icon" 
                        class="size-7 sm:size-8 transition-colors"
                        :class="selectedTemplateId === template.id ? 'text-white' : 'text-[#09423c]'"
                      />
                    </div>

                    <!-- Content -->
                    <div class="flex-1 space-y-4 min-w-0">
                      <div>
                        <div class="flex items-center gap-3 mb-2">
                          <h3 
                            class="text-[18px] sm:text-[20px] font-extrabold transition-colors"
                            :class="selectedTemplateId === template.id ? 'text-[#09423c]' : 'text-gray-900'"
                          >
                            {{ template.title }}
                          </h3>
                        </div>
                        <p class="text-[13px] sm:text-[14px] text-[#6b8a87] leading-relaxed font-medium">
                          {{ template.description }}
                        </p>
                      </div>

                      <!-- Features -->
                      <div v-if="template.features.length > 0" class="flex flex-wrap gap-2 sm:gap-3">
                        <div 
                          v-for="feature in template.features" 
                          :key="feature" 
                          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-colors"
                          :class="selectedTemplateId === template.id 
                            ? 'bg-[#09423c]/10 text-[#09423c]' 
                            : 'bg-gray-100 text-gray-700'"
                        >
                          <UIcon 
                            :name="feature.includes('Trends') ? 'i-lucide-trending-up' : 
                                   feature.includes('Gaps') ? 'i-lucide-alert-triangle' : 
                                   feature.includes('Tasks') ? 'i-lucide-check-circle-2' : 
                                   feature.includes('Metrics') ? 'i-lucide-bar-chart-3' : 
                                   feature.includes('Score') ? 'i-lucide-award' : 
                                   feature.includes('Exposure') ? 'i-lucide-dollar-sign' : 
                                   feature.includes('Impact') ? 'i-lucide-activity' : 
                                   feature.includes('Recommendations') ? 'i-lucide-lightbulb' : 
                                   'i-lucide-check-circle'" 
                            class="size-3.5" 
                          />
                          <span>{{ feature }}</span>
                        </div>
                      </div>

                      <!-- Tags and Formats -->
                      <div class="flex flex-wrap gap-2 items-center">
                        <span 
                          v-for="tag in template.tags" 
                          :key="tag"
                          class="px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black rounded-md tracking-wider uppercase transition-colors"
                          :class="selectedTemplateId === template.id 
                            ? 'bg-[#09423c] text-white shadow-sm' 
                            : 'bg-gray-800 text-white'"
                        >
                          {{ tag }}
                        </span>
                        <span 
                          v-for="format in template.formats" 
                          :key="format"
                          class="px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold rounded-md border transition-colors"
                          :class="selectedTemplateId === template.id 
                            ? 'bg-white border-[#09423c] text-[#09423c]' 
                            : 'bg-white border-gray-300 text-gray-600'"
                        >
                          {{ format }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Preview & Options -->
            <div class="lg:col-span-5 space-y-8 lg:space-y-10">
              <!-- Report Preview -->
              <div class="space-y-4 lg:space-y-6">
                <h2 class="text-[12px] sm:text-[14px] font-black text-[#6b8a87] uppercase tracking-widest">Report Preview</h2>
                <div class="bg-white border border-[#e8f3f2] rounded-3xl p-4 sm:p-8 aspect-[4/5] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
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
                      @click="exportFormat = 'docx'"
                      class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all text-left group"
                      :class="exportFormat === 'docx' ? 'border-[#09423c] bg-[#f1f7f6]' : 'border-[#e8f3f2] bg-white hover:border-[#09423c]/20'"
                    >
                      <div 
                        class="size-4 sm:size-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        :class="exportFormat === 'docx' ? 'border-[#09423c]' : 'border-[#e8f3f2]'"
                      >
                        <div v-if="exportFormat === 'docx'" class="size-2 sm:size-2.5 bg-[#09423c] rounded-full"></div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="size-9 sm:size-10 bg-white rounded-lg border border-[#e8f3f2] flex items-center justify-center">
                          <UIcon name="i-lucide-file-text" class="size-5 sm:size-6 text-[#09423c]" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[13px] sm:text-[14px] font-bold text-[#09423c]">Word</span>
                          <span class="text-[10px] sm:text-[11px] text-[#6b8a87] font-medium">Document (.docx)</span>
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
          class="w-full sm:w-auto bg-[#09423c] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#07332e] transition-all shadow-xl shadow-[#09423c]/20 group"
        >
          <UIcon name="i-lucide-download" class="size-4 sm:size-5 group-hover:translate-y-0.5 transition-transform" />
          Generate & Download
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


