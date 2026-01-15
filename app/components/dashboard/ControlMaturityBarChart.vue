<script setup lang="ts">
import type { CategoryScore } from '~/types/global-questionnaire'
import type { ControlDomain } from '~/types/dashboard'

const props = defineProps<{
  scores?: Record<string, CategoryScore>
  domains?: ControlDomain[]
}>()

const hoveredDomainId = ref<string | null>(null)

const domainsData = computed(() => {
  if (props.domains && props.domains.length > 0) {
    return props.domains.map(d => {
      const current = d.current_level || 0
      const target = d.target_level || 3.0
      const current_pct = (current / 5) * 100
      const target_pct = (target / 5) * 100
      
      let gradientClass = 'from-[#09433e] to-[#0d635c]'
      let textColor = 'text-[#09433e]'
      let bgColor = 'bg-[#09433e]'
      
      if (d.status === 'below_target') {
        gradientClass = 'from-[#ef4444] to-[#f87171]'
        textColor = 'text-[#ef4444]'
        bgColor = 'bg-[#ef4444]'
      } else if (current < target) {
        gradientClass = 'from-[#f59e0b] to-[#fbbf24]'
        textColor = 'text-[#f59e0b]'
        bgColor = 'bg-[#f59e0b]'
      }
      
      return {
        ...d,
        id: d.domain,
        name: d.display_name.toUpperCase(),
        current_pct,
        target_pct,
        gradientClass,
        textColor,
        bgColor,
        isAboveTarget: d.status === 'above_target' || current >= target
      }
    })
  }
  return []
})

// Default to showing the first domain's info if nothing is hovered, 
// or keep it empty until first hover - let's default to first for better UI
const activeDomain = computed(() => 
  domainsData.value.find(d => d.id === hoveredDomainId.value) || domainsData.value[0]
)

