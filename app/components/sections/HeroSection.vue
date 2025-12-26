<script setup lang="ts">
import { IMAGES } from '~/constants/images'

const socialProof = {
  avatars: [IMAGES.avatar1, IMAGES.avatar2, IMAGES.avatar3],
  rating: 5,
  text: 'Trusted by 500+ Risk Leaders'
}
</script>

<template>
  <section class="relative w-full overflow-hidden bg-white">
    <!-- Gradient Background -->
    <div
      class="absolute inset-0 pointer-events-none"
      :style="{
        maskImage: `url('${IMAGES.gradient}')`,
        maskSize: '100% 100%',
        maskPosition: '0% 0%',
        maskRepeat: 'no-repeat'
      }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-mokshya-light to-white" />
    </div>

    <UContainer class="relative z-10 pt-32 pb-20">
      <div class="lg:grid lg:grid-cols-12 gap-8 items-center">
        <!-- Hero Text -->
        <div class="lg:col-span-6 space-y-8 animate-fade-in-up">
          <h1 class="text-5xl lg:text-[72px] font-extrabold leading-tight tracking-tight text-mokshya-text">
            Decide<br />
            Insurance With<br />
            <span class="text-mokshya-dark relative inline-block">
              Confidence
              <svg
                class="absolute w-full h-3 -bottom-1 left-0 text-green-400 opacity-60"
                viewBox="0 0 200 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.00025 6.99997C25.7509 4.61334 112.981 -2.00002 198.001 3.50001"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </h1>
          <p class="text-xl text-mokshya-gray leading-relaxed max-w-lg delay-100">
            Board-ready insights. Insurance-aligned outcomes. Translate complex cyber signals into clear financial risk exposure.
          </p>

          <div class="flex flex-wrap gap-4 delay-200">
            <Button variant="primary">Request a Demo</Button>
            <Button variant="secondary">See How It Works</Button>
          </div>

          <!-- Social Proof -->
          <div class="flex items-center gap-4 pt-4 delay-300">
            <div class="flex -space-x-3">
              <div
                v-for="(avatar, index) in socialProof.avatars"
                :key="index"
                class="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative bg-gray-200 hover:z-10 transition-transform hover:scale-110"
              >
                <NuxtImg :src="avatar" class="object-cover w-full h-full" :alt="`User ${index + 1}`" />
              </div>
            </div>
            <div class="flex flex-col">
              <div class="flex text-yellow-500 text-xs mb-0.5">
                ★★★★★
              </div>
              <p class="text-sm font-medium text-gray-600">
                {{ socialProof.text }}
              </p>
            </div>
          </div>
        </div>

        <!-- Hero Dashboard Visual -->
        <div class="lg:col-span-6 mt-12 lg:mt-0 relative perspective-1000">
          <DashboardPreview />
        </div>
      </div>
    </UContainer>
  </section>
</template>


