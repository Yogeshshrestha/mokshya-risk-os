<script setup lang="ts">
import CreateOrganizationModal from '~/components/organizations/CreateOrganizationModal.vue'
import type { OrganizationResponse } from '~/types/organization'

interface Props {
  isOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: true
})

const emit = defineEmits<{
  'close': []
}>()

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
const isCollapsed = ref(false)

// Watch for collapse state changes and close dropdown if needed
watch(isCollapsed, (newVal) => {
  if (newVal) {
    showOrgSwitcher.value = false
  }
})

// Navigation
const navItems = computed(() => [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: `/organizations/${organizationId.value}/dashboard` },
  { label: 'Reports', icon: 'i-lucide-file-text', to: `/organizations/${organizationId.value}/reports` },
  { label: 'Assets', icon: 'i-lucide-box', to: `/organizations/${organizationId.value}/assets` },
  { label: 'Risk', icon: 'i-lucide-shield-alert', to: `/organizations/${organizationId.value}/risks` },
  { label: 'Assessment', icon: 'i-lucide-clipboard-check', to: `/organizations/${organizationId.value}/assessment` }
])

const bottomItems = computed(() => [
  { label: 'Settings', icon: 'i-lucide-settings', to: `/organizations/${organizationId.value}/settings` },
  { label: 'Help / Support', icon: 'i-lucide-help-circle', to: `/organizations/${organizationId.value}/support` },
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
  emit('close')
}

const handleOrgCreated = async () => {
  await fetchData()
  showCreateModal.value = false
}

// Click outside logic
const orgSwitcherRef = ref<HTMLElement | null>(null)
if (import.meta.client) {
  const handleClick = (e: MouseEvent) => {
    if (orgSwitcherRef.value && !orgSwitcherRef.value.contains(e.target as Node)) {
      showOrgSwitcher.value = false
    }
  }
  window.addEventListener('click', handleClick)
  onBeforeUnmount(() => {
    window.removeEventListener('click', handleClick)
  })
}

onMounted(fetchData)
</script>

<template>
  <!-- Mobile Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="props.isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-x-full lg:translate-x-0"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full lg:translate-x-0"
  >
    <aside 
      v-if="props.isOpen"
      :class="[
        'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-[#e0e8e7] flex flex-col flex-shrink-0 z-50 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[73px]' : 'w-[260px]',
        'lg:relative'
      ]"
    >
    <div :class="['flex-shrink-0 flex flex-col justify-center border-b border-[#e0e8e7]/50 transition-all duration-300', isCollapsed ? 'h-[81px] px-2' : 'h-[81px] px-8']">
      <div class="flex items-center justify-between gap-2 relative">
        <NuxtLink 
          v-show="!isCollapsed" 
          to="/" 
          @click="emit('close')" 
          class="flex items-center gap-2 group flex-1 min-w-0 transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'"
        >
          <span class="text-[18px] font-black text-[#09423c] tracking-tighter group-hover:opacity-80 transition-opacity uppercase whitespace-nowrap">Mokshya OS</span>
          <div class="size-1.5 bg-[#09423c] rounded-full group-hover:scale-125 transition-transform flex-shrink-0"></div>
        </NuxtLink>
        <button 
          @click="isCollapsed = !isCollapsed"
          class="hidden lg:flex size-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-all duration-300 flex-shrink-0"
          :class="isCollapsed ? 'opacity-100 mx-auto' : 'opacity-100 ml-auto'"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <UIcon 
            :name="isCollapsed ? 'i-lucide-menu' : 'i-lucide-panel-left-close'" 
            class="size-5 text-[#09423c] transition-transform duration-300"
          />
        </button>
        <button 
          @click="emit('close')"
          class="lg:hidden size-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <UIcon name="i-lucide-x" class="size-5 text-[#09423c]" />
        </button>
      </div>
      <p 
        v-show="!isCollapsed" 
        class="text-[9px] font-black text-[#6b8a87] uppercase tracking-[0.15em] opacity-60 mt-0.5 leading-none transition-opacity duration-300 whitespace-nowrap"
        :class="isCollapsed ? 'opacity-0 h-0' : 'opacity-60'"
      >
        Financial Technology
      </p>
    </div>
    
    <div :class="['my-6 relative transition-all duration-300', isCollapsed ? 'px-2' : 'px-4']" ref="orgSwitcherRef">
      <div 
        @click="showOrgSwitcher = !showOrgSwitcher"
        class="bg-gray-50/50 border border-[#e0e8e7] rounded-lg p-2.5 shadow-sm group hover:border-[#09423c]/30 transition-all duration-300 cursor-pointer overflow-hidden"
        :class="{ 
          'border-[#09423c] ring-2 ring-[#09423c]/5': showOrgSwitcher,
          'flex items-center justify-center': isCollapsed,
          'flex items-center justify-between': !isCollapsed
        }"
        :title="isCollapsed ? (currentOrg?.name || 'Organization') : undefined"
      >
        <div class="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
          <div class="size-7 bg-[#09423c] rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg class="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div 
            v-show="!isCollapsed"
            class="flex flex-col min-w-0 transition-opacity duration-300"
            :class="isCollapsed ? 'opacity-0 w-0' : 'opacity-100'"
          >
            <span class="text-[13px] font-bold text-[#09423c] truncate whitespace-nowrap">
              {{ currentOrg?.name || 'Loading...' }}
            </span>
            <span class="text-[10px] text-[#6b8a87] font-medium uppercase tracking-tight whitespace-nowrap">Organization</span>
          </div>
        </div>
        <svg 
          v-show="!isCollapsed"
          class="size-4 text-[#09423c]/50 group-hover:text-[#09423c] transition-all flex-shrink-0"
          :class="{ 'rotate-180': showOrgSwitcher, 'opacity-0 w-0': isCollapsed }"
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
          :class="['absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-[#e0e8e7] py-2 z-50 max-h-[400px] overflow-y-auto overflow-x-hidden', isCollapsed ? 'left-2 right-2' : 'left-4 right-4']"
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

          <div class="mt-2 pt-2 border-t border-[#e0e8e7] bg-gray-50/50 px-4 pb-2 -mx-2 -mb-2 rounded-b-xl">
            <button
              @click="showCreateModal = true; showOrgSwitcher = false"
              class="w-full flex items-center gap-3 py-2.5 text-[#09423c] font-bold hover:bg-white/80 transition-colors group rounded-lg px-1"
            >
              <div class="size-8 rounded-lg bg-[#09423c] text-white flex items-center justify-center group-hover:bg-[#07332e] transition-colors flex-shrink-0">
                <UIcon name="i-lucide-plus" class="size-4" />
              </div>
              <span class="text-[13px]">Create Organization</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
    
    <nav :class="['flex-1 space-y-1 overflow-y-auto custom-scrollbar transition-all duration-300', isCollapsed ? 'px-2' : 'px-3']">
      <NuxtLink 
        v-for="item in navItems" 
        :key="item.label"
        :to="item.to"
        @click="emit('close')"
        :class="[
          'flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden',
          isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3',
          isItemActive(item.to) 
            ? 'bg-[#09423c]/5 text-[#09423c] font-bold shadow-sm' 
            : 'text-[#6b8a87] hover:bg-gray-50/80 hover:text-[#09423c]'
        ]"
      >
        <UIcon :name="item.icon" class="size-5.5 flex-shrink-0 transition-colors duration-300" :class="[isItemActive(item.to) ? 'text-[#09423c]' : 'text-[#6b8a87] group-hover:text-[#09423c]']" />
        <span 
          v-show="!isCollapsed" 
          class="text-[14px] tracking-tight whitespace-nowrap transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100'"
        >
          {{ item.label }}
        </span>
        <div 
          v-show="isItemActive(item.to) && !isCollapsed" 
          class="absolute left-0 w-1 h-5 bg-[#09423c] rounded-r-full transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0' : 'opacity-100'"
        ></div>
      </NuxtLink>
    </nav>
    
    <div :class="['mt-auto border-t border-[#e0e8e7] pt-4 space-y-1 transition-all duration-300', isCollapsed ? 'p-2' : 'p-4']">
      <NuxtLink 
        v-for="item in bottomItems" 
        :key="item.label"
        :to="item.to"
        @click="emit('close')"
        :class="[
          'flex items-center rounded-lg transition-all duration-300 group relative overflow-hidden',
          isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3.5 px-4 py-2.5',
          isItemActive(item.to)
            ? 'bg-[#09423c]/5 text-[#09423c] font-bold'
            : 'text-[#6b8a87] hover:bg-gray-50/80 hover:text-[#09423c]'
        ]"
      >
        <UIcon :name="item.icon" class="size-5 flex-shrink-0 transition-colors duration-300" :class="[isItemActive(item.to) ? 'text-[#09423c]' : 'text-[#6b8a87] group-hover:text-[#09423c]']" />
        <span 
          v-show="!isCollapsed" 
          class="text-[14px] font-medium tracking-tight whitespace-nowrap transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100'"
        >
          {{ item.label }}
        </span>
        <div 
          v-show="isItemActive(item.to) && !isCollapsed" 
          class="absolute left-0 w-1 h-4 bg-[#09423c] rounded-r-full transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0' : 'opacity-100'"
        ></div>
      </NuxtLink>
      
      <button 
        @click="() => { handleLogout(); emit('close'); }"
        :class="[
          'w-full flex items-center rounded-lg text-[#dd4747] font-bold hover:bg-red-50 transition-all duration-300 group cursor-pointer mt-1 overflow-hidden',
          isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3.5 px-4 py-2.5'
        ]"
      >
        <UIcon name="i-lucide-log-out" class="size-5 flex-shrink-0 text-[#dd4747]/70 group-hover:text-[#dd4747] transition-colors" />
        <span 
          v-show="!isCollapsed" 
          class="text-[14px] tracking-tight whitespace-nowrap transition-opacity duration-300"
          :class="isCollapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100'"
        >
          Logout
        </span>
      </button>
    </div>

    <!-- Create Organization Modal -->
    <CreateOrganizationModal 
      v-model="showCreateModal"
      @created="handleOrgCreated"
    />
    </aside>
  </Transition>
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
