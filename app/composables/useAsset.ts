import type { Asset, AssetCreate, AssetUpdate, AssetWithRisks } from '~/types/asset-risk'
import type { ApiError } from '~/types/auth'

export interface ListAssetsParams {
  asset_type?: string
  business_criticality?: string
  status?: string
  skip?: number
  limit?: number
}

export interface CountAssetsParams {
  asset_type?: string
  business_criticality?: string
  status?: string
}

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

  const listAssets = async (organizationId: string, params?: ListAssetsParams): Promise<Asset[]> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.request<Asset[]>(`/organizations/${organizationId}/assets`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
      return response || []
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list assets'
      throw apiError
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
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to get asset'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const updateAsset = async (organizationId: string, assetId: string, data: AssetUpdate): Promise<Asset> => {
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

  const countAssets = async (organizationId: string, params?: CountAssetsParams): Promise<number> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.request<{ count: number } | number>(`/organizations/${organizationId}/assets/count`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
      // Handle both response formats: { count: number } or just number
      if (typeof response === 'number') {
        return response
      }
      return response?.count || 0
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

