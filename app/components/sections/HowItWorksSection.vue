<script setup lang="ts">
import { STEPS } from '~/constants/data'
</script>

<template>
  <section id="how-it-works" class="py-12 sm:py-16 md:py-20 lg:py-24 bg-mokshya-light scroll-mt-20">
    <UContainer>
      <div class="text-center mb-12 sm:mb-16 md:mb-20">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-mokshya-text mb-3 sm:mb-4 px-4">
          How It Works
        </h2>
        <p class="text-base sm:text-lg text-mokshya-gray px-4">
          From integration to insight in three simple steps.
        </p>
      </div>

      <div class="lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <!-- Left Side Visual (Dashboard Timeline) -->
        <div class="relative mb-12 lg:mb-0 order-2 lg:order-1">
          <Card variant="dashboard" class="bg-white/50 border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden mx-4 sm:mx-0">
            <div class="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 sm:p-4 border border-gray-100">
              <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex-shrink-0" />
                <div>
                  <div class="text-xs font-bold text-mokshya-dark uppercase">
                    Good morning, John.
                  </div>
                  <div class="text-[10px] text-gray-500">
                    Here is your risk intelligence overview.
                  </div>
                </div>
              </div>

              <!-- Status Cards Row -->
              <div class="grid grid-cols-3 gap-2 mb-4">
                <div class="bg-white p-2 rounded border border-gray-100">
                  <div class="text-[8px] font-semibold text-gray-500 uppercase">
                    Status
                  </div>
                  <div class="text-[10px] font-bold text-mokshya-dark">
                    Connected
                  </div>
                </div>
                <div class="bg-white p-2 rounded border border-gray-100">
                  <div class="text-[8px] font-semibold text-gray-500 uppercase">
                    Risk Coverage
                  </div>
                  <div class="text-[10px] font-bold text-mokshya-dark">
                    94%
                  </div>
                </div>
                <div class="bg-white p-2 rounded border border-gray-100">
                  <div class="text-[8px] font-semibold text-gray-500 uppercase">
                    Assets
                  </div>
                  <div class="text-[10px] font-bold text-mokshya-dark">
                    1,240
                  </div>
                </div>
              </div>

              <!-- Chart Placeholder -->
              <div class="h-20 sm:h-24 bg-gray-50 rounded border border-gray-100 mb-4 flex items-end justify-between px-2 pb-2">
                <div class="w-2 bg-green-200 h-1/3 rounded-t" />
                <div class="w-2 bg-green-200 h-1/2 rounded-t" />
                <div class="w-2 bg-mokshya-dark h-3/4 rounded-t" />
                <div class="w-2 bg-green-200 h-2/3 rounded-t" />
                <div class="w-2 bg-green-200 h-1/2 rounded-t" />
              </div>

              <!-- Table Placeholder -->
              <div class="space-y-2">
                <div class="flex justify-between text-[8px] text-gray-400 font-bold uppercase border-b border-gray-100 pb-1">
                  <span>Source</span>
                  <span>Status</span>
                </div>
                <div class="flex justify-between text-[10px] items-center">
                  <span class="font-medium text-mokshya-dark truncate pr-2">Gateway Router</span>
                  <span class="bg-orange-100 text-orange-600 px-1 rounded text-[8px] font-bold flex-shrink-0">Medium</span>
                </div>
                <div class="flex justify-between text-[10px] items-center">
                  <span class="font-medium text-mokshya-dark truncate pr-2">Database Cluster</span>
                  <span class="bg-gray-100 text-gray-600 px-1 rounded text-[8px] font-bold flex-shrink-0">Low</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Right Side Steps -->
        <div class="space-y-8 sm:space-y-10 lg:space-y-12 relative order-1 lg:order-2 px-4 sm:px-0">
          <div class="hidden lg:block absolute left-8 top-8 bottom-8 w-px bg-mokshya-dark/20" />

          <StepItem
            v-for="(step, index) in STEPS"
            :key="index"
            :title="step.title"
            :description="step.description"
            :icon="step.icon"
            :duration="step.duration"
            :index="index"
          />
        </div>
      </div>
    </UContainer>
  </section>
</template>

