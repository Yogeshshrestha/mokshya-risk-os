<script setup lang="ts">
const props = defineProps<{
  companyName?: string
  companyAddress?: string
  companyCity?: string
  reportDate?: string
  reportReferenceId?: string
}>()

const formattedDate = props.reportDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

onMounted(async () => {
  // ensure DOM and fonts render, then signal readiness for capture
  await new Promise(resolve => setTimeout(resolve, 250))
  try { window.dispatchEvent(new CustomEvent('report-ready', { detail: { persona: 'cover' } })) } catch (e) { /* ignore */ }
})
</script>

<template>
  <div class="report-page bg-white p-12" style="width: 816px; max-width: 816px; height: 1056px; max-height: 1056px; overflow: hidden; margin: 0 auto;">
    <!-- Header -->
    <div class="mb-16">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded flex items-center justify-center">
            <!-- <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg> -->

            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.77454 19.4355C5.52316 18.8687 3.66456 17.5769 2.19874 15.5604C0.732912 13.5439 0 11.3047 0 8.84274V2.91465L7.77454 -0.000802994L15.5491 2.91465V8.84274C15.5491 11.3047 14.8162 13.5439 13.3503 15.5604C11.8845 17.5769 10.0259 18.8687 7.77454 19.4355ZM7.77454 17.3947C9.34564 16.9088 10.6576 15.9492 11.7104 14.5157C12.7632 13.0823 13.3787 11.4828 13.5569 9.71737H7.77454V2.06431L1.94363 4.2509V8.84274C1.94363 9.0209 1.94363 9.16667 1.94363 9.28005C1.94363 9.39343 1.95983 9.53921 1.99223 9.71737H7.77454V17.3947Z" fill="#09433E"/>
            </svg>

          </div>
          <span class="text-xl font-bold text-teal-800">MOKSHYA OS</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-1.5 border-2 border-teal-800 rounded-full bg-white shadow-sm">
          <svg class="w-4 h-4 text-teal-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span class="text-xs font-bold text-teal-800 tracking-wide">CONFIDENTIAL</span>
        </div>
      </div>
      <p class="text-teal-700 text-xs ml-10 tracking-widest">SECURITY INTELLIGENCE</p>
    </div>

    <!-- Main Title -->
    <div class="mb-auto mt-24">
      <div class="border-l-4 border-teal-800 pl-6 mb-8">
        <h1 class="text-6xl sm:text-7xl font-extrabold text-teal-800 leading-tight tracking-tight">CYBER RISK</h1>
        <h2 class="text-6xl sm:text-7xl font-extrabold text-teal-800 leading-tight tracking-tight">ASSESSMENT</h2>
        <h3 class="text-6xl sm:text-7xl font-extrabold text-teal-800 leading-tight tracking-tight">REPORT</h3>
      </div>
      
      <p class="text-xl sm:text-2xl text-teal-600 ml-6 leading-relaxed font-light">
        Comprehensive Analysis of<br>
        External Attack Surface &<br>
        Infrastructure Vulnerabilities
      </p>
    </div>

    <!-- Client Info -->
    <div class="mt-auto mb-16">
      <p class="text-xs text-gray-400 uppercase tracking-widest mb-5">PREPARED FOR</p>
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-7 h-7 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
            <path d="M10 6h4"/>
            <path d="M10 10h4"/>
            <path d="M10 14h4"/>
            <path d="M10 18h4"/>
          </svg>
        </div>
        <div>
          <h4 class="text-2xl font-bold text-gray-900 mb-2">{{ companyName || 'Mokshya AI' }}</h4>
          <p class="text-gray-500 text-sm">{{ companyAddress || '123 Enterprise Way' }}</p>
          <p class="text-gray-500 text-sm">{{ companyCity || 'Silicon Valley, CA 94025' }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-end pt-4">
      <div>
        <p class="text-xs text-teal-700 uppercase tracking-widest mb-2">ASSESSMENT DATE</p>
        <p class="text-xl font-semibold text-teal-800">{{ formattedDate }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-teal-700 uppercase tracking-widest mb-2">REPORT REFERENCE ID</p>
        <p class="text-xl font-semibold text-teal-800">{{ reportReferenceId || 'CRAR-2023-884' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-page {
  page-break-after: always;
  width: 816px;
  max-width: 816px;
  height: 1056px;
  max-height: 1056px;
}
</style>