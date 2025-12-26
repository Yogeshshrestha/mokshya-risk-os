/**
 * Composable for accordion functionality
 */

export const useAccordion = (initialIndex: number | null = null) => {
  const activeIndex = ref<number | null>(initialIndex)

  const toggle = (index: number) => {
    activeIndex.value = activeIndex.value === index ? null : index
  }

  const isActive = (index: number) => {
    return activeIndex.value === index
  }

  return {
    activeIndex: readonly(activeIndex),
    toggle,
    isActive
  }
}


