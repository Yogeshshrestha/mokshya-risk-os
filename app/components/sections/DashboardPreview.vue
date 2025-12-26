<script setup lang="ts">
import { IMAGES } from '~/constants/images'
</script>

<template>
  <div class="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 relative transform lg:rotate-y-6 lg:rotate-x-2 lg:translate-x-8 hover:rotate-0 hover:translate-x-0 transition-all duration-700 ease-out shadow-mokshya-green/10">
    <!-- Dashboard Header -->
    <div class="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
      <div class="flex gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400" />
        <div class="w-3 h-3 rounded-full bg-yellow-400" />
        <div class="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
        Mokshya OS Dashboard
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-2 gap-6">
      <!-- Overall Risk Tier -->
      <div class="bg-mokshya-light border border-green-100/50 rounded-lg p-6 relative group hover:bg-white hover:shadow-md transition-all duration-300">
        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Overall Risk Tier
        </div>
        <div class="flex items-end gap-2">
          <span class="text-4xl font-bold text-mokshya-text group-hover:text-mokshya-green transition-colors">
            A-
          </span>
          <div class="w-4 h-4 mb-2">
            <NuxtImg :src="IMAGES.trendIcon" alt="Trend" />
          </div>
        </div>
        <div class="text-sm font-medium text-mokshya-dark mt-1">
          Top 10%
        </div>
      </div>

      <!-- Est. Financial Exposure -->
      <div class="bg-mokshya-light border border-green-100/50 rounded-lg p-6 col-span-1 relative overflow-hidden group hover:bg-white hover:shadow-md transition-all duration-300">
        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Est. Financial Exposure
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-mokshya-text">$250K</span>
          <span class="text-gray-300 font-bold">-</span>
          <span class="text-2xl font-bold text-mokshya-text">$1.2M</span>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          Based on 14k+ data points
        </div>
        <div class="flex items-center gap-2 mt-4">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-mokshya-green" />
          </span>
          <span class="text-xs font-medium text-mokshya-text">Real-time sync active</span>
        </div>
        <div class="absolute top-4 right-4 w-12 opacity-80 group-hover:scale-110 transition-transform">
          <NuxtImg :src="IMAGES.chartIcon" alt="Chart" />
        </div>
      </div>

      <!-- Policy Readiness -->
      <div class="bg-mokshya-light border border-green-100/50 rounded-lg p-6 col-span-2 group hover:bg-white hover:shadow-md transition-all duration-300">
        <div class="flex justify-between mb-2">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Policy Readiness
          </div>
          <div class="text-xs font-bold text-mokshya-dark">
            85% Ready
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div class="bg-mokshya-dark h-2 rounded-full animate-progress" style="width: 85%" />
        </div>
      </div>
    </div>

    <!-- Floating Elements -->
    <div class="absolute -right-8 top-16 bg-white/90 backdrop-blur-md border border-gray-100 rounded-lg p-3 flex gap-3 items-center w-48 shadow-lg animate-float">
      <div class="bg-green-100 rounded-md p-1.5 w-8 h-8 flex items-center justify-center shrink-0">
        <NuxtImg :src="IMAGES.complianceIcon" class="w-4 h-4" />
      </div>
      <div>
        <div class="text-[10px] font-bold text-gray-400 uppercase">
          Compliance
        </div>
        <div class="text-sm font-bold text-mokshya-text">
          SOC2 Ready
        </div>
      </div>
    </div>

    <div class="absolute -left-6 bottom-12 bg-white/90 backdrop-blur-md rounded-lg p-3 flex gap-3 items-center shadow-lg border border-gray-100 animate-float-delayed">
      <div class="bg-yellow-50 border border-yellow-100 rounded-full p-1.5 w-8 h-8 flex items-center justify-center shrink-0">
        <NuxtImg :src="IMAGES.alertIcon" class="w-4 h-4" />
      </div>
      <div>
        <div class="text-[10px] font-bold text-gray-400 uppercase">
          Alert
        </div>
        <div class="text-xs font-bold text-mokshya-text">
          New CVE Detected
        </div>
      </div>
    </div>
  </div>
</template>


