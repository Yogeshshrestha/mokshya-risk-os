import type { 
  CRODashboardResponse, 
  ExecutiveSummary, 
  RiskRegisterSummary, 
  ControlMaturity, 
  AssetSummary 
} from '~/types/dashboard'
import type { ApiError } from '~/types/auth'

export const useDashboard = () => {
  const api = useApi()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getCRODashboard = async (organizationId: string, params?: {
    include_retired_assets?: boolean
    risk_limit?: number
    include_financial_exposure?: boolean
    include_insurance_assessment?: boolean
  }): Promise<CRODashboardResponse> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<CRODashboardResponse>(`/dashboard/cro/organizations/${organizationId}`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch dashboard data'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getExecutiveSummary = async (organizationId: string): Promise<ExecutiveSummary> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<ExecutiveSummary>(`/dashboard/cro/organizations/${organizationId}/executive-summary`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch executive summary'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getRiskRegisterSummary = async (organizationId: string, limit: number = 10): Promise<RiskRegisterSummary> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<RiskRegisterSummary>(`/dashboard/cro/organizations/${organizationId}/risk-register`, {
        method: 'GET',
        requireAuth: true,
        query: { limit }
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch risk register summary'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getControlMaturity = async (organizationId: string): Promise<ControlMaturity> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<ControlMaturity>(`/dashboard/cro/organizations/${organizationId}/control-maturity`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch control maturity data'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getAssetSummary = async (organizationId: string, includeRetired: boolean = false): Promise<AssetSummary> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<AssetSummary>(`/dashboard/cro/organizations/${organizationId}/asset-summary`, {
        method: 'GET',
        requireAuth: true,
        query: { include_retired: includeRetired }
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch asset summary'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    getCRODashboard,
    getExecutiveSummary,
    getRiskRegisterSummary,
    getControlMaturity,
    getAssetSummary
  }
}

