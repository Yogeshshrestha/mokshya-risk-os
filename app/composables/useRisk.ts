import type { Risk, RiskCreate, RiskWithAssets, RiskStatistics } from '~/types/asset-risk'
import type { ApiError } from '~/types/auth'

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
      return response || []
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to list risks'
      throw apiError
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
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to get risk'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const updateRisk = async (organizationId: string, riskId: string, data: Partial<RiskCreate>): Promise<Risk> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<Risk>(`/organizations/${organizationId}/risks/${riskId}`, {
        method: 'PUT',
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

  const countRisks = async (organizationId: string, params?: Record<string, any>): Promise<number> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.request<{ count: number }>(`/organizations/${organizationId}/risks/count`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
      return response.count
    } catch (err) {
      console.warn('Failed to get risk count')
      return 0
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
      return response || {
        total_risks: 0,
        open_risks: 0,
        in_progress_risks: 0,
        mitigated_risks: 0,
        accepted_risks: 0,
        high_risks: 0,
        medium_risks: 0,
        low_risks: 0,
        average_risk_score: 0
      }
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to get risk statistics'
      throw apiError
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
        method: 'POST',
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
    countRisks,
    deleteRisk,
    getStatistics,
    reviewRisk,
    updateStatus
  }
}

