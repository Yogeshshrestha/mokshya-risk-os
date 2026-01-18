<script setup lang="ts">
interface TableColumn {
  key: string
  label: string
  render?: (item: any) => any
  class?: string
}

interface Props {
  items: any[]
  columns: TableColumn[]
  title?: string
  viewAllLink?: string
  viewAllLabel?: string
  emptyMessage?: string
  emptyActionLabel?: string
  emptyActionLink?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Data',
  viewAllLabel: 'View All',
  emptyMessage: 'No items found',
  emptyActionLabel: 'Add New'
})
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

    <!-- Desktop Table View -->
    <div class="overflow-x-auto -mx-px hidden lg:block" role="region" :aria-label="`${props.title} Table`">
      <table class="w-full">
        <thead>
          <tr class="text-white text-xs bg-[#274D48]">
            <th 
              v-for="column in props.columns" 
              :key="column.key"
              :class="['text-left px-4 sm:px-5 py-3 font-medium tracking-wide', column.class]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(item, index) in props.items" :key="item.id || index" class="hover:bg-gray-50">
            <td 
              v-for="column in props.columns" 
              :key="column.key"
              :class="['px-4 sm:px-5 py-4 text-sm', column.class]"
            >
              <slot :name="`cell-${column.key}`" :item="item" :column="column">
                <component 
                  :is="column.render ? 'div' : 'span'"
                  v-if="column.render"
                  v-html="column.render(item)"
                />
                <span v-else>{{ item[column.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="space-y-3 px-4 pb-4 lg:hidden" role="list" :aria-label="`${props.title} List`">
      <div 
        v-for="(item, index) in props.items" 
        :key="item.id || index" 
        class="bg-white border rounded-lg p-4 shadow-sm" 
        role="listitem"
      >
        <slot name="mobile-card" :item="item">
          <div class="space-y-2">
            <div v-for="column in props.columns" :key="column.key" class="flex justify-between items-start">
              <span class="text-xs font-semibold text-gray-500 uppercase">{{ column.label }}:</span>
              <div class="text-right flex-1 ml-4">
                <slot :name="`mobile-${column.key}`" :item="item" :column="column">
                  <component 
                    :is="column.render ? 'div' : 'span'"
                    v-if="column.render"
                    v-html="column.render(item)"
                    class="text-sm text-gray-900"
                  />
                  <span v-else class="text-sm text-gray-900">{{ item[column.key] }}</span>
                </slot>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="props.items.length === 0" class="p-12 flex flex-col items-center justify-center text-center">
      <div class="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <UIcon name="i-lucide-inbox" class="size-8 text-gray-300" />
      </div>
      <h3 class="text-base font-semibold text-gray-900 mb-2">{{ props.emptyMessage }}</h3>
      <NuxtLink 
        v-if="props.emptyActionLink"
        :to="props.emptyActionLink"
        class="mt-4 px-4 py-2 rounded-xl bg-[#09423C] text-white text-sm font-medium hover:bg-[#07332e] transition-colors"
      >
        {{ props.emptyActionLabel }}
      </NuxtLink>
    </div>
  </div>
</template>
