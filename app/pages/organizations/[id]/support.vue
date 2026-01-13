<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import { useAccordion } from '~/composables/useAccordion'

definePageMeta({
  layout: false
})

const route = useRoute()
const organizationId = route.params.id as string

const searchQuery = ref('')
const { toggle, isActive } = useAccordion(null)
const selectedPersona = ref('cro')

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

const quickHelpTopics = [
  { title: 'Getting Started', icon: 'i-lucide-rocket' },
  { title: 'Risk Modeling', icon: 'i-lucide-pie-chart' },
  { title: 'User Management', icon: 'i-lucide-users' },
  { title: 'Integrations', icon: 'i-lucide-puzzle' }
]

const faqs = [
  {
    q: 'How is the composite risk score calculated?',
    a: 'The composite risk score is calculated using a weighted average of various risk factors, including asset criticality, threat likelihood, and control effectiveness.'
  },
  {
    q: 'Can I export reports to PDF or CSV?',
    a: 'Yes, you can export most reports and data tables to both PDF and CSV formats. Look for the export icon in the top right corner of relevant sections.'
  },
  {
    q: 'How do I invite new team members?',
    a: 'To invite team members, go to Settings > Team and click on the "Invite User" button.'
  },
  {
    q: 'What data sources are supported for integration?',
    a: 'Mokshya OS supports a wide range of integrations including cloud providers (AWS, Azure, GCP), security tools, and identity providers.'
  }
]

