import type { Risk, RiskCreate, RiskWithAssets, RiskStatistics } from '~/types/asset-risk'
import type { ApiError } from '~/types/auth'
import { SAMPLE_RISKS, SAMPLE_RISK_STATS, getSampleRiskWithAssets } from '~/constants/sample-asset-risk'

export const useRisk = () => {
  const api = useApi()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const createRisk = async (organizationId: string, data: RiskCreate): Promise<Risk> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<Risk>(`/organizations/${organizationId}/risks`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(data)
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to create risk'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const listRisks = async (organizationId: string, params?: Record<string, any>): Promise<Risk[]> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.request<Risk[]>(`/organizations/${organizationId}/risks`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
      return response.length > 0 ? response : SAMPLE_RISKS
    } catch (err) {
      console.warn('Using sample risks due to API failure')
      return SAMPLE_RISKS
    } finally {
      isLoading.value = false
    }
  }

  const getRisk = async (organizationId: string, riskId: string): Promise<RiskWithAssets> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<RiskWithAssets>(`/organizations/${organizationId}/risks/${riskId}`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err) {
      console.warn('Using sample risk detail due to API failure')
      const sample = getSampleRiskWithAssets(riskId)
      if (sample) return sample
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateRisk = async (organizationId: string, riskId: string, data: Partial<RiskCreate>): Promise<Risk> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<Risk>(`/organizations/${organizationId}/risks/${riskId}`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify(data)
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to update risk'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const deleteRisk = async (organizationId: string, riskId: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      await api.request(`/organizations/${organizationId}/risks/${riskId}`, {
        method: 'DELETE',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to delete risk'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getStatistics = async (organizationId: string): Promise<RiskStatistics> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.request<RiskStatistics>(`/organizations/${organizationId}/risks/statistics`, {
        method: 'GET',
        requireAuth: true
      })
      return response || SAMPLE_RISK_STATS
    } catch (err) {
      console.warn('Using sample risk statistics due to API failure')
      return SAMPLE_RISK_STATS
    } finally {
      isLoading.value = false
    }
  }

  const reviewRisk = async (organizationId: string, riskId: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      await api.request(`/organizations/${organizationId}/risks/${riskId}/review`, {
        method: 'POST',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to review risk'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (organizationId: string, riskId: string, status: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      await api.request(`/organizations/${organizationId}/risks/${riskId}/status`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify({ status })
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to update risk status'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    createRisk,
    listRisks,
    getRisk,
    updateRisk,
    deleteRisk,
    getStatistics,
    reviewRisk,
    updateStatus
  }
}

