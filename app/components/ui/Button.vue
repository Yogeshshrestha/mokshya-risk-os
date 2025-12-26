<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false
})

const buttonClasses = computed(() => {
  const base = 'font-bold rounded-lg transition-all duration-300 inline-flex items-center justify-center'
  
  const variants = {
    primary: 'bg-mokshya-dark text-white hover:bg-opacity-90 hover:shadow-xl hover:-translate-y-0.5',
    secondary: 'bg-white border border-mokshya-dark text-mokshya-dark hover:bg-gray-50',
    outline: 'bg-transparent border border-white/20 text-white hover:bg-white/10',
    ghost: 'bg-transparent hover:bg-gray-50'
  }
  
  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-8 text-base',
    lg: 'py-4 px-10 text-lg'
  }
  
  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.fullWidth && 'w-full'
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <button :class="buttonClasses">
    <slot />
  </button>
</template>


