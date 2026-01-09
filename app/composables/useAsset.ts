import type { Asset, AssetCreate, AssetWithRisks } from '~/types/asset-risk'
import type { ApiError } from '~/types/auth'
import { SAMPLE_ASSETS, getSampleAssetWithRisks } from '~/constants/sample-asset-risk'

export const useAsset = () => {
  const api = useApi()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const createAsset = async (organizationId: string, data: AssetCreate): Promise<Asset> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<Asset>(`/organizations/${organizationId}/assets`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(data)
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to create asset'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const listAssets = async (organizationId: string, params?: Record<string, any>): Promise<Asset[]> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.request<Asset[]>(`/organizations/${organizationId}/assets`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
      return response.length > 0 ? response : SAMPLE_ASSETS
    } catch (err) {
      console.warn('Using sample assets due to API failure')
      return SAMPLE_ASSETS
    } finally {
      isLoading.value = false
    }
  }

  const getAsset = async (organizationId: string, assetId: string): Promise<AssetWithRisks> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<AssetWithRisks>(`/organizations/${organizationId}/assets/${assetId}`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err) {
      console.warn('Using sample asset detail due to API failure')
      const sample = getSampleAssetWithRisks(assetId)
      if (sample) return sample
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateAsset = async (organizationId: string, assetId: string, data: Partial<AssetCreate>): Promise<Asset> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<Asset>(`/organizations/${organizationId}/assets/${assetId}`, {
        method: 'PUT',
        requireAuth: true,
        body: JSON.stringify(data)
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to update asset'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const countAssets = async (organizationId: string, params?: Record<string, any>): Promise<number> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.request<{ count: number }>(`/organizations/${organizationId}/assets/count`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
      return response.count
    } catch (err) {
      console.warn('Failed to get asset count')
      return 0
    } finally {
      isLoading.value = false
    }
  }

  const retireAsset = async (organizationId: string, assetId: string): Promise<Asset> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<Asset>(`/organizations/${organizationId}/assets/${assetId}/retire`, {
        method: 'POST',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to retire asset'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const deleteAsset = async (organizationId: string, assetId: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      await api.request(`/organizations/${organizationId}/assets/${assetId}`, {
        method: 'DELETE',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to delete asset'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    createAsset,
    listAssets,
    getAsset,
    updateAsset,
    countAssets,
    retireAsset,
    deleteAsset
  }
}

