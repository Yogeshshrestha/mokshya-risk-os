<script setup lang="ts">
import type { DashboardRisk } from '~/types/dashboard'

interface Props {
  risks: DashboardRisk[]
  organizationId?: string
}

const props = defineProps<Props>()
const route = useRoute()

const organizationId = computed(() => props.organizationId || (route.params.id as string))

const getStatusClass = (status: string) => {
  const s = status.toLowerCase()
  switch (s) {
    case 'critical': return 'bg-[#fee2e2] text-[#991b1b]'
    case 'high': return 'bg-[#ffedd5] text-[#9a3412]'
    case 'medium': return 'bg-[#fef9c3] text-[#854d0e]'
    case 'low': return 'bg-[#f0fdf4] text-[#166534]'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getActionText = (risk: DashboardRisk) => {
  if (risk.treatment === 'mitigate') return 'Mitigate'
  if (risk.treatment === 'avoid') return 'Avoid'
  if (risk.treatment === 'transfer') return 'Transfer'
  if (risk.treatment === 'accept') return 'Accept'
  return 'Review'
}

</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full">
    <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center bg-white sticky top-0 z-10">
      <h3 class="text-[18px] font-bold text-[#0e1b1a]">Risk (Top Priority)</h3>
      <NuxtLink 
        v-if="risks.length > 0"
        :to="`/organizations/${organizationId}/risks`"
        class="text-[14px] font-medium text-[#09433e] hover:underline cursor-pointer"
      >
        View All
      </NuxtLink>
    </div>
    
    <div v-if="risks.length === 0" class="flex-1 flex items-center justify-center p-12">
      <div class="flex flex-col items-center justify-center text-center max-w-sm">
        <div class="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-lucide-shield-alert" class="size-8 text-gray-300" />
        </div>
        <h3 class="text-[16px] font-bold text-[#0e1b1a] mb-2">No Risks Identified</h3>
        <p class="text-[13px] text-[#4f9690] mb-6 leading-relaxed">
          Start building your risk register by identifying and reporting risks for your organization.
        </p>
        <NuxtLink 
          :to="`/organizations/${organizationId}/risks`"
          class="inline-flex items-center gap-2 bg-[#09423C] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#07332e] transition-colors"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          Report Risk
        </NuxtLink>
      </div>
    </div>
    
    <div v-else class="overflow-x-auto flex-1">
      <table class="w-full text-left border-collapse min-w-[600px]">
        <thead class="bg-[#09423c]/80 text-white uppercase text-[12px] font-bold tracking-[0.6px] sticky top-0">
          <tr>
            <th class="px-6 py-4">Risk ID</th>
            <th class="px-6 py-4">Description</th>
            <th class="px-6 py-4">RAG Status</th>
            <th class="px-6 py-4">Owner</th>
            <th class="px-6 py-4">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#e8f3f2]">
          <tr v-for="risk in risks" :key="risk.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4 text-[14px] text-[#0e1b1a] whitespace-nowrap">{{ risk.risk_id }}</td>
            <td class="px-6 py-4 text-[14px] text-[#0e1b1a]">{{ risk.title }}</td>
            <td class="px-6 py-4">
              <span :class="['px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap inline-block', getStatusClass(risk.risk_rating)]">
                {{ risk.risk_rating.toUpperCase() }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <div class="size-6 rounded-full overflow-hidden bg-[#e8f3f2] flex items-center justify-center">
                  <span class="text-[10px] font-bold text-[#09423c]">{{ risk.risk_owner.split(' ').map(n => n[0]).join('') }}</span>
                </div>
                <span class="text-[14px] text-[#4f9690]">{{ risk.risk_owner }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink 
                :to="`/organizations/${organizationId}/risks/${risk.id}`"
                class="text-[13px] font-medium text-[#09433e] hover:underline cursor-pointer"
              >
                {{ getActionText(risk) }}
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
