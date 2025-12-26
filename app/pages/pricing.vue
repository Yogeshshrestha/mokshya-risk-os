<script setup lang="ts">
import { PRICING_PLANS } from '~/constants/data'
import PricingCard from '~/components/pricing/PricingCard.vue'
import BillingToggle from '~/components/pricing/BillingToggle.vue'
import PricingFeatureCard from '~/components/pricing/PricingFeatureCard.vue'

const billingPeriod = ref<'monthly' | 'annual'>('annual')

useSeoMeta({
  title: 'Pricing - Mokshya OS',
  description: 'Choose the right plan for your organization. Transparent pricing for cyber risk intelligence.'
})
</script>

<template>
  <div class="font-sans text-mokshya-text overflow-hidden  ">
    <!-- Hero Section -->
    <section class="relative pt-20 overflow-hidden bg-[#F6F8F8]">
      <UContainer class="relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-4xl lg:text-5xl font-bold text-mokshya-dark mb-6">
            Simple, Transparent Pricing for Confident Risk Decisions
          </h1>
          <p class="text-xl text-mokshya-gray mb-8 leading-relaxed">
            Choose the plan that fits your organization's risk maturity — from fast assessments to full insurance-ready intelligence.
          </p> 
        </div>
      </UContainer>
    </section>

    <!-- Pricing Cards Section -->
    <section class="py-16 bg-[#F6F8F8]">
      <UContainer>
        <div class="text-center max-w-4xl mx-auto mb-12"> 
          <BillingToggle v-model="billingPeriod" />
        </div>
        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            v-for="(plan, index) in PRICING_PLANS"
            :key="index"
            :plan="plan"
          />
        </div>
      </UContainer>
    </section>

    <!-- Features/Benefits Section -->
    <section class="py-24 bg-[#F6F8F8]">
      <UContainer>
        <div class="grid md:grid-cols-4 max-w-6xl mx-auto">
          <PricingFeatureCard
            v-for="(feature, index) in [
              {
                title: 'Designed for CROs & Boards',
                description: 'Tailored specifically for executive decision-making.',
                icon: 'i-lucide-briefcase'
              },
              {
                title: 'Insurance-grade methodology',
                description: 'Aligned with underwriter requirements.',
                icon: 'i-lucide-shield-check'
              },
              {
                title: 'Audit-ready & defensible',
                description: 'Defensible data for board meetings.',
                icon: 'i-lucide-activity'
              },
              {
                title: 'Certified Security',
                description: 'ISO 27001',
                description2: 'SOC 2',
                icon: 'i-lucide-lock'
              }
            ]"
            :key="index"
            :title="feature.title"
            :description="feature.description"
            :description2="feature.description2"
            :icon="feature.icon"
            :index="index"
          />
        </div>
      </UContainer>
    </section>

    <!-- Bottom CTA Section -->
    <section class="py-16 bg-[#F6F8F8]">
      <UContainer>
        <div class="text-center max-w-3xl mx-auto">
          <p class="text-sm text-mokshya-gray">
            Not sure which plan fits your organization? 
            <NuxtLink to="/" class="text-[#17AB9C] font-semibold hover:underline cursor-pointer">
              Start with the assessment
            </NuxtLink>
            — you can upgrade anytime without losing progress.
          </p>
        </div>
      </UContainer>
    </section>
  </div>
</template>

