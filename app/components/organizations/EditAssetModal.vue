<script setup lang="ts">
import type { AssetUpdate, Asset, AssetType, DataSensitivity, BusinessCriticality } from '~/types/asset-risk'

interface Props {
  modelValue: boolean
  organizationId: string
  asset: Asset | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
}>()

const assetApi = useAsset()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isLoading = ref(false)
const error = ref<string | null>(null)

const formData = ref<AssetUpdate>({
  name: '',
  asset_type: 'application',
  description: '',
  business_owner: '',
  technical_owner: '',
  data_sensitivity: 'internal',
  business_criticality: 'medium',
  status: 'active'
})

// Watch for asset changes to populate form
watch(() => props.asset, (newAsset) => {
  if (newAsset) {
    formData.value = {
      name: newAsset.name,
      asset_type: newAsset.asset_type,
      description: newAsset.description || '',
      business_owner: newAsset.business_owner,
      technical_owner: newAsset.technical_owner || '',
      data_sensitivity: newAsset.data_sensitivity,
      business_criticality: newAsset.business_criticality,
      status: newAsset.status
    }
  }
}, { immediate: true })

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'application', label: 'Application' },
  { value: 'database', label: 'Database' },
  { value: 'server', label: 'Server' },
  { value: 'cloud_service', label: 'Cloud Service' },
  { value: 'endpoint', label: 'Endpoint' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'data', label: 'Data' }
]

const sensitivities: DataSensitivity[] = ['public', 'internal', 'confidential', 'restricted']
const criticalities: BusinessCriticality[] = ['low', 'medium', 'high']
const statuses: Array<{ value: 'active' | 'retired'; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'retired', label: 'Retired' }
]

const handleSubmit = async () => {
  if (!formData.value.name?.trim() || !formData.value.business_owner?.trim()) {
    error.value = 'Name and Business Owner are required'
    return
  }

  if (!props.asset) {
    error.value = 'Asset not found'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await assetApi.updateAsset(props.organizationId, props.asset.id, {
      ...formData.value,
      name: formData.value.name?.trim(),
      business_owner: formData.value.business_owner?.trim(),
      technical_owner: formData.value.technical_owner?.trim() || undefined,
      description: formData.value.description?.trim() || undefined
    })
    
    emit('updated')
    isOpen.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to update asset'
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  if (!isLoading.value) {
    isOpen.value = false
    error.value = null
  }
}
</script>

<template>
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
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-white rounded-[24px] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100">
              <div>
                <h2 class="text-xl sm:text-2xl font-extrabold text-[#0e1b1a]">
                  Edit Asset
                </h2>
                <p class="text-[14px] text-[#4f9690] mt-1">Update asset information.</p>
              </div>
              <button
                @click="handleClose"
                :disabled="isLoading"
                class="size-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50 cursor-pointer"
              >
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              <!-- Error Message -->
              <div
                v-if="error"
                class="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700"
              >
                {{ error }}
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Asset Name -->
                <div class="space-y-2 md:col-span-2">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                    Asset Name <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    placeholder="e.g. Production Database"
                    required
                    :disabled="isLoading"
                    class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 disabled:opacity-50 transition-all"
                  >
                </div>

                <!-- Asset Type -->
                <div class="space-y-2">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                    Asset Type <span class="text-rose-500">*</span>
                  </label>
                  <select
                    v-model="formData.asset_type"
                    :disabled="isLoading"
                    class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <option v-for="type in assetTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                </div>

                <!-- Status -->
                <div class="space-y-2">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    v-model="formData.status"
                    :disabled="isLoading"
                    class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <option v-for="s in statuses" :key="s.value" :value="s.value">
                      {{ s.label }}
                    </option>
                  </select>
                </div>

                <!-- Business Owner -->
                <div class="space-y-2">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                    Business Owner <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="formData.business_owner"
                    type="text"
                    placeholder="e.g. Head of Engineering"
                    required
                    :disabled="isLoading"
                    class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 disabled:opacity-50 transition-all"
                  >
                </div>

                <!-- Technical Owner -->
                <div class="space-y-2">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                    Technical Owner
                  </label>
                  <input
                    v-model="formData.technical_owner"
                    type="text"
                    placeholder="e.g. DevOps Team"
                    :disabled="isLoading"
                    class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 disabled:opacity-50 transition-all"
                  >
                </div>

                <!-- Data Sensitivity -->
                <div class="space-y-2">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                    Data Sensitivity
                  </label>
                  <select
                    v-model="formData.data_sensitivity"
                    :disabled="isLoading"
                    class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <option v-for="s in sensitivities" :key="s" :value="s">
                      {{ s.charAt(0).toUpperCase() + s.slice(1) }}
                    </option>
                  </select>
                </div>

                <!-- Business Criticality -->
                <div class="space-y-2">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                    Business Criticality
                  </label>
                  <select
                    v-model="formData.business_criticality"
                    :disabled="isLoading"
                    class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <option v-for="c in criticalities" :key="c" :value="c">
                      {{ c.charAt(0).toUpperCase() + c.slice(1) }}
                    </option>
                  </select>
                </div>

                <!-- Description -->
                <div class="space-y-2 md:col-span-2">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    v-model="formData.description"
                    rows="3"
                    placeholder="Provide a brief description of the asset and its importance..."
                    :disabled="isLoading"
                    class="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 disabled:opacity-50 transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </form>

            <!-- Actions -->
            <div class="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                @click="handleClose"
                :disabled="isLoading"
                class="w-full sm:w-auto px-8 py-3 rounded-xl border border-gray-200 text-[#0e1b1a] font-bold hover:bg-gray-100 transition-all disabled:opacity-50 cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                @click="handleSubmit"
                :disabled="isLoading"
                class="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#09423C] text-white font-bold hover:bg-[#07332e] transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span v-if="isLoading">Updating...</span>
                <span v-else>Update Asset</span>
                <div
                  v-if="isLoading"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"
                ></div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
