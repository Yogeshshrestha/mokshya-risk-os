<script setup lang="ts">
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import { useAccordion } from '~/composables/useAccordion'

definePageMeta({
  layout: false
})

const route = useRoute()
const organizationId = route.params.id as string

const searchQuery = ref('')
const { toggle, isActive } = useAccordion(null)

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
    <DashboardSidebar />

    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
      <main class="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <!-- Header Section -->
        <div class="mb-10">
          <h1 class="text-[32px] font-extrabold text-[#09423c] mb-2 tracking-tight">Help & Support</h1>
          <p class="text-[16px] text-[#6b8a87] font-medium">Find answers and get help using Mokshya OS</p>
        </div>

        <!-- Search Bar -->
        <div class="mb-12 relative max-w-4xl">
          <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <UIcon name="i-lucide-search" class="size-5 text-[#6b8a87]" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for articles, guides, or troubleshooting..."
            class="w-full bg-[#f1f7f6] border border-transparent rounded-xl py-4.5 pl-13 pr-6 text-[#09423c] placeholder-[#6b8a87] font-medium focus:bg-white focus:border-[#09423c]/20 focus:ring-4 focus:ring-[#09423c]/5 transition-all outline-none"
          />
        </div>

        <!-- Quick Help Topics -->
        <div class="mb-14">
          <h2 class="text-[20px] font-bold text-[#09423c] mb-6">Quick Help Topics</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="topic in quickHelpTopics"
              :key="topic.title"
              class="bg-white border border-[#e8f3f2] p-8 rounded-2xl hover:shadow-md hover:border-[#09423c]/20 transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div class="size-14 bg-[#f1f7f6] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#09423c] transition-colors shadow-sm">
                <UIcon :name="topic.icon" class="size-7 text-[#09423c] group-hover:text-white transition-colors" />
              </div>
              <span class="font-bold text-[#09423c] text-[15px]">{{ topic.title }}</span>
            </div>
          </div>
        </div>

        <!-- FAQ and Docs Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <!-- Frequently Asked Questions -->
          <div class="lg:col-span-7">
            <h2 class="text-[20px] font-bold text-[#09423c] mb-6">Frequently Asked Questions</h2>
            <div class="space-y-4">
              <div 
                v-for="(faq, index) in faqs" 
                :key="index"
                class="bg-white border border-[#e8f3f2] rounded-xl overflow-hidden transition-all"
                :class="{ 'border-[#09423c]/20 shadow-sm': isActive(index) }"
              >
                <button
                  @click="toggle(index)"
                  class="w-full flex items-center justify-between p-5 text-left font-bold text-[#09423c] hover:bg-gray-50/50 transition-colors"
                >
                  <span class="text-[15px] pr-8">{{ faq.q }}</span>
                  <UIcon 
                    name="i-lucide-chevron-down" 
                    class="size-5 text-[#6b8a87] transition-transform duration-300"
                    :class="{ 'rotate-180': isActive(index) }" 
                  />
                </button>
                <div
                  class="overflow-hidden transition-all duration-300 ease-in-out"
                  :style="{ maxHeight: isActive(index) ? '200px' : '0' }"
                >
                  <div class="px-5 pb-5 text-[#4f9690] text-[14px] leading-relaxed font-medium">
                    {{ faq.a }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documentation & Guides -->
          <div class="lg:col-span-5">
            <h2 class="text-[20px] font-bold text-[#09423c] mb-6">Documentation & Guides</h2>
            <div class="bg-white border border-[#e8f3f2] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#e8f3f2]">
              <div
                v-for="doc in docsAndGuides"
                :key="doc.title"
                class="p-5 flex items-center justify-between hover:bg-[#f1f7f6]/30 transition-colors cursor-pointer group"
              >
                <div class="flex items-center gap-4">
                  <div class="size-10 bg-[#f1f7f6] rounded-lg flex items-center justify-center shadow-sm">
                    <UIcon :name="doc.icon" class="size-5 text-[#09423c]" />
                  </div>
                  <span class="font-bold text-[#09423c] text-[15px]">{{ doc.title }}</span>
                </div>
                <UIcon
                  :name="doc.type === 'external' ? 'i-lucide-external-link' : 'i-lucide-arrow-right'"
                  class="size-5 text-[#6b8a87] group-hover:text-[#09423c] group-hover:translate-x-1 transition-all"
                  :class="{ 'group-hover:translate-x-0 group-hover:scale-110': doc.type === 'external' }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Still need help footer -->
        <div class="bg-[#f1f7f6]/50 border border-[#e8f3f2] rounded-[32px] p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div class="max-w-2xl text-center lg:text-left">
            <h2 class="text-[28px] font-extrabold text-[#09423c] mb-4 tracking-tight">Still need help?</h2>
            <p class="text-[#6b8a87] text-[15px] mb-8 leading-relaxed font-medium">
              Our support team is available Monday through Friday, 9am - 6pm EST. We typically respond within 2 hours.
            </p>
            <div class="flex items-center justify-center lg:justify-start gap-3.5 text-[#09423c] font-bold text-[15px]">
              <div class="size-9 bg-[#09423c] rounded-lg flex items-center justify-center">
                <UIcon name="i-lucide-mail" class="size-5 text-white" />
              </div>
              <span>support@mokshya.os</span>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-8">
            <button class="text-[#09423c] font-bold text-[15px] hover:underline transition-all">Request a Walkthrough</button>
            <button class="bg-[#09423c] text-white px-10 py-4.5 rounded-xl font-bold flex items-center gap-3.5 hover:bg-[#07332e] transition-all shadow-xl shadow-[#09423c]/15 group">
              <div class="size-6 bg-white/10 rounded-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <UIcon name="i-lucide-message-square" class="size-4" />
              </div>
              Contact Support
            </button>
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

