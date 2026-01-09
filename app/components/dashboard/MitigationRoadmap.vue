<script setup lang="ts">
interface Props {
  actions: string[]
}

const props = defineProps<Props>()
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
    <h3 class="text-[16px] font-bold text-[#0e1b1a] mb-6">Priority Actions</h3>
    
    <div class="space-y-4 flex-1">
      <div v-for="(action, index) in actions" :key="index" class="flex items-start gap-4 pb-4 border-b border-[#f8fbfb] last:border-0 last:pb-0">
        <div class="size-6 bg-[#e8f3f2] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <UIcon name="i-lucide-check-circle-2" class="size-4 text-[#09433e]" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] text-[#0e1b1a] font-medium leading-snug">{{ action }}</p>
        </div>
      </div>
      <div v-if="actions.length === 0" class="flex items-center justify-center h-full text-[#4f9690] text-sm">
        No immediate actions required.
      </div>
    </div>
  </div>
</template>
