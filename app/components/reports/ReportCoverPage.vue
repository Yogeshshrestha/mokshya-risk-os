<script setup lang="ts">
interface Props {
  reportType: 'cro' | 'ciso' | 'board'
  organizationName: string
  generatedDate: string
}

const props = defineProps<Props>()

const reportTitles = {
  cro: 'Chief Risk Officer Report',
  ciso: 'Chief Information Security Officer Report',
  board: 'Board of Directors Report'
}

const reportSubtitles = {
  cro: 'Comprehensive Risk Assessment & Financial Exposure Analysis',
  ciso: 'Security Posture & Control Maturity Assessment',
  board: 'Executive Cyber Risk Summary'
}

const reportIcons = {
  cro: 'i-lucide-shield-check',
  ciso: 'i-lucide-shield-alert',
  board: 'i-lucide-trending-up'
}
</script>

<template>
  <div class="w-full h-full bg-white flex flex-col items-center justify-center p-12 relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-[0.02]" style="background-image: radial-gradient(#09423c 0.5px, transparent 0.5px); background-size: 24px 24px;"></div>
    
    <!-- Top Logo/Branding -->
    <div class="absolute top-12 left-12 flex items-center gap-3">
      <div class="size-12 bg-[#09423c] rounded-xl flex items-center justify-center">
        <UIcon name="i-lucide-box" class="size-7 text-white" />
      </div>
      <div>
        <h3 class="text-[14px] font-black text-[#09423c] tracking-tight">MOKSHYA</h3>
        <p class="text-[10px] font-bold text-[#4f9690] uppercase tracking-widest">Risk OS</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 text-center max-w-2xl">
      <!-- Icon -->
      <div class="size-24 bg-[#e8f3f2] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-white">
        <UIcon :name="reportIcons[reportType]" class="size-14 text-[#09423c]" />
      </div>

      <!-- Report Type Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-[#09423c] text-white rounded-full mb-6">
        <span class="text-[11px] font-black uppercase tracking-widest">{{ reportType.toUpperCase() }} Report</span>
      </div>

      <!-- Title -->
      <h1 class="text-[42px] font-extrabold text-[#09423c] mb-4 tracking-tight leading-tight">
        {{ reportTitles[reportType] }}
      </h1>

      <!-- Subtitle -->
      <p class="text-[18px] text-[#4f9690] mb-12 leading-relaxed font-medium">
        {{ reportSubtitles[reportType] }}
      </p>

      <!-- Organization Info -->
      <div class="bg-[#f8fbfb] border border-[#e8f3f2] rounded-2xl p-8 mb-8">
        <div class="space-y-4">
          <div>
            <p class="text-[11px] font-bold text-[#4f9690] uppercase tracking-widest mb-2">Organization</p>
            <p class="text-[20px] font-black text-[#09423c]">{{ organizationName }}</p>
          </div>
          <div class="h-px bg-[#e8f3f2]"></div>
          <div>
            <p class="text-[11px] font-bold text-[#4f9690] uppercase tracking-widest mb-2">Report Generated</p>
            <p class="text-[16px] font-bold text-[#09423c]">{{ new Date(generatedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
        </div>
      </div>

      <!-- Confidentiality Notice -->
      <div class="flex items-center justify-center gap-2 text-[#6b8a87]">
        <UIcon name="i-lucide-lock" class="size-4" />
        <span class="text-[11px] font-bold uppercase tracking-wider">Confidential & Proprietary</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-12 left-12 right-12 flex justify-between items-center text-[10px] text-[#94a3b8] font-medium">
      <span>© {{ new Date().getFullYear() }} Mokshya Risk OS</span>
      <span>Generated: {{ new Date(generatedDate).toLocaleString() }}</span>
    </div>
  </div>
</template>
