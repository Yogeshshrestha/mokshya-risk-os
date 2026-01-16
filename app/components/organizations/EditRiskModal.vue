<script setup lang="ts">
import type { RiskUpdate, RiskWithAssets, RiskCategory, ThreatSource, LikelihoodLevel, ImpactLevel, RiskTreatment, Asset } from '~/types/asset-risk'

interface Props {
  modelValue: boolean
  organizationId: string
  risk: RiskWithAssets | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
}>()

const riskApi = useRisk()
const assetApi = useAsset()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isLoading = ref(false)
const error = ref<string | null>(null)
const assets = ref<Asset[]>([])

const formData = ref<RiskUpdate>({
  title: '',
  description: '',
  category: 'data_security',
  threat_source: 'external',
  likelihood: 'medium',
  impact: 'medium',
  existing_controls: '',
  risk_owner: '',
  treatment: 'mitigate',
  target_mitigation_date: '',
  asset_ids: []
})

// Watch for risk changes to populate form
watch(() => props.risk, (newRisk) => {
  if (newRisk) {
    formData.value = {
      title: newRisk.title,
      description: newRisk.description || '',
      category: newRisk.category,
      threat_source: newRisk.threat_source,
      likelihood: newRisk.likelihood,
      impact: newRisk.impact,
      existing_controls: newRisk.existing_controls || '',
      risk_owner: newRisk.risk_owner,
      treatment: newRisk.treatment,
      target_mitigation_date: newRisk.target_mitigation_date ? newRisk.target_mitigation_date.split('T')[0] : '',
      asset_ids: newRisk.assets.map(a => a.id)
    }
  }
}, { immediate: true })

const riskCategories: { value: RiskCategory; label: string }[] = [
  { value: 'data_security', label: 'Data Security' },
  { value: 'access_control', label: 'Access Control' },
  { value: 'network', label: 'Network' },
  { value: 'third_party', label: 'Third Party' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'operational', label: 'Operational' }
]

const threatSources: ThreatSource[] = ['internal', 'external']
const levels: Array<LikelihoodLevel | ImpactLevel> = ['low', 'medium', 'high']
const treatments: RiskTreatment[] = ['accept', 'mitigate', 'transfer', 'avoid']

const fetchAssets = async () => {
  try {
    assets.value = await assetApi.listAssets(props.organizationId)
  } catch (error) {
    console.error('Failed to fetch assets for selection:', error)
  }
}

watch(isOpen, (val) => {
  if (val) {
    fetchAssets()
  }
})

