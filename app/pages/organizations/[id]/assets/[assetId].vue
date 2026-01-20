<script setup lang="ts">
import type { AssetWithRisks, BusinessCriticality, DataSensitivity, AssetType, Asset } from '~/types/asset-risk'
import EditAssetModal from '~/components/organizations/EditAssetModal.vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const organizationId = route.params.id as string
const assetId = route.params.assetId as string
const assetApi = useAsset()

const asset = ref<AssetWithRisks | null>(null)
const isLoading = ref(true)
const selectedPersona = ref('cro')
const showEditModal = ref(false)
const showRetireConfirm = ref(false)
const showDeleteConfirm = ref(false)
const isProcessing = ref(false)

const fetchAsset = async () => {
  try {
    isLoading.value = true
    asset.value = await assetApi.getAsset(organizationId, assetId)
  } catch (error) {
    console.error('Failed to fetch asset:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAsset)

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

const assetTypes = [
  { value: 'application', label: 'Application', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { value: 'database', label: 'Database', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
  { value: 'server', label: 'Server', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2-2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
  { value: 'cloud_service', label: 'Cloud Service', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
  { value: 'endpoint', label: 'Endpoint', icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25' },
  { value: 'vendor', label: 'Vendor', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { value: 'data', label: 'Data', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' }
]

const getAssetIcon = (type: AssetType) => {
  return assetTypes.find(t => t.value === type)?.icon || ''
}

const handleEdit = () => {
  showEditModal.value = true
}

const handleRetire = async () => {
  if (!asset.value) return
  
  isProcessing.value = true
  try {
    await assetApi.retireAsset(organizationId, assetId)
    await fetchAsset() // Refresh asset data
    showRetireConfirm.value = false
  } catch (error) {
    console.error('Failed to retire asset:', error)
    alert('Failed to retire asset. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

const handleDelete = async () => {
  if (!asset.value) return
  
  isProcessing.value = true
  try {
    // Use asset.id (UUID) from the fetched asset object to ensure we're using the correct UUID
    await assetApi.deleteAsset(organizationId, asset.value.id)
    router.push(`/organizations/${organizationId}/assets`)
  } catch (error) {
    console.error('Failed to delete asset:', error)
    alert('Failed to delete asset. Please try again.')
    isProcessing.value = false
  }
}

const handleUpdated = async () => {
  await fetchAsset() // Refresh asset data
}
</script>

<template>
  <div class="flex min-h-screen bg-[#f8fbfb]">
    <DashboardSidebar />
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashboardHeader 
        :title="asset?.name || 'Asset Detail'"
        v-model:persona="selectedPersona"
      />
      
      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-4">
          <div class="size-12 border-4 border-[#09423c] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[14px] text-[#4f9690] font-medium text-center">Loading asset details...</p>
        </div>

        <div v-else-if="asset" class="max-w-[1200px] mx-auto space-y-8">
          <!-- Back Link -->
          <NuxtLink :to="`/organizations/${organizationId}/assets`" class="flex items-center gap-2 text-[14px] font-bold text-[#4f9690] hover:text-[#09423c] transition-colors w-fit group">
            <svg class="size-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Assets
          </NuxtLink>

          <!-- Asset Header Card -->
          <div class="bg-white rounded-[24px] border border-[#e8f3f2] shadow-sm p-8 overflow-hidden relative">
            <div class="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
            
            <div class="relative flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div class="flex items-start gap-6">
                <div class="size-20 bg-[#09423c] rounded-[24px] flex items-center justify-center text-white shadow-lg shadow-[#09423c]/20">
                  <svg class="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getAssetIcon(asset.asset_type)" />
                  </svg>
                </div>
                <div>
                  <span class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-[1.5px] mb-1 block">{{ asset.asset_id }}</span>
                  <h2 class="text-[32px] font-extrabold text-[#0e1b1a] mb-2 leading-tight">{{ asset.name }}</h2>
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="px-3 py-1 bg-[#f8fbfb] border border-[#e8f3f2] rounded-lg text-[12px] font-bold text-[#09423c] capitalize">
                      {{ asset.asset_type.replace('_', ' ') }}
                    </span>
                    <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span :class="['px-3 py-1 rounded-lg text-[11px] font-extrabold border uppercase tracking-tight', getCriticalityBadge(asset.business_criticality)]">
                      {{ asset.business_criticality }} Criticality
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  @click="handleEdit"
                  class="px-5 py-2.5 bg-white border border-[#e8f3f2] rounded-xl text-[14px] font-bold text-[#0e1b1a] hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  Edit Asset
                </button>
                <button 
                  @click="showRetireConfirm = true"
                  :disabled="asset.status === 'retired' || isProcessing"
                  class="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[14px] font-bold hover:bg-rose-100 transition-colors cursor-pointer border border-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ asset.status === 'retired' ? 'Retired' : 'Retire' }}
                </button>
                <button 
                  @click="showDeleteConfirm = true"
                  :disabled="isProcessing"
                  class="px-5 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[14px] font-bold hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Details -->
            <div class="lg:col-span-2 space-y-8">
              <div class="bg-white rounded-[24px] border border-[#e8f3f2] p-8 shadow-sm">
                <h3 class="text-[18px] font-extrabold text-[#0e1b1a] mb-6">Asset Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div>
                    <label class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-2">Technical Owner</label>
                    <p class="text-[15px] font-bold text-[#0e1b1a]">{{ asset.technical_owner || 'Not Assigned' }}</p>
                  </div>
                  <div>
                    <label class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-2">Business Owner</label>
                    <p class="text-[15px] font-bold text-[#0e1b1a]">{{ asset.business_owner }}</p>
                  </div>
                  <div>
                    <label class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-2">Data Sensitivity</label>
                    <span :class="['px-2.5 py-1 rounded-lg text-[11px] font-extrabold border uppercase tracking-tight', getSensitivityBadge(asset.data_sensitivity)]">
                      {{ asset.data_sensitivity }}
                    </span>
                  </div>
                  <div>
                    <label class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-2">Status</label>
                    <div class="flex items-center gap-2">
                      <div :class="['size-2 rounded-full', asset.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400']"></div>
                      <span class="text-[14px] font-bold text-[#0e1b1a] capitalize">{{ asset.status }}</span>
                    </div>
                  </div>
                  <div class="md:col-span-2">
                    <label class="text-[11px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-2">Description</label>
                    <p class="text-[15px] text-[#0e1b1a] leading-relaxed opacity-80">{{ asset.description || 'No description provided.' }}</p>
                  </div>
                </div>
              </div>

              <!-- Linked Risks -->
              <div class="bg-white rounded-[24px] border border-[#e8f3f2] p-8 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-[18px] font-extrabold text-[#0e1b1a]">Linked Risks</h3>
                  <span class="bg-[#09433e]/5 text-[#09433e] px-3 py-1 rounded-full text-[12px] font-extrabold">{{ asset.risks.length }} Total</span>
                </div>
                
                <div v-if="asset.risks.length === 0" class="py-12 flex flex-col items-center justify-center text-center opacity-50">
                  <svg class="size-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-[14px] font-bold">No risks currently linked to this asset.</p>
                </div>
                
                <div v-else class="space-y-4">
                  <div v-for="risk in asset.risks" :key="risk.id" class="flex items-center justify-between p-4 rounded-2xl bg-[#f8fbfb] border border-[#e8f3f2] hover:border-[#09423c]/30 transition-all group">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[10px] font-extrabold text-[#4f9690] opacity-60">{{ risk.risk_id }}</span>
                      <NuxtLink :to="`/organizations/${organizationId}/risks/${risk.id}`" class="text-[14px] font-bold text-[#0e1b1a] hover:text-[#09423c] transition-colors">
                        {{ risk.title }}
                      </NuxtLink>
                    </div>
                    <div class="flex items-center gap-4">
                      <span :class="['px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border uppercase', 
                        risk.risk_rating === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        risk.risk_rating === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100']">
                        {{ risk.risk_rating }}
                      </span>
                      <svg class="size-4 text-gray-300 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Metadata -->
            <div class="space-y-8">
              <div class="bg-white rounded-[24px] border border-[#e8f3f2] p-8 shadow-sm">
                <h3 class="text-[16px] font-extrabold text-[#0e1b1a] mb-6">Metadata</h3>
                <div class="space-y-6">
                  <div>
                    <label class="text-[10px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-1">Created At</label>
                    <p class="text-[14px] font-bold text-[#0e1b1a]">{{ new Date(asset.created_at).toLocaleString() }}</p>
                  </div>
                  <div>
                    <label class="text-[10px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-1">Last Updated</label>
                    <p class="text-[14px] font-bold text-[#0e1b1a]">{{ new Date(asset.updated_at).toLocaleString() }}</p>
                  </div>
                  <div v-if="asset.created_by">
                    <label class="text-[10px] font-extrabold text-[#4f9690] uppercase tracking-wider block mb-1">Created By</label>
                    <p class="text-[14px] font-bold text-[#0e1b1a] truncate">{{ asset.created_by_name || asset.created_by || 'Unknown' }}</p>
                  </div>
                </div>
              </div>

              <!-- Risk Score Impact -->
              <div class="bg-gradient-to-br from-[#09423c] to-[#1a6b61] rounded-[24px] p-8 text-white shadow-xl shadow-[#09423c]/10">
                <h3 class="text-[16px] font-bold mb-4">Risk Impact</h3>
                <p class="text-emerald-100/70 text-[13px] leading-relaxed mb-6">
                  This asset's <span class="font-bold text-white">{{ asset.business_criticality }}</span> criticality multiplier affects risk scoring:
                </p>
                <div class="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span class="text-[12px] font-bold">Multiplier</span>
                  <span class="text-[20px] font-extrabold">{{ asset.business_criticality === 'high' ? '2.0x' : asset.business_criticality === 'medium' ? '1.5x' : '1.0x' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit Modal -->
    <EditAssetModal 
      v-model="showEditModal"
      :organization-id="organizationId"
      :asset="asset"
      @updated="handleUpdated"
    />

    <!-- Retire Confirmation -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRetireConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showRetireConfirm = false"
        >
          <div class="bg-white rounded-[24px] shadow-2xl max-w-md w-full p-8">
            <h3 class="text-xl font-extrabold text-[#0e1b1a] mb-2">Retire Asset</h3>
            <p class="text-[14px] text-[#64748b] mb-6">
              Are you sure you want to retire this asset? This action can be reversed by editing the asset status.
            </p>
            <div class="flex gap-3 justify-end">
              <button
                @click="showRetireConfirm = false"
                :disabled="isProcessing"
                class="px-6 py-2.5 rounded-xl border border-gray-200 text-[#0e1b1a] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="handleRetire"
                :disabled="isProcessing"
                class="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {{ isProcessing ? 'Retiring...' : 'Retire Asset' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showDeleteConfirm = false"
        >
          <div class="bg-white rounded-[24px] shadow-2xl max-w-md w-full p-8">
            <h3 class="text-xl font-extrabold text-[#0e1b1a] mb-2">Delete Asset</h3>
            <p class="text-[14px] text-[#64748b] mb-6">
              Are you sure you want to permanently delete this asset? This action cannot be undone.
            </p>
            <div class="flex gap-3 justify-end">
              <button
                @click="showDeleteConfirm = false"
                :disabled="isProcessing"
                class="px-6 py-2.5 rounded-xl border border-gray-200 text-[#0e1b1a] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                :disabled="isProcessing"
                class="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {{ isProcessing ? 'Deleting...' : 'Delete Permanently' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

