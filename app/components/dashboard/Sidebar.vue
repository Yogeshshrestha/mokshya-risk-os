<script setup lang="ts">
const route = useRoute()
const organizationId = computed(() => route.params.id as string)

const navItems = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: `/organizations/${organizationId.value}/dashboard`, active: true },
  { label: 'Reports', icon: 'i-lucide-bar-chart-3', to: `/organizations/${organizationId.value}/reports` }
]

const bottomItems = computed(() => [
  { label: 'Settings', icon: 'i-lucide-settings', to: `/organizations/${organizationId.value}/settings` },
  { label: 'Help / Support', icon: 'i-lucide-help-circle', to: `/organizations/${organizationId.value}/support` }
])

const auth = useAuth()
const handleLogout = async () => {
  await auth.logout()
  navigateTo('/')
}
</script>

<template>
  <aside class="w-[260px] bg-white border-r border-[#e0e8e7] h-screen sticky top-0 flex flex-col flex-shrink-0 overflow-y-auto">
    <div class="p-8 pb-6">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-[16px] font-extrabold text-[#09423c] tracking-tight">Mokshya OS</span>
        <div class="size-1.5 bg-[#09423c] rounded-full"></div>
      </div>
      <p class="text-[10px] font-bold text-[#6b8a87] uppercase tracking-widest opacity-80">Financial Technology</p>
    </div>
    
    <div class="px-4 mb-8">
      <div class="bg-gray-50/50 border border-[#e0e8e7] rounded-lg p-2.5 flex items-center justify-between shadow-sm group hover:border-[#09423c]/30 transition-colors cursor-pointer">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="size-7 bg-[#09423c] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
             <UIcon name="i-lucide-building-2" class="size-4 text-white" />
          </div>
          <span class="text-[13px] font-bold text-[#09423c] truncate">John Pvt.Ltd</span>
        </div>
        <UIcon name="i-lucide-chevrons-up-down" class="size-4 text-[#09423c]/50 group-hover:text-[#09423c] transition-colors flex-shrink-0" />
      </div>
    </div>
    
    <nav class="flex-1 px-3 space-y-1.5">
      <NuxtLink 
        v-for="item in navItems" 
        :key="item.label"
        :to="item.to"
        :class="[
          'flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative',
          item.active 
            ? 'bg-[#09433e]/5 text-[#09433e] font-bold shadow-sm' 
            : 'text-[#6b8a87] hover:bg-gray-50/80 hover:text-[#09433e]'
        ]"
      >
        <UIcon :name="item.icon" :class="['size-5.5', item.active ? 'text-[#09433e]' : 'text-[#6b8a87] group-hover:text-[#09433e]']" />
        <span class="text-[14px]">{{ item.label }}</span>
        <div v-if="item.active" class="absolute left-0 w-1 h-5 bg-[#09433e] rounded-r-full"></div>
      </NuxtLink>
    </nav>
    
    <div class="p-4 mt-auto border-t border-[#e0e8e7] space-y-1">
      <NuxtLink 
        v-for="item in bottomItems" 
        :key="item.label"
        :to="item.to"
        class="flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-[#09423c] hover:bg-gray-50 transition-colors group"
      >
        <UIcon :name="item.icon" class="size-5 text-[#6b8a87] group-hover:text-[#09423c] transition-colors" />
        <span class="text-[14px] font-medium">{{ item.label }}</span>
      </NuxtLink>
      
      <button 
        @click="handleLogout"
        class="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-[#dd4747] font-bold hover:bg-red-50 transition-colors group cursor-pointer"
      >
        <UIcon name="i-lucide-log-out" class="size-5 text-[#dd4747]/70 group-hover:text-[#dd4747] transition-colors" />
        <span class="text-[14px]">Logout</span>
      </button>
    </div>
  </aside>
</template>

