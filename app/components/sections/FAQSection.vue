<script setup lang="ts">
import { FAQ_ITEMS } from '~/constants/data'
import { useAccordion } from '~/composables/useAccordion'

const { activeIndex, toggle, isActive } = useAccordion(0)
</script>

<template>
  <section id="about-us" class="py-24 bg-mokshya-light scroll-mt-20">
    <UContainer>
      <div class="lg:grid lg:grid-cols-12 gap-16">
        <div class="lg:col-span-5 text-center lg:text-left">
          <span class="text-mokshya-dark font-bold uppercase tracking-widest text-xs block mb-4">
            About Us
          </span>
          <h2 class="text-4xl font-bold text-mokshya-text mb-8">
            Bridging the Gap
          </h2>
          <p class="text-lg text-mokshya-gray leading-relaxed">
            Mokshya was founded on a simple belief: security shouldn't be a black box. By translating complex cyber signals into financial language, we empower organizations to make smarter risk decisions and secure the right insurance coverage at the right price.
          </p>
        </div>
        <div class="lg:col-span-7 mt-12 lg:mt-0 space-y-6">
          <FAQAccordion
            v-for="(item, index) in FAQ_ITEMS"
            :key="index"
            :question="item.q"
            :answer="item.a"
            :is-active="isActive(index)"
            @toggle="() => toggle(index)"
          />
        </div>
      </div>
    </UContainer>
  </section>
</template>

