<script setup lang="ts">
interface Props {
  actions: string[]
}

const props = defineProps<Props>()
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm p-6 h-full flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-[16px] font-bold text-[#0e1b1a]">Priority Mitigation Roadmap</h3>
      <span class="px-2.5 py-1 bg-[#e8f3f2] text-[#09433e] text-[10px] font-black rounded-md uppercase tracking-wider">
        {{ actions.length }} Tasks
      </span>
    </div>
    
    <div class="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div v-for="(action, index) in actions" :key="index" 
        class="relative pl-8 pb-4 group last:pb-0"
      >
        <!-- Connector Line -->
        <div v-if="index !== actions.length - 1" class="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100 group-hover:bg-[#e8f3f2] transition-colors"></div>
        
        <!-- Dot -->
        <div class="absolute left-0 top-1.5 size-[24px] bg-[#f8fbfb] border-2 border-gray-100 rounded-full flex items-center justify-center z-10 group-hover:border-[#09433e] group-hover:bg-[#e8f3f2] transition-all">
          <span class="text-[10px] font-bold text-[#94a3b8] group-hover:text-[#09433e]">{{ index + 1 }}</span>
        </div>

        <div class="bg-[#f8fbfb]/50 border border-transparent group-hover:border-[#e8f3f2] group-hover:bg-white rounded-xl p-3 transition-all">
          <p class="text-[13px] text-[#0e1b1a] font-semibold leading-snug">{{ action }}</p>
          <div class="flex items-center gap-3 mt-2">
            <span class="flex items-center gap-1 text-[10px] font-bold text-[#4f9690] uppercase tracking-tighter">
              <UIcon name="i-lucide-clock" class="size-3" />
              High Priority
            </span>
            <span class="flex items-center gap-1 text-[10px] font-bold text-[#09433e] uppercase tracking-tighter">
              <UIcon name="i-lucide-shield" class="size-3" />
              Intelligence Driven
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="actions.length === 0" class="flex flex-col items-center justify-center h-full py-8 text-center">
        <div class="size-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <UIcon name="i-lucide-check-circle" class="size-6 text-emerald-500" />
        </div>
        <p class="text-[14px] font-bold text-[#0e1b1a]">Posture Optimized</p>
        <p class="text-[12px] text-[#4f9690]">No immediate actions required.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
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
