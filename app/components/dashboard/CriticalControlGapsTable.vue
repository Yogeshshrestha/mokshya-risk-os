<script setup lang="ts">
import type { RedFlag } from '~/types/dashboard'

interface Props {
  redFlags: RedFlag[]
}

const props = defineProps<Props>()

const getSeverityClass = (severity: string) => {
  const s = severity.toLowerCase()
  switch (s) {
    case 'critical': return 'bg-[#fee2e2] text-[#991b1b]'
    case 'high':
    case 'major': return 'bg-[#ffedd5] text-[#9a3412]'
    case 'medium': return 'bg-[#fef9c3] text-[#854d0e]'
    case 'low': return 'bg-[#f0fdf4] text-[#166534]'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPriority = (severity: string) => {
  const s = severity.toLowerCase()
  if (s === 'critical') return 'P0'
  if (s === 'high' || s === 'major') return 'P1'
  if (s === 'medium') return 'P2'
  return 'P3'
}

</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm overflow-hidden flex flex-col h-full">
    <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center bg-white sticky top-0 z-10">
      <h3 class="text-[18px] font-extrabold text-[#0e1b1a]">Critical Security Gaps (Red Flags)</h3>
      <div class="flex items-center gap-2">
        <span class="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded uppercase tracking-wider border border-rose-100">
          {{ redFlags.length }} Critical Issues
        </span>
      </div>
    </div>
    
    <div class="overflow-x-auto flex-1 custom-scrollbar">
      <table class="w-full text-left border-collapse min-w-[800px]">
        <thead class="bg-[#f8fbfb] text-[#4f9690] uppercase text-[10px] font-black tracking-widest sticky top-0 border-b border-[#e8f3f2]">
          <tr>
            <th class="px-6 py-4">Triggered Control</th>
            <th class="px-6 py-4">Domain</th>
            <th class="px-6 py-4 text-center">Status</th>
            <th class="px-6 py-4">Risk Severity</th>
            <th class="px-6 py-4 text-center">Priority</th>
            <th class="px-6 py-4 text-right px-8">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#e8f3f2]">
          <tr v-for="flag in redFlags" :key="flag.code" class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-6 py-5">
              <div class="flex flex-col">
                <span class="text-[14px] text-[#0e1b1a] font-bold leading-tight">{{ flag.question_text }}</span>
                <span class="text-[11px] text-[#94a3b8] mt-1 line-clamp-1">{{ flag.recommendation || flag.remediation }}</span>
              </div>
            </td>
            <td class="px-6 py-5 text-[13px] text-[#4f9690] font-bold uppercase tracking-tighter">{{ flag.category }}</td>
            <td class="px-6 py-5 text-center">
              <span class="px-2.5 py-1 rounded bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-100 uppercase tracking-tighter">Triggered</span>
            </td>
            <td class="px-6 py-5">
              <div class="flex items-center gap-2.5">
                <div :class="['size-2 rounded-full shadow-sm', flag.severity === 'critical' ? 'bg-[#ef4444]' : (flag.severity === 'major' || flag.severity === 'high') ? 'bg-[#f59e0b]' : 'bg-[#10b981]']"></div>
                <span :class="['text-[11px] font-black uppercase tracking-wider', flag.severity === 'critical' ? 'text-[#ef4444]' : (flag.severity === 'major' || flag.severity === 'high') ? 'text-[#f59e0b]' : 'text-[#10b981]']">
                  {{ flag.severity }}
                </span>
              </div>
            </td>
            <td class="px-6 py-5 text-center text-[13px] font-black text-[#0e1b1a]">{{ getPriority(flag.severity) }}</td>
            <td class="px-6 py-5 text-right px-8">
              <button class="text-[12px] font-black text-[#09433e] hover:bg-[#e8f3f2] px-4 py-2 rounded-lg border border-[#09433e]/10 transition-all uppercase tracking-tighter cursor-pointer">
                Fix Now
              </button>
            </td>
          </tr>
          <tr v-if="redFlags.length === 0">
            <td colspan="6" class="px-6 py-16 text-center">
              <div class="flex flex-col items-center justify-center">
                <div class="size-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <UIcon name="i-lucide-shield-check" class="size-8 text-emerald-500" />
                </div>
                <p class="text-[16px] font-bold text-[#0e1b1a]">No Critical Gaps Detected</p>
                <p class="text-[13px] text-[#4f9690] mt-1">Your security posture is meeting all critical requirements.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
