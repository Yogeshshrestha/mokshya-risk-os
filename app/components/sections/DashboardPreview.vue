<script setup lang="ts">
import { IMAGES } from '~/constants/images'
</script>

<template>
  <div class="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 relative transform  lg:translate-x-8 hover:rotate-0 hover:translate-x-0 transition-all duration-700 ease-out shadow-mokshya-green/10">
    <img :src="IMAGES.dashboardPreview" alt="Dashboard Preview" class="w-full h-full" />
  </div>
</template>


