<script setup lang="ts">
import CreateOrganizationModal from '~/components/organizations/CreateOrganizationModal.vue'
import type { OrganizationResponse } from '~/types/organization'

const route = useRoute()
const router = useRouter()
const organizationApi = useOrganization()
const organizationId = computed(() => route.params.id as string)

// State
const organizations = ref<OrganizationResponse[]>([])
const currentOrg = ref<OrganizationResponse | null>(null)
const showOrgSwitcher = ref(false)
const showCreateModal = ref(false)
const isLoading = ref(true)

// Navigation
const navItems = computed(() => [
  { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', to: `/organizations/${organizationId.value}/dashboard` },
  { label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', to: `/organizations/${organizationId.value}/reports` },
  { label: 'Assets', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', to: `/organizations/${organizationId.value}/assets` },
  { label: 'Risk Register', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', to: `/organizations/${organizationId.value}/risks` },
  { label: 'Start Assessment', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', to: `/organizations/${organizationId.value}/assessment` }
])

const bottomItems = computed(() => [
  { label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', to: `/organizations/${organizationId.value}/settings` },
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

const fetchData = async () => {
  try {
    const [orgs, org] = await Promise.all([
      organizationApi.listOrganizations(),
      organizationApi.getOrganization(organizationId.value)
    ])
    organizations.value = orgs
    currentOrg.value = org
  } catch (error) {
    console.error('Failed to fetch sidebar data:', error)
  } finally {
    isLoading.value = false
  }
}

const switchOrganization = (id: string) => {
  showOrgSwitcher.value = false
  // Get the current page type to redirect appropriately
  const path = route.path
  let target = `/organizations/${id}/dashboard`
  
  if (path.includes('/reports')) target = `/organizations/${id}/reports`
  else if (path.includes('/assets')) target = `/organizations/${id}/assets`
  else if (path.includes('/risks')) target = `/organizations/${id}/risks`
  else if (path.includes('/assessment')) target = `/organizations/${id}/assessment`
  else if (path.includes('/settings')) target = `/organizations/${id}/settings`

  router.push(target)
}

const handleOrgCreated = async () => {
  await fetchData()
  showCreateModal.value = false
}

// Click outside logic
const orgSwitcherRef = ref<HTMLElement | null>(null)
if (process.client) {
  window.addEventListener('click', (e) => {
    if (orgSwitcherRef.value && !orgSwitcherRef.value.contains(e.target as Node)) {
      showOrgSwitcher.value = false
    }
  })
}

onMounted(fetchData)
</script>

<template>
  <aside class="w-[260px] bg-white border-r border-[#e0e8e7] h-screen sticky top-0 flex flex-col flex-shrink-0">
    <div class="p-8 pb-6">
      <NuxtLink to="/" class="flex items-center gap-2 mb-1 group">
        <span class="text-[16px] font-extrabold text-[#09423c] tracking-tight group-hover:opacity-80 transition-opacity">Mokshya OS</span>
        <div class="size-1.5 bg-[#09423c] rounded-full group-hover:scale-125 transition-transform"></div>
      </NuxtLink>
      <p class="text-[10px] font-bold text-[#6b8a87] uppercase tracking-widest opacity-80">Financial Technology</p>
    </div>
    
    <div class="px-4 mb-8 relative" ref="orgSwitcherRef">
      <div 
        @click="showOrgSwitcher = !showOrgSwitcher"
        class="bg-gray-50/50 border border-[#e0e8e7] rounded-lg p-2.5 flex items-center justify-between shadow-sm group hover:border-[#09423c]/30 transition-colors cursor-pointer"
        :class="{ 'border-[#09423c] ring-2 ring-[#09423c]/5': showOrgSwitcher }"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="size-7 bg-[#09423c] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
             <svg class="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[13px] font-bold text-[#09423c] truncate">
              {{ currentOrg?.name || 'Loading...' }}
            </span>
            <span class="text-[10px] text-[#6b8a87] font-medium uppercase tracking-tight">Organization</span>
          </div>
        </div>
        <svg 
          class="size-4 text-[#09423c]/50 group-hover:text-[#09423c] transition-all flex-shrink-0"
          :class="{ 'rotate-180': showOrgSwitcher }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <!-- Org Switcher Dropdown -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div 
          v-if="showOrgSwitcher"
          class="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-[#e0e8e7] py-2 z-50 max-h-[400px] overflow-y-auto"
        >
 
          
          <div class="space-y-0.5">
            <button
              v-for="org in organizations"
              :key="org.id"
              @click="switchOrganization(org.id)"
              class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left"
              :class="{ 'bg-[#09423c]/5': org.id === organizationId }"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div 
                  class="size-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
                  :class="org.id === organizationId ? 'bg-[#09423c] text-white' : 'bg-gray-100 text-[#09423c] group-hover:bg-[#09423c] group-hover:text-white transition-colors'"
                >
                  {{ org.name.substring(0, 2).toUpperCase() }}
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-[13px] font-bold text-[#09423c] truncate">{{ org.name }}</span>
                  <span class="text-[11px] text-[#6b8a87] truncate">{{ org.industry || 'Tech' }}</span>
                </div>
              </div>
              <svg v-if="org.id === organizationId" class="size-4 text-[#09423c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          <div class="mt-2 pt-2 border-t border-[#e0e8e7] px-2">
            <button
              @click="showCreateModal = true; showOrgSwitcher = false"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#09423c] font-bold hover:bg-gray-50 transition-colors group"
            >
              <div class="size-8 rounded-lg bg-emerald-50 text-[#09423c] flex items-center justify-center group-hover:bg-[#09423c] group-hover:text-white transition-colors">
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span class="text-[13px]">Create New Organization</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
    
    <nav class="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
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

    <!-- Create Organization Modal -->
    <CreateOrganizationModal 
      v-model="showCreateModal"
      @created="handleOrgCreated"
    />
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e0e8e7;
  border-radius: 20px;
}
</style>
