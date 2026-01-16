<script setup lang="ts">
const props = defineProps<{
  statusLabel: string
  trendDescription: string 
  complianceScore?: number
  riskTier?: string
  exposureScore?: number
  trend?: string
  trendPercentage?: number
}>()

// Get color based on risk tier (A-F)
const getRiskTierColor = (tier: string | undefined) => {
  if (!tier) return 'var(--color-subtitle)'
  const tierUpper = tier.toUpperCase()
  
  // A, B = Good (complete)
  if (tierUpper === 'A' || tierUpper === 'B') {
    return 'var(--color-complete)'
  }
  // C = Medium (warning)
  if (tierUpper === 'C') {
    return 'var(--color-warning)'
  }
  // D = High (high)
  if (tierUpper === 'D') {
    return 'var(--color-high)'
  }
  // E, F = Critical (critical)
  if (tierUpper === 'E' || tierUpper === 'F') {
    return 'var(--color-critical)'
  }
  return 'var(--color-subtitle)'
}

// Get background color for risk tier
const getRiskTierBgColor = (tier: string | undefined) => {
  if (!tier) return 'var(--color-secondary)'
  const tierUpper = tier.toUpperCase()
  
  if (tierUpper === 'A' || tierUpper === 'B') {
    return 'var(--color-complete)'
  }
  if (tierUpper === 'C') {
    return 'var(--color-warning)'
  }
  if (tierUpper === 'D') {
    return 'var(--color-high)'
  }
  if (tierUpper === 'E' || tierUpper === 'F') {
    return 'var(--color-critical)'
  }
  return 'var(--color-secondary)'
}

// Get color based on exposure score (0-100)
const getExposureColor = (score: number | undefined) => {
  if (score === undefined || score === null) return 'var(--color-subtitle)'
  
  // 0-10: Good (complete)
  if (score <= 10) {
    return 'var(--color-complete)'
  }
  // 11-20: Warning (warning)
  if (score <= 20) {
    return 'var(--color-warning)'
  }
  // 21-30: High (high)
  if (score <= 30) {
    return 'var(--color-high)'
  }
  // 31+: Critical (critical)
  return 'var(--color-critical)'
}

// Get background color for exposure
const getExposureBgColor = (score: number | undefined) => {
  if (score === undefined || score === null) return 'var(--color-secondary)'
  
  if (score <= 10) {
    return 'var(--color-complete)'
  }
  if (score <= 20) {
    return 'var(--color-warning)'
  }
  if (score <= 30) {
    return 'var(--color-high)'
  }
  return 'var(--color-critical)'
}

// Get color based on compliance score (0-100)
const getComplianceColor = (score: number | undefined) => {
  if (score === undefined || score === null) return 'var(--color-subtitle)'
  
  // 80-100: Good (complete)
  if (score >= 80) {
    return 'var(--color-complete)'
  }
  // 60-79: Warning (warning)
  if (score >= 60) {
    return 'var(--color-warning)'
  }
  // 40-59: High (high)
  if (score >= 40) {
    return 'var(--color-high)'
  }
  // 0-39: Critical (critical)
  return 'var(--color-critical)'
}

// Get background color for compliance
const getComplianceBgColor = (score: number | undefined) => {
  if (score === undefined || score === null) return 'var(--color-secondary)'
  
  if (score >= 80) {
    return 'var(--color-complete)'
  }
  if (score >= 60) {
    return 'var(--color-warning)'
  }
  if (score >= 40) {
    return 'var(--color-high)'
  }
  return 'var(--color-critical)'
}

// Get actual hex color value based on risk tier (for inline styles)
const getStatusColorHex = (tier: string | undefined) => {
  if (!tier) return '#4B5563' // subtitle color
  const tierUpper = tier.toUpperCase()
  
  // A, B = Good (complete) - #22C55E
  if (tierUpper === 'A' || tierUpper === 'B') {
    return '#22C55E'
  }
  // C = Medium (warning) - #F59E0B
  if (tierUpper === 'C') {
    return '#F59E0B'
  }
  // D = High (high) - #EA580C
  if (tierUpper === 'D') {
    return '#EA580C'
  }
  // E, F = Critical (critical) - #DC2626
  if (tierUpper === 'E' || tierUpper === 'F') {
    return '#DC2626'
  }
  return '#4B5563'
}

// Get overall status color based on risk tier (for the main circle)
const getStatusColor = computed(() => {
  return getRiskTierBgColor(props.riskTier)
})

// Get actual hex color for dynamic styling
const statusColorHex = computed(() => {
  return getStatusColorHex(props.riskTier)
})