const docsAndGuides = [
  { title: 'User Guide (PDF)', icon: 'i-lucide-book-open', type: 'internal' },
  { title: 'API Documentation', icon: 'i-lucide-code-2', type: 'external' },
  { title: 'Release Notes', icon: 'i-lucide-clipboard-check', type: 'internal' },
  { title: 'Video Tutorials', icon: 'i-lucide-play-circle', type: 'internal' }
]
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
        title="Help & Support"
        v-model:persona="selectedPersona"
        @toggle-sidebar="toggleSidebar"
      />

      <main class="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 lg:p-12">
        <div class="max-w-7xl mx-auto w-full">
          <!-- Header Section -->
          <div class="mb-6 sm:mb-10">
            <h1 class="text-[24px] sm:text-[32px] font-extrabold text-[#09423c] mb-1 sm:mb-2 tracking-tight">Help & Support</h1>
            <p class="text-[14px] sm:text-[16px] text-[#6b8a87] font-medium">Find answers and get help using Mokshya OS</p>
          </div>

          <!-- Search Bar -->
          <div class="mb-8 sm:mb-12 relative max-w-4xl">
            <div class="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none">
              <UIcon name="i-lucide-search" class="size-4 sm:size-5 text-[#6b8a87]" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for articles, guides..."
              class="w-full bg-[#f1f7f6] border border-transparent rounded-xl py-3 sm:py-4.5 pl-10 sm:pl-13 pr-4 sm:pr-6 text-[14px] sm:text-[16px] text-[#09423c] placeholder-[#6b8a87] font-medium focus:bg-white focus:border-[#09423c]/20 focus:ring-4 focus:ring-[#09423c]/5 transition-all outline-none"
            />
          </div>

          <!-- Quick Help Topics -->
          <div class="mb-10 sm:mb-14">
            <h2 class="text-[18px] sm:text-[20px] font-bold text-[#09423c] mb-4 sm:mb-6">Quick Help Topics</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div
                v-for="topic in quickHelpTopics"
                :key="topic.title"
                class="bg-white border border-[#e8f3f2] p-6 sm:p-8 rounded-2xl hover:shadow-md hover:border-[#09423c]/20 transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div class="size-12 sm:size-14 bg-[#f1f7f6] rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-[#09423c] transition-colors shadow-sm">
                  <UIcon :name="topic.icon" class="size-6 sm:size-7 text-[#09423c] group-hover:text-white transition-colors" />
                </div>
                <span class="font-bold text-[#09423c] text-[14px] sm:text-[15px]">{{ topic.title }}</span>
              </div>
            </div>
          </div>

          <!-- FAQ and Docs Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-10 sm:mb-16">
            <!-- Frequently Asked Questions -->
            <div class="lg:col-span-7">
              <h2 class="text-[18px] sm:text-[20px] font-bold text-[#09423c] mb-4 sm:mb-6">Frequently Asked Questions</h2>
              <div class="space-y-3 sm:space-y-4">
                <div 
                  v-for="(faq, index) in faqs" 
                  :key="index"
                  class="bg-white border border-[#e8f3f2] rounded-xl overflow-hidden transition-all"
                  :class="{ 'border-[#09423c]/20 shadow-sm': isActive(index) }"
                >
                  <button
                    @click="toggle(index)"
                    class="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-[#09423c] hover:bg-gray-50/50 transition-colors"
                  >
                    <span class="text-[14px] sm:text-[15px] pr-6 sm:pr-8">{{ faq.q }}</span>
                    <UIcon 
                      name="i-lucide-chevron-down" 
                      class="size-4 sm:size-5 text-[#6b8a87] transition-transform duration-300 flex-shrink-0"
                      :class="{ 'rotate-180': isActive(index) }" 
                    />
                  </button>
                  <div
                    class="overflow-hidden transition-all duration-300 ease-in-out"
                    :style="{ maxHeight: isActive(index) ? '300px' : '0' }"
                  >
                    <div class="px-4 sm:px-5 pb-4 sm:pb-5 text-[#4f9690] text-[13px] sm:text-[14px] leading-relaxed font-medium border-t border-gray-50 pt-4">
                      {{ faq.a }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documentation & Guides -->
            <div class="lg:col-span-5">
              <h2 class="text-[18px] sm:text-[20px] font-bold text-[#09423c] mb-4 sm:mb-6">Documentation & Guides</h2>
              <div class="bg-white border border-[#e8f3f2] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#e8f3f2]">
                <div
                  v-for="doc in docsAndGuides"
                  :key="doc.title"
                  class="p-4 sm:p-5 flex items-center justify-between hover:bg-[#f1f7f6]/30 transition-colors cursor-pointer group"
                >
                  <div class="flex items-center gap-3 sm:gap-4">
                    <div class="size-9 sm:size-10 bg-[#f1f7f6] rounded-lg flex items-center justify-center shadow-sm">
                      <UIcon :name="doc.icon" class="size-4.5 sm:size-5 text-[#09423c]" />
                    </div>
                    <span class="font-bold text-[#09423c] text-[14px] sm:text-[15px]">{{ doc.title }}</span>
                  </div>
                  <UIcon
                    :name="doc.type === 'external' ? 'i-lucide-external-link' : 'i-lucide-arrow-right'"
                    class="size-4 sm:size-5 text-[#6b8a87] group-hover:text-[#09423c] group-hover:translate-x-1 transition-all flex-shrink-0"
                    :class="{ 'group-hover:translate-x-0 group-hover:scale-110': doc.type === 'external' }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Still need help footer -->
          <div class="bg-[#f1f7f6]/50 border border-[#e8f3f2] rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10">
            <div class="max-w-2xl text-center lg:text-left">
              <h2 class="text-[22px] sm:text-[28px] font-extrabold text-[#09423c] mb-2 sm:mb-4 tracking-tight">Still need help?</h2>
              <p class="text-[#6b8a87] text-[14px] sm:text-[15px] mb-6 sm:mb-8 leading-relaxed font-medium">
                Our support team is available Monday through Friday, 9am - 6pm EST. We typically respond within 2 hours.
              </p>
              <div class="flex items-center justify-center lg:justify-start gap-3 text-[#09423c] font-bold text-[14px] sm:text-[15px]">
                <div class="size-8 sm:size-9 bg-[#09423c] rounded-lg flex items-center justify-center">
                  <UIcon name="i-lucide-mail" class="size-4 sm:size-5 text-white" />
                </div>
                <span>support@mokshya.os</span>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
              <button class="text-[#09423c] font-bold text-[14px] sm:text-[15px] hover:underline transition-all order-2 sm:order-1">Request a Walkthrough</button>
              <button class="w-full sm:w-auto bg-[#09423c] text-white px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#07332e] transition-all shadow-xl shadow-[#09423c]/15 group order-1 sm:order-2">
                <div class="size-5 sm:size-6 bg-white/10 rounded-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <UIcon name="i-lucide-message-square" class="size-3.5 sm:size-4" />
                </div>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

:deep(.support-accordion [data-reka-accordion-item]) {
  margin-bottom: 1rem;
}
</style>

