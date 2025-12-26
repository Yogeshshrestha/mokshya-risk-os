<script setup lang="ts">
import { TARGET_AUDIENCE } from '~/constants/data'
import { IMAGES } from '~/constants/images'
</script>

<template>
  <section class="py-24 bg-white relative overflow-hidden border-t border-gray-100">
    <UContainer class="relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <span class="text-mokshya-dark font-bold uppercase tracking-[1.2px] text-base block mb-4">
          Target Audience
        </span>
        <h2 class="text-3xl font-bold text-mokshya-text">
          Designed for decision-makers across risk, security, finance, and governance.
        </h2>
      </div>

      <!-- Radial Layout - Desktop -->
      <div class="relative h-[641px] w-[581px] mx-auto hidden lg:block">
        <!-- Background Vector -->
        <div class="absolute inset-0" style="padding: 9.82% 3.42% 8.85% 6.86%;">
          <NuxtImg :src="IMAGES.orbitalVector" class="w-full h-full object-contain opacity-30" alt="Orbital paths" />
        </div>

        <!-- Orbital Container -->
        <div
          class="absolute inset-0 animate-orbit-slow"
          style="transform-origin: 296.77px 306.29px; will-change: transform; backface-visibility: hidden;"
        >
          <AudienceOrb
            v-for="(audience, index) in TARGET_AUDIENCE"
            :key="index"
            :title="audience.title"
            :icon="audience.icon"
            :position="audience.position"
          />
        </div>

        <!-- Center Logo -->
        <div
          class="absolute w-[146px] h-[146px] bg-mokshya-dark rounded-full shadow-2xl flex flex-col items-center justify-center text-white z-20 border border-white/10"
          style="left: 223.93px; top: 233.45px; transform: translate(0, 0);"
        >
          <div class="bg-mokshya-dark/5 rounded-full absolute inset-[7.45px]" />
          <div class="relative z-10 flex flex-col items-center gap-1.5">
            
          <img :src="IMAGES.logoIcon" class="w-12 h-12" alt="Orbital paths" />

            <span class="font-bold text-[16.555px] tracking-[-0.4139px] leading-[23.177px]">Mokshya OS</span>
          </div>
        </div>

        <!-- Badge -->
        <div
          class="absolute backdrop-blur-sm bg-white/90 border border-mokshya-dark/20 rounded-full px-4 py-1.5 shadow-sm"
          style="left: 189.44px; top: 392.38px; height: 24.83px; display: flex; align-items: center; justify-content: center;"
        >
          <span class="text-[9.933px] font-bold text-mokshya-dark uppercase tracking-[0.2483px] leading-[13.244px]">
            Unified Risk Intelligence Platform
          </span>
        </div>
      </div>

      <!-- Mobile Grid Fallback -->
      <div class="grid grid-cols-2 gap-4 lg:hidden">
        <div
          v-for="(audience, index) in TARGET_AUDIENCE"
          :key="index"
          class="bg-mokshya-dark text-white p-6 rounded-xl flex flex-col items-center text-center"
        >
          <UIcon :name="audience.icon" class="w-8 h-8 mb-2 text-white" />
          <span class="font-bold">{{ audience.title }}</span>
        </div>
      </div>
    </UContainer>
  </section>
</template>

