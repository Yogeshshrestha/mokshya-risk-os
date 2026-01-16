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
      
      let barColor = 'bg-[var(--color-primary)]'
      
      if (d.status === 'below_target') {
        barColor = 'bg-[var(--color-critical)]'
      } else if (current < target) {
        barColor = 'bg-[var(--color-warning)]'
      }
      
      return {
        ...d,
        id: d.domain,
        name: d.display_name,
        current_pct,
        target_pct,
        barColor,
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
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-xl font-bold text-[var(--color-title)] mb-1">Control Maturity Matrix</h3>
      <p class="text-sm text-[var(--color-subtitle)]">
        Current status vs target maturity across {{ domainsData.length }} domains
      </p>
    </div>

    <!-- Simple Info Card (replaces dark panel) -->
    <div 
      v-if="activeDomain"
      class="mb-6 p-4 bg-[var(--color-secondary)] rounded-lg border border-gray-200"
    >
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-semibold text-[var(--color-subtitle)] uppercase">{{ activeDomain.domain }}</span>
            <span 
              :class="['px-2 py-0.5 rounded text-xs font-semibold', 
                activeDomain.isAboveTarget ? 'bg-[var(--color-complete)]/10 text-[var(--color-complete)]' : 'bg-[var(--color-critical)]/10 text-[var(--color-critical)]']"
            >
              {{ activeDomain.status.replace('_', ' ') }}
            </span>
          </div>
          <h4 class="text-base font-semibold text-[var(--color-title)]">{{ activeDomain.display_name }}</h4>
        </div>
        <div class="flex items-center gap-6">
          <div>
            <span class="text-xs text-[var(--color-subtitle)] block mb-1">Current</span>
            <span class="text-lg font-bold text-[var(--color-title)]">{{ activeDomain.current_level.toFixed(1) }}/5.0</span>
          </div>
          <div>
            <span class="text-xs text-[var(--color-subtitle)] block mb-1">Target</span>
            <span class="text-lg font-bold text-[var(--color-title)]">{{ activeDomain.target_level.toFixed(1) }}/5.0</span>
          </div>
          <div>
            <span class="text-xs text-[var(--color-subtitle)] block mb-1">Gap</span>
            <span :class="['text-lg font-bold', activeDomain.gap >= 0 ? 'text-[var(--color-complete)]' : 'text-[var(--color-critical)]']">
              {{ activeDomain.gap > 0 ? '+' : '' }}{{ activeDomain.gap.toFixed(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-6 mb-4 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-[var(--color-primary)] rounded"></div>
        <span class="text-[var(--color-subtitle)]">Met Target</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-[var(--color-warning)] rounded"></div>
        <span class="text-[var(--color-subtitle)]">Below Target</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-[var(--color-critical)] rounded"></div>
        <span class="text-[var(--color-subtitle)]">Critical Gap</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-0.5 border-t-2 border-dashed border-[var(--color-subtitle)]/40"></div>
        <span class="text-[var(--color-subtitle)]">Target Line</span>
      </div>
    </div>
    
    <!-- Chart -->
    <div class="overflow-x-auto">
      <div class="relative min-w-[800px] h-[400px] flex items-end">
        <!-- Y-Axis Grid -->
        <div class="absolute inset-0 z-0">
          <div 
            v-for="level in levels" 
            :key="level.label"
            class="absolute w-full border-t border-gray-200"
            :style="{ bottom: `${level.value}%` }"
          >
            <div class="absolute -left-12 bg-white pr-2">
              <span class="text-xs font-medium text-[var(--color-subtitle)]">{{ level.label }} - {{ level.desc }}</span>
            </div>
          </div>
        </div>

        <!-- Bars -->
        <div class="relative z-10 w-full h-full flex items-end justify-around px-8">
          <div 
            v-for="domain in domainsData" 
            :key="domain.id" 
            class="relative h-full flex flex-col items-center justify-end"
            :style="{ width: `${100 / Math.max(domainsData.length, 10)}%`, maxWidth: '60px' }"
            @mouseenter="hoveredDomainId = domain.id"
          >
            <div class="w-full relative flex flex-col items-center justify-end h-full mb-12">
              <!-- Target Line -->
              <div 
                class="absolute left-[-20%] right-[-20%] h-0.5 border-t-2 border-dashed border-[var(--color-subtitle)]/40 z-20"
                :style="{ bottom: `${domain.target_pct}%` }"
              ></div>

              <!-- Bar Background -->
              <div class="w-full max-w-[40px] bg-[var(--color-secondary)] rounded-t-lg h-full"></div>
              
              <!-- Current Bar -->
              <div 
                :class="['w-full max-w-[40px] rounded-t-lg transition-all duration-300', domain.barColor]"
                :style="{ height: `${domain.current_pct}%` }"
              ></div>
            </div>
            
            <!-- Domain Label -->
            <div class="absolute bottom-0 w-full text-center">
              <span 
                class="text-xs font-medium text-[var(--color-subtitle)] block truncate"
                :class="{ 'font-bold text-[var(--color-title)]': hoveredDomainId === domain.id }"
              >
                {{ domain.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

