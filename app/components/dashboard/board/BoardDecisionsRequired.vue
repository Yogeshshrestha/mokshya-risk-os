<script setup lang="ts">
interface Decision {
  id: string
  title: string
  description: string
  cost: string
  benefit: string
  status: 'awaiting' | 'reviewing' | 'approved'
}

defineProps<{
  decisions: Decision[]
}>()

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'awaiting': return { text: 'Awaiting Approval', class: 'bg-[#fffbeb] text-[#92400e] border-[#fef3c7]' }
    case 'reviewing': return { text: 'Reviewing', class: 'bg-[#f8fafc] text-[#64748b] border-[#f1f5f9]' }
    case 'approved': return { text: 'Approved', class: 'bg-[#f0fdf4] text-[#166534] border-[#dcfce7]' }
    default: return { text: status, class: 'bg-gray-50 text-gray-500 border-gray-100' }
  }
}
</script>

<template>
  <div class="bg-[#f1f5f4] rounded-[32px] p-10 lg:p-12 space-y-10 border border-[#e2e8f0]/50 shadow-sm relative overflow-hidden">
    <div class="flex items-center justify-between px-2 relative z-10">
      <div class="flex items-center gap-5">
        <div class="size-12 rounded-xl bg-[#09423c] flex items-center justify-center shadow-lg shadow-[#09423c]/20">
          <UIcon name="i-lucide-gavel" class="size-6 text-white" />
        </div>
        <div class="space-y-0.5">
          <h3 class="text-[24px] font-black text-[#09423c] tracking-tight leading-none">Decisions Required</h3>
          <p class="text-[12px] text-[#4f9690] font-bold uppercase tracking-widest opacity-80">Action items for board approval</p>
        </div>
      </div>
    </div>
    
    <div class="space-y-6 relative z-10">
      <div v-for="decision in decisions" :key="decision.id" 
        class="bg-white rounded-[24px] p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between shadow-sm border border-white hover:border-[#e8f3f2] transition-all duration-300 group"
      >
        <!-- Left: Info -->
        <div class="flex-1 min-w-0 lg:pr-12 mb-6 lg:mb-0">
          <h4 class="text-[22px] font-black text-[#0e1b1a] mb-2 group-hover:text-[#09433e] transition-colors leading-tight">{{ decision.title }}</h4>
          <p class="text-[15px] text-[#64748b] font-bold opacity-90 leading-relaxed">{{ decision.description }}</p>
        </div>

        <!-- Middle: Cost/Benefit -->
        <div class="lg:px-12 lg:border-l border-[#f1f5f9] flex flex-col gap-2 min-w-[280px] mb-6 lg:mb-0">
          <span class="text-[9px] font-black text-[#94a3b8] uppercase tracking-[2px]">COST / BENEFIT</span>
          <div class="flex items-baseline gap-2">
            <span class="text-[28px] font-black text-[#0e1b1a] tracking-tighter leading-none">{{ decision.cost.split(' ')[0] }}</span>
            <span class="text-[14px] font-bold text-[#94a3b8] uppercase tracking-tighter">{{ decision.cost.split(' ').slice(1).join(' ') }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="size-1.5 rounded-full bg-[#10b981]"></div>
            <span class="text-[13px] font-black text-[#10b981] tracking-wide uppercase">{{ decision.benefit }}</span>
          </div>
        </div>

        <!-- Right: Status & Action -->
        <div class="lg:pl-12 flex items-center justify-between lg:justify-start gap-6 border-t lg:border-t-0 lg:border-l border-[#f1f5f9] pt-6 lg:pt-0">
          <span :class="['px-6 py-2.5 rounded-full text-[12px] font-black border uppercase tracking-[1.5px] shadow-sm', getStatusBadge(decision.status).class]">
            {{ getStatusBadge(decision.status).text }}
          </span>
          <button class="size-11 rounded-xl bg-[#f8fbfb] border border-[#e8f3f2] flex items-center justify-center group-hover:bg-[#09433e] group-hover:text-white transition-all">
            <UIcon name="i-lucide-arrow-right" class="size-5" />
          </button>
        </div>
      </div>

      <div v-if="decisions.length === 0" class="bg-white/40 rounded-[24px] p-16 text-center border border-dashed border-[#e8f3f2]">
        <p class="text-[16px] text-[#4f9690] font-bold italic opacity-60">No pending items requiring board decision.</p>
      </div>
    </div>
  </div>
</template>
