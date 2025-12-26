<script setup lang="ts">
import HeroSection from '~/components/sections/HeroSection.vue'
import FeaturesSection from '~/components/sections/FeaturesSection.vue'
import HowItWorksSection from '~/components/sections/HowItWorksSection.vue'
import TargetAudienceSection from '~/components/sections/TargetAudienceSection.vue'
import FAQSection from '~/components/sections/FAQSection.vue'
import CTASection from '~/components/sections/CTASection.vue'

useSeoMeta({
  title: 'Mokshya OS - Cyber Risk Intelligence',
  description: 'Translate complex cyber signals into clear financial risk exposure.'
})
</script>

<template>
  <div class="font-sans text-mokshya-text overflow-hidden scroll-smooth">
    <HeroSection />
    <FeaturesSection />
    <HowItWorksSection />
    <TargetAudienceSection />
    <FAQSection />
    <CTASection />
  </div>
</template>
