<script setup lang="ts">
const route = useRoute()
const organizationId = computed(() => route.params.id as string)

const navItems = computed(() => [
  { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', to: `/organizations/${organizationId.value}/dashboard` },
  { label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', to: `/organizations/${organizationId.value}/reports` },
  { label: 'Assets', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', to: `/organizations/${organizationId.value}/assets` },
  { label: 'Risk Register', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', to: `/organizations/${organizationId.value}/risks` }
])

const bottomItems = computed(() => [
  { label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', to: `/organizations/${organizationId.value}/settings` },
  { label: 'Switch Organization', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', to: '/organizations' },
  { label: 'Help / Support', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', to: '/support' },
])

const isItemActive = (to: string) => {
  return route.path === to || (to !== '/' && route.path.startsWith(to))
}

const auth = useAuth()
const handleLogout = async () => {
  await auth.logout()
  navigateTo('/')
}
</script>

<template>
  <aside class="w-[260px] bg-white border-r border-[#e0e8e7] h-screen sticky top-0 flex flex-col flex-shrink-0 overflow-y-auto">
    <div class="p-8 pb-6">
      <NuxtLink to="/" class="flex items-center gap-2 mb-1 group">
        <span class="text-[16px] font-extrabold text-[#09423c] tracking-tight group-hover:opacity-80 transition-opacity">Mokshya OS</span>
        <div class="size-1.5 bg-[#09423c] rounded-full group-hover:scale-125 transition-transform"></div>
      </NuxtLink>
      <p class="text-[10px] font-bold text-[#6b8a87] uppercase tracking-widest opacity-80">Financial Technology</p>
    </div>
    
    <div class="px-4 mb-8">
      <div class="bg-gray-50/50 border border-[#e0e8e7] rounded-lg p-2.5 flex items-center justify-between shadow-sm group hover:border-[#09423c]/30 transition-colors cursor-pointer">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="size-7 bg-[#09423c] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
             <svg class="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          <span class="text-[13px] font-bold text-[#09423c] truncate">John Pvt.Ltd</span>
        </div>
        <svg class="size-4 text-[#09423c]/50 group-hover:text-[#09423c] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>
    </div>
    
    <nav class="flex-1 px-3 space-y-1.5">
      <NuxtLink 
        v-for="item in navItems" 
        :key="item.label"
        :to="item.to"
        :class="[
          'flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative',
          isItemActive(item.to) 
            ? 'bg-[#09433e]/5 text-[#09433e] font-bold shadow-sm' 
            : 'text-[#6b8a87] hover:bg-gray-50/80 hover:text-[#09433e]'
        ]"
      >
        <svg class="size-5.5" :class="[isItemActive(item.to) ? 'text-[#09433e]' : 'text-[#6b8a87] group-hover:text-[#09433e]']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
        </svg>
        <span class="text-[14px]">{{ item.label }}</span>
        <div v-if="isItemActive(item.to)" class="absolute left-0 w-1 h-5 bg-[#09433e] rounded-r-full"></div>
      </NuxtLink>
    </nav>
    
    <div class="p-4 mt-auto border-t border-[#e0e8e7] space-y-1">
      <NuxtLink 
        v-for="item in bottomItems" 
        :key="item.label"
        :to="item.to"
        :class="[
          'flex items-center gap-3.5 px-4 py-2.5 rounded-lg transition-colors group relative',
          isItemActive(item.to)
            ? 'bg-[#09433e]/5 text-[#09433e] font-bold'
            : 'text-[#09423c] hover:bg-gray-50'
        ]"
      >
        <svg class="size-5" :class="[isItemActive(item.to) ? 'text-[#09433e]' : 'text-[#6b8a87] group-hover:text-[#09433e]']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
        </svg>
        <span class="text-[14px] font-medium">{{ item.label }}</span>
        <div v-if="isItemActive(item.to)" class="absolute left-0 w-1 h-4 bg-[#09433e] rounded-r-full"></div>
      </NuxtLink>
      
      <button 
        @click="handleLogout"
        class="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-[#dd4747] font-bold hover:bg-red-50 transition-colors group cursor-pointer"
      >
        <svg class="size-5 text-[#dd4747]/70 group-hover:text-[#dd4747] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="text-[14px]">Logout</span>
      </button>
    </div>
  </aside>
</template>