const levels = [
  { label: 'L5', value: 100, desc: 'Optimized' },
  { label: 'L4', value: 80, desc: 'Managed' },
  { label: 'L3', value: 60, desc: 'Defined' },
  { label: 'L2', value: 40, desc: 'Repeatable' },
  { label: 'L1', value: 20, desc: 'Initial' },
]
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[24px] shadow-sm p-8 flex flex-col h-full relative overflow-hidden">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
      <div>
        <h3 class="text-[22px] font-black text-[#0e1b1a] tracking-tight">Control Maturity Matrix</h3>
        <p class="text-[14px] font-medium text-[#4f9690] mt-0.5 opacity-70">
          Comparing current status against target L3 maturity across {{ domainsData.length }} domains
        </p>
      </div>
      
      <!-- Legend -->
      <div class="flex items-center gap-5 bg-[#f8fbfb] px-5 py-2.5 rounded-full border border-[#e8f3f2]">
        <div class="flex items-center gap-2">
          <div class="size-2.5 bg-[#09433e] rounded-full"></div>
          <span class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider">Met</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="size-2.5 bg-[#ef4444] rounded-full"></div>
          <span class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider">Gap</span>
        </div>
        <div class="w-px h-3 bg-[#e8f3f2]"></div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-[2px] bg-[#4f9690] border-t border-dashed opacity-60"></div>
          <span class="text-[11px] font-bold text-[#4f9690] uppercase tracking-wider">Target</span>
        </div>
      </div>
    </div>

    <!-- 
      NEW: Active Detail Panel 
      This solves the clipping issue completely by moving details to a dedicated non-scrolling area.
      It also looks much more professional and provides "each and every detail" clearly.
    -->
    <div 
      v-if="activeDomain"
      class="mb-8 p-6 bg-[#0e1b1a] rounded-2xl text-white flex flex-wrap items-center justify-between gap-8 shadow-xl transition-all duration-300 border-l-[6px]"
      :style="{ borderLeftColor: activeDomain.isAboveTarget ? '#09433e' : '#ef4444' }"
    >
      <div class="flex-1 min-w-[240px]">
        <div class="flex items-center gap-3 mb-1.5">
          <span class="text-[10px] font-black text-white/40 uppercase tracking-[2px]">{{ activeDomain.domain }}</span>
          <div 
            :class="['px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm', 
              activeDomain.isAboveTarget ? 'bg-[#09433e] text-white' : 'bg-[#ef4444] text-white']"
          >
            {{ activeDomain.status.replace('_', ' ') }}
          </div>
        </div>
        <h4 class="text-[20px] font-bold leading-tight tracking-tight">{{ activeDomain.display_name }}</h4>
      </div>

      <div class="flex items-center gap-10">
        <div class="flex flex-col">
          <span class="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Current Level</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-[28px] font-black leading-none">{{ activeDomain.current_level.toFixed(1) }}</span>
            <span class="text-[12px] text-white/30 font-bold">/ 5.0</span>
          </div>
        </div>
        
        <div class="flex flex-col">
          <span class="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Variance (Gap)</span>
          <div :class="['flex items-center gap-1.5 text-[24px] font-black leading-none', activeDomain.gap >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]']">
            <span>{{ activeDomain.gap > 0 ? '+' : '' }}{{ activeDomain.gap.toFixed(1) }}</span>
            <svg v-if="activeDomain.gap >= 0" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M7 7l10 10m0 0H7m10 0V7"/></svg>
          </div>
        </div>

        <div class="flex flex-col">
          <span class="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Questions</span>
          <div class="flex items-baseline gap-1">
            <span class="text-[24px] font-black leading-none">{{ activeDomain.questions_answered }}</span>
            <span v-if="activeDomain.total_questions" class="text-[12px] text-white/30 font-bold">/ {{ activeDomain.total_questions }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chart Scrolling Area -->
    <div class="flex-1 overflow-x-auto custom-scrollbar-h pb-8 -mx-4 px-4">
      <!-- Added extra top padding for target labels that might overflow slightly -->
      <div class="relative min-w-[950px] h-[320px] mt-4 flex items-end">
        
        <!-- Y-Axis Grid & Dynamic Background Highlights -->
        <div class="absolute inset-0 z-0 pointer-events-none">
          <div 
            v-for="level in levels" 
            :key="level.label"
            class="absolute w-full border-t border-[#e8f3f2] flex items-center transition-all duration-300"
            :style="{ bottom: `${level.value}%` }"
            :class="{ 'border-[#09433e]/20 z-10': activeDomain?.current_pct >= level.value - 2 && activeDomain?.current_pct <= level.value + 2 }"
          >
            <div class="absolute -left-1 bg-white pr-3 py-1 flex items-baseline gap-2">
              <span class="text-[11px] font-black text-[#4f9690]/40 tracking-tighter">{{ level.label }}</span>
              <span class="text-[9px] font-bold text-[#4f9690]/20 uppercase tracking-widest">{{ level.desc }}</span>
            </div>
          </div>
        </div>

        <!-- Bars Container -->
        <div class="relative z-10 w-full h-full flex items-end justify-around px-12">
          <div 
            v-for="domain in domainsData" 
            :key="domain.id" 
            class="group relative h-full flex flex-col items-center justify-end transition-all duration-500"
            :style="{ width: `${100 / Math.max(domainsData.length, 10)}%`, maxWidth: '64px' }"
            @mouseenter="hoveredDomainId = domain.id"
          >
            <!-- Bar Content -->
            <div class="w-full relative flex flex-col items-center justify-end h-full mb-14">
              
              <!-- Individual Target Marker Line -->
              <div 
                class="absolute left-[-25%] right-[-25%] h-[2px] border-t-2 border-dashed border-[#4f9690]/50 z-20 pointer-events-none flex items-center justify-between px-1"
                :style="{ bottom: `${domain.target_pct}%` }"
              >
                <div class="size-1 bg-[#4f9690]/50 rounded-full"></div>
                <div class="size-1 bg-[#4f9690]/50 rounded-full"></div>
              </div>

              <!-- Bar Background Slot (The gray container) -->
              <div class="w-full max-w-[36px] bg-[#f8fbfb] rounded-full absolute inset-0 bottom-0 border border-[#e8f3f2]/60 transition-colors group-hover:bg-[#f0f7f7]"></div>
              
              <!-- Current Maturity Bar (The progress) -->
              <div 
                :class="['w-full max-w-[36px] rounded-full transition-all duration-1000 ease-out relative z-10 shadow-lg bg-gradient-to-t overflow-hidden group-hover:scale-105 group-hover:brightness-110', domain.gradientClass]"
                :style="{ height: `${domain.current_pct}%` }"
              >
                <!-- Glossy Overlay -->
                <div class="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 to-transparent"></div>
                
                <!-- Inner Progress Text (Shows when tall enough) -->
                <div v-if="domain.current_pct > 20" class="absolute top-2.5 left-0 right-0 text-center scale-90 opacity-80">
                  <span class="text-[10px] font-black text-white leading-none">{{ domain.current_level.toFixed(1) }}</span>
                </div>
              </div>

              <!-- Alert Dot for Below Target -->
              <div 
                v-if="!domain.isAboveTarget" 
                class="absolute -bottom-2.5 size-2 bg-[#ef4444] rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"
              ></div>
            </div>
            
            <!-- Domain Label -->
            <div class="absolute bottom-0 w-[140px] text-center">
              <span 
                class="text-[9px] font-black text-[#4f9690] uppercase leading-tight tracking-[0.8px] block truncate transition-all duration-300 px-2"
                :class="{ 'text-[#0e1b1a] scale-110 font-black': hoveredDomainId === domain.id, 'opacity-40': hoveredDomainId && hoveredDomainId !== domain.id }"
              >
                {{ domain.name }}
              </span>
            </div>

            <!-- Hover Backdrop / Selection Highlight -->
            <div 
              v-if="hoveredDomainId === domain.id"
              class="absolute inset-x-[-20%] top-0 bottom-[-30px] bg-[#f8fbfb]/80 rounded-2xl -z-10 border border-[#e8f3f2] animate-in fade-in zoom-in duration-300"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar-h::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar-h::-webkit-scrollbar-track {
  background: #f8fbfb;
  border-radius: 10px;
}
.custom-scrollbar-h::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar-h::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fade-in;
}

.zoom-in {
  animation-name: zoom-in;
}

.custom-scrollbar-h {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fbfb;
}
</style>
