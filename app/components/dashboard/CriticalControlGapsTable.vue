<script setup lang="ts">
import type { RedFlag, CriticalControlGapsSection } from '~/types/dashboard'

interface Props {
  redFlags: RedFlag[]
  gapsSection?: CriticalControlGapsSection
}

const props = defineProps<Props>()

const getSeverityClass = (severity: string) => {
  const s = severity.toLowerCase()
  switch (s) {
    case 'critical': return 'bg-[var(--color-critical)]/10 text-[var(--color-critical)]'
    case 'high':
    case 'major': return 'bg-[var(--color-high)]/10 text-[var(--color-high)]'
    case 'medium': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
    case 'low': return 'bg-[var(--color-complete)]/10 text-[var(--color-complete)]'
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
  <div class="bg-white border border-gray-200 rounded-[16px] shadow-sm overflow-hidden flex flex-col h-full">
    <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
      <div class="flex flex-col gap-1">
        <h3 class="text-[18px] font-extrabold text-[var(--color-title)]">Critical Security Gaps (Red Flags)</h3>
        <div v-if="gapsSection" class="flex items-center gap-3 text-[11px] font-bold text-[var(--color-subtitle)]">
          <span>{{ gapsSection.total_gaps }} Total Gaps</span>
          <span v-if="gapsSection.critical_count > 0" class="px-2 py-0.5 bg-[var(--color-critical)]/10 text-[var(--color-critical)] rounded border border-[var(--color-critical)]/20">
            {{ gapsSection.critical_count }} Critical
          </span>
          <span v-if="gapsSection.high_count > 0" class="px-2 py-0.5 bg-[var(--color-high)]/10 text-[var(--color-high)] rounded border border-[var(--color-high)]/20">
            {{ gapsSection.high_count }} High
          </span>
          <span v-if="gapsSection.medium_count > 0" class="px-2 py-0.5 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded border border-[var(--color-warning)]/20">
            {{ gapsSection.medium_count }} Medium
          </span>
          <span v-if="gapsSection.low_count && gapsSection.low_count > 0" class="px-2 py-0.5 bg-[var(--color-complete)]/10 text-[var(--color-complete)] rounded border border-[var(--color-complete)]/20">
            {{ gapsSection.low_count }} Low
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-1 bg-[var(--color-critical)]/10 text-[var(--color-critical)] text-[11px] font-bold rounded uppercase tracking-wider border border-[var(--color-critical)]/20">
          {{ redFlags.length }} Issues
        </span>
      </div>
    </div>
    
    <div class="overflow-x-auto flex-1 custom-scrollbar">
      <table class="w-full text-left border-collapse min-w-[800px]">
        <thead class="bg-[var(--color-secondary)] text-[var(--color-subtitle)] uppercase text-[11px] font-bold tracking-widest sticky top-0 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4">Triggered Control</th>
            <th class="px-6 py-4">Domain</th>
            <th class="px-6 py-4 text-center">Status</th>
            <th class="px-6 py-4">Risk Severity</th>
            <th class="px-6 py-4 text-center">Priority</th>
            <th class="px-6 py-4 text-right px-8">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="flag in redFlags" :key="flag.code" class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-6 py-5">
              <div class="flex flex-col">
                <span class="text-[14px] text-[var(--color-title)] font-bold leading-tight">{{ flag.question_text }}</span>
                <span class="text-[11px] text-[var(--color-subtitle)]/60 mt-1 line-clamp-1">{{ flag.recommendation || flag.remediation }}</span>
              </div>
            </td>
            <td class="px-6 py-5 text-[13px] text-[var(--color-subtitle)] font-bold uppercase tracking-tighter">{{ flag.category }}</td>
            <td class="px-6 py-5 text-center">
              <span class="px-2.5 py-1 rounded bg-[var(--color-critical)]/10 text-[var(--color-critical)] text-[11px] font-bold border border-[var(--color-critical)]/20 uppercase tracking-tighter">Triggered</span>
            </td>
            <td class="px-6 py-5">
              <div class="flex items-center gap-2.5">
                <div :class="['size-2 rounded-full shadow-sm', flag.severity === 'critical' ? 'bg-[var(--color-critical)]' : (flag.severity === 'major' || flag.severity === 'high') ? 'bg-[var(--color-high)]' : 'bg-[var(--color-complete)]']"></div>
                <span :class="['text-[11px] font-bold uppercase tracking-wider', flag.severity === 'critical' ? 'text-[var(--color-critical)]' : (flag.severity === 'major' || flag.severity === 'high') ? 'text-[var(--color-high)]' : 'text-[var(--color-complete)]']">
                  {{ flag.severity }}
                </span>
              </div>
            </td>
            <td class="px-6 py-5 text-center text-[13px] font-black text-[var(--color-title)]">{{ getPriority(flag.severity) }}</td>
            <td class="px-6 py-5 text-right px-8">
              <button class="text-[12px] font-black text-[var(--color-primary)] hover:bg-[var(--color-secondary)] px-4 py-2 rounded-lg border border-[var(--color-primary)]/10 transition-all uppercase tracking-tighter cursor-pointer">
                Fix Now
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="redFlags.length === 0" class="p-16 text-center">
        <div class="flex flex-col items-center justify-center">
          <div class="size-16 bg-[var(--color-complete)]/10 rounded-full flex items-center justify-center mb-4">
            <UIcon name="i-lucide-shield-check" class="size-8 text-[var(--color-complete)]" />
          </div>
          <p class="text-[16px] font-bold text-[var(--color-title)]">No Critical Gaps Detected</p>
          <p class="text-[13px] text-[var(--color-subtitle)] mt-1">Your security posture is meeting all critical requirements.</p>
        </div>
      </div>
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
