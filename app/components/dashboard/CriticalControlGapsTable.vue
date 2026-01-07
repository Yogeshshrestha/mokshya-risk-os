<script setup lang="ts">
const gaps = [
  {
    name: 'Vendor Risk Assessment',
    domain: 'Third-Party Risk',
    current: 'L1',
    target: 'L3',
    severity: 'Critical',
    priority: 'P0'
  },
  {
    name: 'Phishing Simulation',
    domain: 'Governance & Training',
    current: 'L2',
    target: 'L3',
    severity: 'High',
    priority: 'P1'
  },
  {
    name: 'Cloud MFA Enforcement',
    domain: 'Identity & Access',
    current: 'L1',
    target: 'L3',
    severity: 'Critical',
    priority: 'P0'
  },
  {
    name: 'EDR Deployment',
    domain: 'Endpoint Security',
    current: 'L2',
    target: 'L3',
    severity: 'Medium',
    priority: 'P2'
  }
]

const getSeverityClass = (severity: string) => {
  switch (severity) {
    case 'Critical': return 'bg-[#fee2e2] text-[#991b1b]'
    case 'High': return 'bg-[#ffedd5] text-[#9a3412]'
    case 'Medium': return 'bg-[#fef9c3] text-[#854d0e]'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full">
    <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center bg-white sticky top-0 z-10">
      <h3 class="text-[18px] font-extrabold text-[#0e1b1a]">Critical Control Gaps</h3>
      <button class="text-[13px] font-bold text-[#09433e] hover:opacity-80 cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#d0e6e5]/50 shadow-sm transition-all bg-gray-50/50">
        <span>Download Report</span>
        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    </div>
    
    <div class="overflow-x-auto flex-1">
      <table class="w-full text-left border-collapse min-w-[800px]">
        <thead class="bg-[#09423c]/80 text-white uppercase text-[11px] font-extrabold tracking-[1px] sticky top-0">
          <tr>
            <th class="px-6 py-4">Control Name</th>
            <th class="px-6 py-4">Domain</th>
            <th class="px-6 py-4 text-center">Current</th>
            <th class="px-6 py-4 text-center">Target</th>
            <th class="px-6 py-4">Risk Severity</th>
            <th class="px-6 py-4 text-center">Priority</th>
            <th class="px-6 py-4 text-right px-8">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#e8f3f2]">
          <tr v-for="gap in gaps" :key="gap.name" class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-6 py-5 text-[14px] text-[#0e1b1a] font-bold">{{ gap.name }}</td>
            <td class="px-6 py-5 text-[14px] text-[#4f9690] font-medium">{{ gap.domain }}</td>
            <td class="px-6 py-5 text-center">
              <span class="px-2.5 py-1 rounded bg-[#fef2f2] text-[#ef4444] text-[11px] font-extrabold border border-[#fecaca]/30">{{ gap.current }}</span>
            </td>
            <td class="px-6 py-5 text-center">
              <span class="px-2.5 py-1 rounded bg-gray-50 text-[#4f9690] text-[11px] font-extrabold border border-[#e8f3f2]">{{ gap.target }}</span>
            </td>
            <td class="px-6 py-5">
              <div class="flex items-center gap-2.5">
                <div :class="['size-2 rounded-full', gap.severity === 'Critical' ? 'bg-[#ef4444]' : gap.severity === 'High' ? 'bg-[#f59e0b]' : 'bg-[#10b981]']"></div>
                <span :class="['text-[12px] font-extrabold', gap.severity === 'Critical' ? 'text-[#ef4444]' : gap.severity === 'High' ? 'text-[#f59e0b]' : 'text-[#10b981]']">
                  {{ gap.severity }}
                </span>
              </div>
            </td>
            <td class="px-6 py-5 text-center text-[13px] font-extrabold text-[#0e1b1a]">{{ gap.priority }}</td>
            <td class="px-6 py-5 text-right px-8">
              <button class="text-[13px] font-extrabold text-[#09433e] hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                Assign Owner
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

