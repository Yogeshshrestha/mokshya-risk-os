<script setup lang="ts">
import { FEATURE_CARDS } from '~/constants/data'
import { IMAGES } from '~/constants/images'

// Map the image keys from data.ts to the imported images from IMAGES constant
const imageMap: Record<string, string> = {
  assessRiskIcon: IMAGES.assessRiskIcon,
  analyzeRiskIcon: IMAGES.analyzeRiskIcon,
  decideActIcon: IMAGES.decideActIcon
}

const getImage = (imageKey: string) => {
  const key = String(imageKey)
  return imageMap[key] || IMAGES.assessRiskIcon
}
</script>

<template>
  <section class="py-24 bg-white">
    <UContainer>
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-4xl font-bold text-mokshya-text mb-4">
          What Mokshya OS Does
        </h2>
        <p class="text-lg text-mokshya-gray">
          We bridge the gap between technical security signals and business risk decisions.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <FeatureCard
          v-for="(feature, index) in FEATURE_CARDS"
          :key="index"
          :title="feature.title"
          :description="feature.description"
          :image="getImage(feature.image)"
          :badge="feature.badge"
        />
      </div>
    </UContainer>
  </section>
</template>

