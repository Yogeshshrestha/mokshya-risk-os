<script setup lang="ts">
interface Props {
  title: string
  value: string
  secondaryValue?: string
  trend?: string
  trendColor?: string
  trendIcon?: string
  icon: string
  iconBg?: string
  valueColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  trendColor: 'text-[#4f9690]',
  iconBg: 'bg-[#e8f3f2]',
  valueColor: 'text-[#0e1b1a]'
})

const getIconPath = (iconName: string) => {
  // Simple mapping for demo purposes
  const icons: Record<string, string> = {
    'i-lucide-layers': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    'i-lucide-dollar-sign': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.73 1.07M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.73-1.07M12 16V15m10-3a9 9 0 11-18 0 9 9 0 0118 0z',
    'i-lucide-flag': 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
    'i-lucide-shield-check': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'i-lucide-trending-down': 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
    'i-lucide-trending-up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    'i-lucide-arrow-right': 'M14 5l7 7m0 0l-7 7m7-7H3',
    'i-lucide-check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'i-lucide-zap': 'M13 10V3L4 14h7v7l9-11h-7z',
    'i-lucide-fingerprint': 'M12 10v4m0 0v4m0-4h4m-4 0H8m10-7a9 9 0 11-18 0 9 9 0 0118 0z',
    'i-lucide-shield': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    'i-lucide-database': 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    'i-lucide-minus': 'M20 12H4'
  }
  return icons[iconName] || ''
}
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] min-h-[160px] h-full rounded-[16px] shadow-sm p-6 flex flex-col justify-between group hover:border-[#09433e]/20 transition-all">
    <div class="flex justify-between items-start mb-4">
      <span class="text-[11px] font-black text-[#4f9690] uppercase tracking-[0.1em]">
        {{ title }}
      </span>
      <div :class="['size-[32px] rounded-[8px] flex items-center justify-center shadow-sm', iconBg]">
        <svg class="size-4.5 text-[#4f9690] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(icon)" />
        </svg>
      </div>
    </div>
    
    <div>
      <div class="flex items-baseline gap-2 mb-2">
        <h3 :class="['text-[28px] font-extrabold leading-none', valueColor]">
          {{ value }}
        </h3>
        <span v-if="secondaryValue" class="text-[13px] font-bold text-[#4f9690] opacity-60">
          {{ secondaryValue }}
        </span>
      </div>
      <div v-if="trend" class="flex items-start gap-2 group relative">
        <div v-if="trendIcon" class="mt-0.5 flex-shrink-0">
          <svg :class="['size-3.5', trendColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="getIconPath(trendIcon)" />
          </svg>
        </div>
        <span :class="['text-[11px] font-bold leading-tight line-clamp-2', trendColor]" :title="trend">
          {{ trend }}
        </span>
      </div>
    </div>
  </div>
</template>
