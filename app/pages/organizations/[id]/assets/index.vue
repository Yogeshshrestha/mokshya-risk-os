<script setup lang="ts">
import type { Asset, AssetType, DataSensitivity, BusinessCriticality, AssetStatus } from '~/types/asset-risk'

definePageMeta({
  layout: false
})

const route = useRoute()
const organizationId = route.params.id as string
const assetApi = useAsset()

const allAssets = ref<Asset[]>([])
const assets = ref<Asset[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedType = ref<AssetType | ''>('')
const selectedCriticality = ref<BusinessCriticality | ''>('')
const selectedStatus = ref<AssetStatus | ''>('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

const fetchAssets = async () => {
  try {
    isLoading.value = true
    const params: any = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    if (selectedType.value) params.asset_type = selectedType.value
    if (selectedCriticality.value) params.business_criticality = selectedCriticality.value
    if (selectedStatus.value) params.status = selectedStatus.value
    
    const [fetchedAssets, count] = await Promise.all([
      assetApi.listAssets(organizationId, params),
      assetApi.countAssets(organizationId, {
        asset_type: selectedType.value || undefined,
        business_criticality: selectedCriticality.value || undefined,
        status: selectedStatus.value || undefined
      })
    ])
    
    // Sort assets by asset_id in ascending order
    allAssets.value = fetchedAssets.sort((a, b) => a.asset_id.localeCompare(b.asset_id))
    totalCount.value = count
  } catch (error) {
    console.error('Failed to fetch assets:', error)
  } finally {
    isLoading.value = false
  }
}

// Client-side search filter
const filteredAssets = computed(() => {
  if (!searchQuery.value.trim()) {
    return allAssets.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return allAssets.value.filter(asset => 
    asset.name.toLowerCase().includes(query) || 
    asset.asset_id.toLowerCase().includes(query)
  )
})

// Watch for filter changes and reset to page 1
watch([selectedType, selectedCriticality, selectedStatus], () => {
  currentPage.value = 1
  fetchAssets()
})

// Update displayed assets when search or allAssets changes
watch([filteredAssets], () => {
  assets.value = filteredAssets.value
}, { immediate: true })

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

onMounted(fetchAssets)

const assetTypes = [
  { value: 'application', label: 'Application', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { value: 'database', label: 'Database', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
  { value: 'server', label: 'Server', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
  { value: 'cloud_service', label: 'Cloud Service', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
  { value: 'endpoint', label: 'Endpoint', icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25' },
  { value: 'vendor', label: 'Vendor', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { value: 'data', label: 'Data', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' }
]

const getCriticalityBadge = (criticality: BusinessCriticality) => {
  switch (criticality) {
    case 'high': return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const getSensitivityBadge = (sensitivity: DataSensitivity) => {
  switch (sensitivity) {
    case 'restricted': return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'confidential': return 'bg-orange-50 text-orange-600 border-orange-100'
    case 'internal': return 'bg-blue-50 text-blue-600 border-blue-100'
    case 'public': return 'bg-gray-50 text-gray-600 border-gray-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const getAssetIcon = (type: AssetType) => {
  return assetTypes.find(t => t.value === type)?.icon || ''
}

const showAddAssetModal = ref(false)
const selectedPersona = ref('cro')

// Mobile sidebar state
const showMobileSidebar = ref(false)

const toggleSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeSidebar = () => {
  showMobileSidebar.value = false
}

// Close sidebar on route change
watch(() => route.path, () => {
  showMobileSidebar.value = false
})
</script>

<template>
  <div class="flex h-screen bg-[#f8fbfb] overflow-hidden">
    <!-- Desktop Sidebar (always visible on lg+) -->
    <div class="hidden lg:block flex-shrink-0">
      <DashboardSidebar :is-open="true" />
    </div>
    
    <!-- Mobile Sidebar (overlay) -->
    <div class="lg:hidden">
      <DashboardSidebar :is-open="showMobileSidebar" @close="closeSidebar" />
    </div>
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashboardHeader 
        title="Asset Management"
        v-model:persona="selectedPersona"
        @toggle-sidebar="toggleSidebar"
      />
      
      <main class="flex-1 overflow-y-auto py-8">
        <div class="px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
          <!-- Page Actions -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-[24px] font-extrabold text-[#0e1b1a]">Assets</h2>
              <p class="text-[15px] text-[#4f9690]">Inventory of all digital and physical assets.</p>
            </div>
            <button 
              @click="showAddAssetModal = true"
              class="bg-[#09423C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#07332e] transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Asset
            </button>
          </div>

          <!-- Filters -->
          <div class="bg-white p-4 rounded-2xl border border-[#e8f3f2] shadow-sm flex flex-col gap-4">
            <div class="flex-1 relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search assets by name or ID..."
                class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#09423c]/20 focus:border-[#09423c]/30"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                v-model="selectedType" 
                @change="fetchAssets"
                class="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#09423c]/20 focus:border-[#09423c]/30 cursor-pointer"
              >
                <option value="">All Asset Types</option>
                <option v-for="type in assetTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
              <select 
                v-model="selectedCriticality" 
                @change="fetchAssets"
                class="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#09423c]/20 focus:border-[#09423c]/30 cursor-pointer"
              >
                <option value="">All Criticalities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select 
                v-model="selectedStatus" 
                @change="fetchAssets"
                class="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#09423c]/20 focus:border-[#09423c]/30 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <!-- Assets Table -->
          <div v-if="isLoading" class="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div class="flex flex-col items-center justify-center min-h-[400px] gap-4 p-12">
              <div class="size-12 border-4 border-[#09423c] border-t-transparent rounded-full animate-spin"></div>
              <p class="text-[14px] text-[#4f9690] font-medium text-center">Loading assets...</p>
            </div>
          </div>
          <div v-else>
            <AssetTable
              :items="assets"
              title="Assets"
              :organization-id="organizationId"
            />
            
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm px-8 py-6 flex items-center justify-between">
              <div class="text-[13px] text-[#64748b] font-medium">
                Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} assets
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="currentPage = Math.max(1, currentPage - 1); fetchAssets()"
                  :disabled="currentPage === 1 || isLoading"
                  class="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-[#0e1b1a] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <div class="flex items-center gap-1">
                  <button
                    v-for="page in Math.min(5, totalPages)"
                    :key="page"
                    @click="currentPage = page; fetchAssets()"
                    :class="[
                      'px-3 py-2 rounded-lg text-[13px] font-bold transition-colors cursor-pointer',
                      currentPage === page
                        ? 'bg-[#09423c] text-white'
                        : 'text-[#64748b] hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <span v-if="totalPages > 5" class="px-2 text-[#64748b]">...</span>
                </div>
                <button
                  @click="currentPage = Math.min(totalPages, currentPage + 1); fetchAssets()"
                  :disabled="currentPage === totalPages || isLoading"
                  class="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-[#0e1b1a] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <AddAssetModal 
      v-model="showAddAssetModal"
      :organization-id="organizationId"
      @created="fetchAssets"
    />
  </div>
</template>

