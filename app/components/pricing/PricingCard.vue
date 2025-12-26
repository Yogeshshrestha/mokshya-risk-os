<script setup lang="ts">
import type { PricingPlan } from '~/types'

interface Props {
  plan: PricingPlan
}

const props = defineProps<Props>()

const isPopular = computed(() => props.plan.popular === true)

const buttonClasses = computed(() => {
  const base = 'w-full py-4 mb-5 px-8 rounded-lg font-bold text-base transition-all duration-300 cursor-pointer'
  
  if (props.plan.buttonVariant === 'light') {
    return `${base} bg-mokshya-light text-mokshya-dark hover:bg-green-100/50`
  } else if (props.plan.buttonVariant === 'outline') {
    return `${base} bg-white border-2 border-mokshya-dark text-mokshya-dark hover:bg-mokshya-light`
  } else {
    // primary (default)
    return `${base} bg-mokshya-dark text-white hover:bg-opacity-90 hover:shadow-xl hover:-translate-y-0.5`
  }
})
</script>

<template>
  <div
    :class="[
      'relative bg-white border rounded-3xl p-8 transition-all duration-300 h-full flex flex-col',
      isPopular
        ? 'border-2 border-[#09423C] shadow-xl'
        : 'border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
    ]"
  >
    <!-- Popular Badge - extends above card -->
    <div v-if="isPopular" class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
      <span class="inline-flex items-center rounded-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#09423C] text-white shadow-lg whitespace-nowrap">
        {{ plan.badge }}
      </span>
    </div>

    <!-- Badge (if not popular) - inside card at top -->
    <div v-else-if="plan.badge" class="mb-6">
      <span class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-green-100/50 text-mokshya-dark bg-[#0FBD491A] whitespace-nowrap">
        {{ plan.badge }}
      </span>
    </div>

    <!-- Plan Header -->
    <div class="mb-6" :class="{ 'mt-2': isPopular }">
      <h3 class="text-2xl font-bold text-mokshya-dark mb-2">
        {{ plan.name }}
      </h3>
      <p v-if="plan.description" class="text-mokshya-gray text-sm leading-relaxed">
        {{ plan.description }}
      </p>
    </div>

    <!-- Price -->
    <div class="mb-4">
      <div class="flex items-baseline gap-2">
        <span class="text-5xl font-bold text-mokshya-dark">
          {{ plan.price }}
        </span>
        <span v-if="plan.period" class="text-mokshya-gray text-lg">
          /{{ plan.period }}
        </span>
      </div>
      <p v-if="plan.billingNote" class="text-mokshya-gray text-sm mt-2">
        {{ plan.billingNote }}
      </p>
    </div>

      <!-- CTA Button -->
    <button :class="buttonClasses">
      {{ plan.ctaText }}
    </button>
    
    <!-- Includes Label (for plans that include previous tier) -->
    <div v-if="plan.includesLabel" class="mb-4">
      <p class="text-xs font-bold uppercase tracking-wider text-mokshya-dark">
        {{ plan.includesLabel }}
      </p>
    </div>

    <!-- Features List -->
    <ul class="flex-1 space-y-4 mb-8">
      <li
        v-for="(feature, index) in plan.features"
        :key="index"
        class="flex items-start gap-3"
      >
        <div
          :class="[
            'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5',
            isPopular ? 'bg-mokshya-light border border-green-100/50' : 'bg-mokshya-light border border-green-100/50'
          ]"
        >
          <UIcon
            name="i-lucide-check"
            :class="[
              'w-3 h-3',
              isPopular ? 'text-mokshya-green' : 'text-mokshya-green'
            ]"
          />
        </div>
        <span class="text-mokshya-text text-sm leading-relaxed">
          {{ feature }}
        </span>
      </li>
    </ul> 
  
  </div>
</template>