const handleSubmit = async () => {
  if (!formData.value.title?.trim() || !formData.value.risk_owner?.trim() || !formData.value.asset_ids || formData.value.asset_ids.length === 0) {
    error.value = 'Title, Risk Owner, and at least one Asset are required'
    return
  }

  if (!props.risk) {
    error.value = 'Risk not found'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await riskApi.updateRisk(props.organizationId, props.risk.id, {
      ...formData.value,
      title: formData.value.title?.trim(),
      risk_owner: formData.value.risk_owner?.trim(),
      description: formData.value.description?.trim() || undefined,
      existing_controls: formData.value.existing_controls?.trim() || undefined,
      target_mitigation_date: formData.value.target_mitigation_date || undefined
    })
    
    emit('updated')
    isOpen.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to update risk'
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

const toggleAsset = (assetId: string) => {
  if (!formData.value.asset_ids) {
    formData.value.asset_ids = []
  }
  const index = formData.value.asset_ids.indexOf(assetId)
  if (index === -1) {
    formData.value.asset_ids.push(assetId)
  } else {
    formData.value.asset_ids.splice(index, 1)
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
            class="bg-white rounded-[24px] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100">
              <div>
                <h2 class="text-xl sm:text-2xl font-extrabold text-[#0e1b1a]">
                  Edit Risk
                </h2>
                <p class="text-[14px] text-[#4f9690] mt-1">Update risk information and assessment.</p>
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
            <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              <!-- Error Message -->
              <div
                v-if="error"
                class="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700"
              >
                {{ error }}
              </div>

              <div class="space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Risk Title <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="formData.title"
                      type="text"
                      placeholder="e.g. Unencrypted data in cloud storage"
                      required
                      :disabled="isLoading"
                      class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 transition-all"
                    >
                  </div>

                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Category <span class="text-rose-500">*</span>
                    </label>
                    <select
                      v-model="formData.category"
                      :disabled="isLoading"
                      class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 appearance-none cursor-pointer transition-all"
                    >
                      <option v-for="cat in riskCategories" :key="cat.value" :value="cat.value">
                        {{ cat.label }}
                      </option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Risk Owner <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="formData.risk_owner"
                      type="text"
                      placeholder="e.g. CISO"
                      required
                      :disabled="isLoading"
                      class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 focus:border-[#09423C]/30 transition-all"
                    >
                  </div>
                </div>

                <!-- Asset Selection -->
                <div class="space-y-3">
                  <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider block">
                    Impacted Assets <span class="text-rose-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div 
                      v-for="asset in assets" 
                      :key="asset.id"
                      @click="toggleAsset(asset.id)"
                      :class="[
                        'p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3',
                        formData.asset_ids?.includes(asset.id) 
                          ? 'bg-[#09423c]/5 border-[#09423c] ring-1 ring-[#09423c]' 
                          : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                      ]"
                    >
                      <div :class="['size-4 rounded border flex items-center justify-center transition-colors', 
                        formData.asset_ids?.includes(asset.id) ? 'bg-[#09423c] border-[#09423c]' : 'bg-white border-gray-300']">
                        <svg v-if="formData.asset_ids?.includes(asset.id)" class="size-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <p class="text-[13px] font-bold text-[#0e1b1a] truncate">{{ asset.name }}</p>
                        <p class="text-[10px] text-[#4f9690] uppercase tracking-wider">{{ asset.asset_id }}</p>
                      </div>
                    </div>
                  </div>
                  <p v-if="assets.length === 0" class="text-[12px] text-[#4f9690] italic">No assets available.</p>
                </div>

                <!-- Assessment -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#f8fbfb]">
                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Likelihood
                    </label>
                    <div class="flex gap-1">
                      <button 
                        v-for="lvl in levels" 
                        :key="'lik-'+lvl"
                        type="button"
                        @click="formData.likelihood = lvl as LikelihoodLevel"
                        :class="[
                          'flex-1 py-2 rounded-lg text-[11px] font-extrabold uppercase border transition-all',
                          formData.likelihood === lvl 
                            ? 'bg-[#09423c] text-white border-[#09423c] shadow-sm' 
                            : 'bg-white text-[#4f9690] border-gray-100 hover:bg-gray-50'
                        ]"
                      >
                        {{ lvl }}
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Impact
                    </label>
                    <div class="flex gap-1">
                      <button 
                        v-for="lvl in levels" 
                        :key="'imp-'+lvl"
                        type="button"
                        @click="formData.impact = lvl as ImpactLevel"
                        :class="[
                          'flex-1 py-2 rounded-lg text-[11px] font-extrabold uppercase border transition-all',
                          formData.impact === lvl 
                            ? 'bg-[#09423c] text-white border-[#09423c] shadow-sm' 
                            : 'bg-white text-[#4f9690] border-gray-100 hover:bg-gray-50'
                        ]"
                      >
                        {{ lvl }}
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Threat Source
                    </label>
                    <div class="flex gap-1">
                      <button 
                        v-for="src in threatSources" 
                        :key="src"
                        type="button"
                        @click="formData.threat_source = src"
                        :class="[
                          'flex-1 py-2 rounded-lg text-[11px] font-extrabold uppercase border transition-all',
                          formData.threat_source === src 
                            ? 'bg-[#09423c] text-white border-[#09423c] shadow-sm' 
                            : 'bg-white text-[#4f9690] border-gray-100 hover:bg-gray-50'
                        ]"
                      >
                        {{ src }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Strategy -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#f8fbfb]">
                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Treatment Strategy
                    </label>
                    <select
                      v-model="formData.treatment"
                      :disabled="isLoading"
                      class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 appearance-none cursor-pointer transition-all"
                    >
                      <option v-for="t in treatments" :key="t" :value="t">
                        {{ t.charAt(0).toUpperCase() + t.slice(1) }}
                      </option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Target Mitigation Date
                    </label>
                    <input
                      v-model="formData.target_mitigation_date"
                      type="date"
                      :disabled="isLoading"
                      class="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 transition-all"
                    >
                  </div>
                </div>

                <!-- Text Areas -->
                <div class="space-y-6 pt-4 border-t border-[#f8fbfb]">
                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Risk Description
                    </label>
                    <textarea
                      v-model="formData.description"
                      rows="3"
                      placeholder="Detailed explanation of the risk and potential consequences..."
                      :disabled="isLoading"
                      class="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 transition-all resize-none"
                    ></textarea>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[12px] font-extrabold text-[#4f9690] uppercase tracking-wider">
                      Existing Controls
                    </label>
                    <textarea
                      v-model="formData.existing_controls"
                      rows="3"
                      placeholder="List any security measures currently in place to address this risk..."
                      :disabled="isLoading"
                      class="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09423C]/20 transition-all resize-none"
                    ></textarea>
                  </div>
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
                <span v-else>Update Risk</span>
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
