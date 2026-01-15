<script setup lang="ts">
import type { RemediationTaskTracker } from '~/types/dashboard'

interface Props {
  tracker: RemediationTaskTracker
}

const props = defineProps<Props>()

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-50 text-emerald-600'
    case 'in_progress': return 'bg-blue-50 text-blue-600'
    case 'overdue': return 'bg-rose-50 text-rose-600'
    default: return 'bg-gray-50 text-gray-600'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'p0': return 'text-rose-600 font-black'
    case 'p1': return 'text-orange-600 font-bold'
    case 'p2': return 'text-amber-600 font-bold'
    default: return 'text-blue-600 font-medium'
  }
}
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[16px] shadow-sm flex flex-col h-full overflow-hidden">
    <div class="px-6 py-5 border-b border-[#e8f3f2] flex justify-between items-center bg-white sticky top-0 z-10">
      <div class="flex flex-col gap-1">
        <h3 class="text-[16px] font-bold text-[#0e1b1a]">Remediation Task Tracker</h3>
        <div class="flex items-center gap-2 text-[11px] font-bold text-[#4f9690]">
          <span>{{ tracker.total_tasks }} Total</span>
          <span class="text-gray-300">•</span>
          <span v-if="tracker.open > 0" class="px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded">{{ tracker.open }} Open</span>
          <span v-if="tracker.in_progress > 0" class="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{{ tracker.in_progress }} In Progress</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-[11px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded" v-if="tracker.overdue > 0">
          {{ tracker.overdue }} Overdue
        </span>
        <span class="text-[11px] font-bold text-[#4f9690] uppercase tracking-widest">
          {{ tracker.done }}/{{ tracker.total_tasks }} Done
        </span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div v-if="tracker.tasks.length === 0" class="p-12 text-center">
        <div class="size-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <UIcon name="i-lucide-clipboard-check" class="size-6 text-gray-300" />
        </div>
        <p class="text-[14px] font-bold text-[#0e1b1a]">No Tasks Found</p>
        <p class="text-[12px] text-[#4f9690]">All identified gaps are currently being addressed.</p>
      </div>

      <div v-else class="divide-y divide-[#e8f3f2]">
        <div v-for="task in tracker.tasks" :key="task.id" class="p-5 hover:bg-gray-50/50 transition-colors group">
          <div class="flex items-start justify-between gap-4 mb-2">
            <div class="flex flex-col gap-1 min-w-0">
              <div class="flex items-center gap-2">
                <span :class="['text-[10px] uppercase tracking-tighter', getPriorityColor(task.priority)]">{{ task.priority }}</span>
                <span class="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{{ task.control_name }}</span>
              </div>
              <h4 class="text-[14px] font-bold text-[#0e1b1a] truncate group-hover:text-[#09423c] transition-colors">{{ task.task_name }}</h4>
            </div>
            <span :class="['px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter whitespace-nowrap', getStatusColor(task.status)]">
              {{ task.status.replace('_', ' ') }}
            </span>
          </div>
          
          <div class="flex items-center justify-between mt-4">
            <div class="flex items-center gap-2">
              <div class="size-6 rounded-full bg-[#e8f3f2] flex items-center justify-center text-[10px] font-bold text-[#09433e] border border-white shadow-sm">
                {{ task.owner.initials }}
              </div>
              <span class="text-[12px] text-[#4f9690] font-medium">{{ task.owner.full_name }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div v-if="task.progress_percentage > 0" class="flex items-center gap-1.5">
                <div class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: `${task.progress_percentage}%` }"></div>
                </div>
                <span class="text-[10px] font-bold text-[#94a3b8]">{{ task.progress_percentage }}%</span>
              </div>
              <div class="flex items-center gap-1.5 text-[#94a3b8]">
                <UIcon name="i-lucide-calendar" class="size-3.5" />
                <span class="text-[11px] font-bold">{{ task.due_date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="px-6 py-4 bg-[#f8fbfb] border-t border-[#e8f3f2] flex justify-between items-center">
      <button class="text-[12px] font-black text-[#09433e] hover:underline uppercase tracking-widest cursor-pointer">
        View All Tasks
      </button>
      <div class="flex gap-1">
        <div v-for="i in 3" :key="i" class="size-1.5 rounded-full bg-[#09433e]/20"></div>
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
