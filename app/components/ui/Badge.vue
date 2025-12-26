<script setup lang="ts">
interface Props {
  variant?: 'default' | 'success' | 'warning' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest'
  
  const variants = {
    default: 'bg-mokshya-light border border-green-100/50 text-mokshya-dark',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  }
  
  return [base, variants[props.variant]].join(' ')
})
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>