// Get status icon based on risk tier
const getStatusIcon = computed(() => {
  if (!props.riskTier) return 'i-lucide-shield-check'
  const tierUpper = props.riskTier.toUpperCase()
  
  if (tierUpper === 'A' || tierUpper === 'B') {
    return 'i-lucide-shield-check'
  }
  if (tierUpper === 'C') {
    return 'i-lucide-shield-alert'
  }
  if (tierUpper === 'D' || tierUpper === 'E' || tierUpper === 'F') {
    return 'i-lucide-shield-x'
  }
  return 'i-lucide-shield-check'
})
</script>

<template>
  <div class="bg-white border border-[#e8f3f2] rounded-[24px] p-8 flex flex-col items-center justify-center text-center h-full shadow-sm relative overflow-hidden group">
    <span class="text-[11px] font-bold text-[#64748b] uppercase tracking-[2px] mb-8">Overall Cyber Risk Status</span>
    
    <div class="relative mb-6 flex items-center justify-center">
      <!-- Icon wrapper with dynamic color -->
      <div 
        class="relative w-24 h-24 rounded-full flex items-center justify-center"
        :style="{ 
          backgroundColor: '#ecfdf5',
        }"
      >
        <UIcon 
          name="i-lucide-check-circle" 
          class="size-12 text-[#10b981]"
        />
        
        <!-- Small shield icon -->
        <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
           <UIcon name="i-lucide-shield" class="size-4 text-[#94a3b8]" />
        </div>
      </div>
    </div>
    
    <h2 class="text-[32px] font-black text-[#0e1b1a] mb-2 tracking-tight leading-none">{{ statusLabel }}</h2>
    <p class="text-[14px] text-[#64748b] font-medium leading-snug">{{ trendDescription }}</p>
  </div>
</template>

<style scoped>
/* Force icon color using currentColor inheritance */
.dynamic-status-icon-wrapper,
.dynamic-activity-icon-wrapper {
  color: var(--icon-color) !important;
}

/* Target SVG elements - use currentColor for stroke */
.dynamic-status-icon-wrapper :deep(svg),
.dynamic-activity-icon-wrapper :deep(svg) {
  color: currentColor !important;
  stroke: currentColor !important;
}

/* Target all SVG child elements - multiple selectors for maximum compatibility */
.dynamic-status-icon-wrapper :deep(svg path),
.dynamic-status-icon-wrapper :deep(svg circle),
.dynamic-status-icon-wrapper :deep(svg rect),
.dynamic-status-icon-wrapper :deep(svg line),
.dynamic-status-icon-wrapper :deep(svg polyline),
.dynamic-status-icon-wrapper :deep(svg polygon),
.dynamic-status-icon-wrapper :deep(svg ellipse),
.dynamic-status-icon-wrapper :deep(svg g),
.dynamic-activity-icon-wrapper :deep(svg path),
.dynamic-activity-icon-wrapper :deep(svg circle),
.dynamic-activity-icon-wrapper :deep(svg rect),
.dynamic-activity-icon-wrapper :deep(svg line),
.dynamic-activity-icon-wrapper :deep(svg polyline),
.dynamic-activity-icon-wrapper :deep(svg polygon),
.dynamic-activity-icon-wrapper :deep(svg ellipse),
.dynamic-activity-icon-wrapper :deep(svg g) {
  stroke: currentColor !important;
  fill: none !important;
  color: currentColor !important;
}

/* Fallback - direct color assignment for all nested elements */
.dynamic-status-icon-wrapper :deep(svg *),
.dynamic-activity-icon-wrapper :deep(svg *) {
  stroke: var(--icon-color) !important;
  fill: none !important;
  color: var(--icon-color) !important;
}

/* Additional fallback - target any element inside the wrapper */
.dynamic-status-icon-wrapper :deep(*),
.dynamic-activity-icon-wrapper :deep(*) {
  stroke: var(--icon-color) !important;
  color: var(--icon-color) !important;
}
</style>

<style>
/* Global styles to ensure icon color applies - using attribute selector with CSS variable */
[data-icon-color] {
  --dynamic-icon-color: attr(data-icon-color);
}

[data-icon-color] svg,
[data-icon-color] svg * {
  stroke: var(--icon-color, currentColor) !important;
  fill: none !important;
  color: var(--icon-color, currentColor) !important;
}

[data-icon-color] svg path,
[data-icon-color] svg circle,
[data-icon-color] svg rect,
[data-icon-color] svg line,
[data-icon-color] svg polyline,
[data-icon-color] svg polygon,
[data-icon-color] svg ellipse,
[data-icon-color] svg g {
  stroke: var(--icon-color, currentColor) !important;
  fill: none !important;
  color: var(--icon-color, currentColor) !important;
}
</style>
