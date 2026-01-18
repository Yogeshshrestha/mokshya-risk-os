<script setup lang="ts">
import type { Risk } from '~/types/asset-risk'

interface Props {
  items: Risk[]
  title?: string
  viewAllLink?: string
  viewAllLabel?: string
  organizationId: string
  variant?: 'full' | 'dashboard'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Risks',
  viewAllLabel: 'View All',
  variant: 'full'
})

const ratingClass = (r: string) => {
  if (!r) return 'bg-gray-100 text-gray-700'
  switch (r.toLowerCase()) {
    case 'high': return 'bg-red-50 text-red-600 border border-red-100'
    case 'medium': return 'bg-amber-50 text-amber-600 border border-amber-100'
    case 'low': return 'bg-green-50 text-green-600 border border-green-100'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const statusClass = (s: string) => {
  if (!s) return 'bg-gray-100 text-gray-700'
  switch (s.toLowerCase()) {
    case 'open': return 'bg-red-50 text-red-600 border border-red-100'
    case 'in_progress': return 'bg-blue-50 text-blue-600 border border-blue-100'
    case 'mitigated': return 'bg-green-50 text-green-600 border border-green-100'
    case 'accepted': return 'bg-gray-100 text-gray-700 border border-gray-100'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const categoryIcon = (c: string) => {
  if (!c) return 'i-lucide-shield-alert'
  const cat = c.toLowerCase()
  if (cat.includes('data')) return 'i-lucide-database'
  if (cat.includes('access')) return 'i-lucide-lock'
  if (cat.includes('network')) return 'i-lucide-network'
  if (cat.includes('third') || cat.includes('vendor')) return 'i-lucide-users'
  if (cat.includes('compliance')) return 'i-lucide-file-check'
  if (cat.includes('operational')) return 'i-lucide-settings'
  return 'i-lucide-shield-alert'
}

const formatCategory = (category: string) => {
  return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}
</script>

<template>
  <div v-bind="$attrs" class="bg-white rounded-xl border border-gray-100 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 pb-4 gap-3">
      <h2 class="text-lg font-semibold text-gray-900">{{ props.title }}</h2>
      <NuxtLink 
        v-if="props.viewAllLink" 
        :to="props.viewAllLink" 
        class="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors w-fit"
      >
        {{ props.viewAllLabel }}
      </NuxtLink>
    </div>

    <template v-if="props.items.length === 0">
      <div class="p-12 flex flex-col items-center justify-center text-center">
        <div class="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-lucide-inbox" class="size-8 text-gray-300" />
        </div>
        <h3 class="text-base font-semibold text-gray-900 mb-2">No risks found</h3>
        <NuxtLink 
          :to="`/organizations/${props.organizationId}/risks`"
          class="mt-4 px-4 py-2 rounded-xl bg-[#09423C] text-white text-sm font-medium hover:bg-[#07332e] transition-colors"
        >
          Report Risk
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <!-- Desktop Table View - Full Variant -->
      <div v-if="props.variant === 'full'" class="overflow-x-auto -mx-px hidden lg:block" role="region" aria-label="Risks Table">
        <table class="w-full">
          <thead>
            <tr class="text-white text-xs bg-[#274D48]">
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">ID &amp; NAME</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">CATEGORY</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">RATING</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide text-center">SCORE</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">OWNER</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">STATUS</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">ACTIONS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="risk in props.items" :key="risk.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 sm:px-5 py-4 text-sm">
                <p class="text-xs text-teal-600 font-semibold uppercase">{{ risk.risk_id }}</p>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ risk.title }}</p>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <div class="inline-flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center bg-white flex-shrink-0">
                    <UIcon :name="categoryIcon(risk.category)" class="text-gray-500 w-4 h-4"/>
                  </div>
                  <span class="text-sm text-gray-700">{{ formatCategory(risk.category) }}</span>
                </div>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <span :class="['px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap', ratingClass(risk.risk_rating)]">
                  {{ risk.risk_rating }}
                </span>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm text-center">
                <span class="text-sm font-bold text-gray-900">{{ risk.final_risk_score }}</span>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm text-teal-700 font-bold">{{ risk.risk_owner }}</td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <span :class="['px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap', statusClass(risk.status)]">
                  {{ formatStatus(risk.status) }}
                </span>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <NuxtLink 
                  :to="`/organizations/${props.organizationId}/risks/${risk.id}`"
                  class="text-teal-700 text-sm font-bold hover:underline"
                >
                  Manage
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Desktop Table View - Dashboard Variant (Simplified) -->
      <div v-else class="overflow-x-auto -mx-px hidden lg:block" role="region" aria-label="Risks Table">
        <table class="w-full">
          <thead>
            <tr class="text-white text-xs bg-[#274D48]">
            <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">RISK ID</th>
            <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">DESCRIPTION</th>
            <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">RAG STATUS</th>
            <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">OWNER</th>
            <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">STATUS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="risk in props.items" :key="risk.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 sm:px-5 py-4 text-sm text-teal-600 font-semibold uppercase whitespace-nowrap">{{ risk.risk_id }}</td>
              <td class="px-4 sm:px-5 py-4 text-sm text-gray-900">{{ risk.title }}</td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <span :class="['px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap', ratingClass(risk.risk_rating)]">
                  {{ risk.risk_rating.toUpperCase() }}
                </span>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm text-teal-700 font-bold whitespace-nowrap">{{ risk.risk_owner }}</td>
              <td class="px-4 sm:px-5 py-4 text-sm whitespace-nowrap">
                <span :class="['px-2 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap', statusClass(risk.status)]">
                  {{ formatStatus(risk.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View - Full Variant -->
      <div v-if="props.variant === 'full'" class="space-y-3 px-4 pb-4 lg:hidden" role="list" aria-label="Risks List">
        <div v-for="risk in props.items" :key="risk.id" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow" role="listitem">
          <div class="flex flex-col gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-xs text-teal-600 font-semibold uppercase mb-1">{{ risk.risk_id }}</p>
              <p class="text-sm font-semibold text-gray-900 mb-3">{{ risk.title }}</p>
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <div class="inline-flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center bg-white flex-shrink-0">
                    <UIcon :name="categoryIcon(risk.category)" class="text-gray-500 w-4 h-4"/>
                  </div>
                  <span class="text-gray-700">{{ formatCategory(risk.category) }}</span>
                </div>
                <span class="text-teal-700 font-bold">{{ risk.risk_owner }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold inline-block', ratingClass(risk.risk_rating)]">
                {{ risk.risk_rating }}
              </span>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 inline-block">
                Score: {{ risk.final_risk_score }}
              </span>
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold inline-block', statusClass(risk.status)]">
                {{ formatStatus(risk.status) }}
              </span>
              <NuxtLink 
                :to="`/organizations/${props.organizationId}/risks/${risk.id}`"
                class="ml-auto text-teal-700 text-sm font-bold hover:underline"
              >
                Manage
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Card View - Dashboard Variant (Simplified) -->
      <div v-else class="space-y-3 px-4 pb-4 lg:hidden" role="list" aria-label="Risks List">
        <div v-for="risk in props.items" :key="risk.id" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow" role="listitem">
          <div class="flex flex-col gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-xs text-teal-600 font-semibold uppercase mb-1">{{ risk.risk_id }}</p>
              <p class="text-sm font-semibold text-gray-900 mb-3">{{ risk.title }}</p>
              <div class="flex items-center gap-3 text-sm">
                <span class="text-teal-700 font-bold">{{ risk.risk_owner }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold inline-block', ratingClass(risk.risk_rating)]">
                {{ risk.risk_rating.toUpperCase() }}
              </span>
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold inline-block', statusClass(risk.status)]">
                {{ formatStatus(risk.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
