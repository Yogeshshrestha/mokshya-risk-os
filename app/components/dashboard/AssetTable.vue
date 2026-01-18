<script setup lang="ts">
import type { Asset } from '~/types/asset-risk'

interface Props {
  items: Asset[]
  title?: string
  viewAllLink?: string
  viewAllLabel?: string
  organizationId: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Assets',
  viewAllLabel: 'View All'
})

const sensitivityClass = (s: string) => {
  if (!s) return 'bg-gray-100 text-gray-700'
  switch (s.toLowerCase()) {
    case 'internal': return 'bg-blue-50 text-blue-600 border border-blue-100'
    case 'public': return 'bg-gray-100 text-gray-700 border border-gray-100'
    case 'confidential': return 'bg-orange-50 text-orange-600 border border-orange-100'
    case 'restricted': return 'bg-red-50 text-red-600 border border-red-100'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const criticalityClass = (c: string) => {
  if (!c) return 'bg-gray-100 text-gray-700'
  switch (c.toLowerCase()) {
    case 'high': return 'bg-red-50 text-red-600 border border-red-100'
    case 'medium': return 'bg-amber-50 text-amber-600 border border-amber-100'
    case 'low': return 'bg-green-50 text-green-600 border border-green-100'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const typeIcon = (t: string) => {
  if (!t) return 'i-lucide-box'
  const type = t.toLowerCase()
  if (type.includes('cloud')) return 'i-lucide-cloud'
  if (type.includes('database')) return 'i-lucide-database'
  if (type.includes('server')) return 'i-lucide-server'
  if (type.includes('application')) return 'i-lucide-layout'
  if (type.includes('endpoint')) return 'i-lucide-monitor'
  if (type.includes('vendor')) return 'i-lucide-building'
  if (type.includes('data')) return 'i-lucide-file-text'
  return 'i-lucide-box'
}

const formatType = (type: string) => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
        <h3 class="text-base font-semibold text-gray-900 mb-2">No assets found</h3>
        <NuxtLink 
          :to="`/organizations/${props.organizationId}/assets`"
          class="mt-4 px-4 py-2 rounded-xl bg-[#09423C] text-white text-sm font-medium hover:bg-[#07332e] transition-colors"
        >
          Add Asset
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <!-- Desktop Table View -->
      <div class="overflow-x-auto -mx-px hidden lg:block" role="region" aria-label="Assets Table">
        <table class="w-full">
          <thead>
            <tr class="text-white text-xs bg-[#274D48]">
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">ID &amp; NAME</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">TYPE</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">OWNER</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">SENSITIVITY</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">CRITICALITY</th>
              <th class="text-left px-4 sm:px-5 py-3 font-medium tracking-wide">ACTIONS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="asset in props.items" :key="asset.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 sm:px-5 py-4 text-sm">
                <p class="text-xs text-teal-600 font-semibold uppercase">{{ asset.asset_id }}</p>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ asset.name }}</p>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <div class="inline-flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center bg-white flex-shrink-0">
                    <UIcon :name="typeIcon(asset.asset_type)" class="text-gray-500 w-4 h-4"/>
                  </div>
                  <span class="text-sm text-gray-700">{{ formatType(asset.asset_type) }}</span>
                </div>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm text-teal-700 font-bold">{{ asset.business_owner }}</td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <span :class="['px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap', sensitivityClass(asset.data_sensitivity)]">
                  {{ asset.data_sensitivity }}
                </span>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <span :class="['px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap', criticalityClass(asset.business_criticality)]">
                  {{ asset.business_criticality }}
                </span>
              </td>
              <td class="px-4 sm:px-5 py-4 text-sm">
                <NuxtLink 
                  :to="`/organizations/${props.organizationId}/assets/${asset.id}`"
                  class="text-teal-700 text-sm font-bold hover:underline"
                >
                  Manage
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="space-y-3 px-4 pb-4 lg:hidden" role="list" aria-label="Assets List">
        <div v-for="asset in props.items" :key="asset.id" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow" role="listitem">
          <div class="flex flex-col gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-xs text-teal-600 font-semibold uppercase mb-1">{{ asset.asset_id }}</p>
              <p class="text-sm font-semibold text-gray-900 mb-3">{{ asset.name }}</p>
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <div class="inline-flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center bg-white flex-shrink-0">
                    <UIcon :name="typeIcon(asset.asset_type)" class="text-gray-500 w-4 h-4"/>
                  </div>
                  <span class="text-gray-700">{{ formatType(asset.asset_type) }}</span>
                </div>
                <span class="text-teal-700 font-bold">{{ asset.business_owner }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold inline-block', sensitivityClass(asset.data_sensitivity)]">
                {{ asset.data_sensitivity }}
              </span>
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold inline-block', criticalityClass(asset.business_criticality)]">
                {{ asset.business_criticality }}
              </span>
              <NuxtLink 
                :to="`/organizations/${props.organizationId}/assets/${asset.id}`"
                class="ml-auto text-teal-700 text-sm font-bold hover:underline"
              >
                Manage
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
