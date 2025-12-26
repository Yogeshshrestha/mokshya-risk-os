<script setup lang="ts">
interface Props {
  variant?: 'default' | 'feature' | 'dashboard'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hover: true
})

const cardClasses = computed(() => {
  const base = 'rounded-lg border transition-all duration-300'
  
  const variants = {
    default: 'bg-white border-gray-200 shadow-sm',
    feature: 'bg-mokshya-light border border-green-100/50 rounded-3xl p-8 relative overflow-hidden shadow-sm',
    dashboard: 'bg-white rounded-xl shadow-2xl border-gray-100'
  }
  
  const hoverClass = props.hover ? 'hover:shadow-xl hover:-translate-y-1' : ''
  
  return [base, variants[props.variant], hoverClass].filter(Boolean).join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>


