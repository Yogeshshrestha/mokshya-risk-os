import type { 
  CRODashboardResponse, 
  CISODashboardResponse,
  ExecutiveSummary, 
  RiskRegisterSummary, 
  RemediationTaskTracker,
  ReadinessMetrics,
  RedFlag,
  BoardDashboardResponse,
  CriticalControlGapsSection
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
      error.value = apiError.message || 'Failed to fetch CRO dashboard data'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getCISODashboard = async (organizationId: string, params?: {
    include_completed_tasks?: boolean
    task_limit?: number
    gap_limit?: number
    target_maturity_level?: number
    include_low_priority_gaps?: boolean
  }): Promise<CISODashboardResponse> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<CISODashboardResponse>(`/dashboard/ciso/organizations/${organizationId}`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch CISO dashboard data'
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

  const getControlMaturity = async (organizationId: string): Promise<CRODashboardResponse['control_maturity']> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<CRODashboardResponse['control_maturity']>(`/dashboard/cro/organizations/${organizationId}/control-maturity`, {
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

  const getCISOControlMaturity = async (organizationId: string, targetMaturityLevel: number = 3): Promise<CISODashboardResponse['control_maturity_overview']> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<CISODashboardResponse['control_maturity_overview']>(`/dashboard/ciso/organizations/${organizationId}/control-maturity`, {
        method: 'GET',
        requireAuth: true,
        query: { target_maturity_level: targetMaturityLevel }
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch CISO control maturity data'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getCriticalGaps = async (organizationId: string, params?: {
    limit?: number
    target_maturity_level?: number
    include_low_priority?: boolean
  }): Promise<CriticalControlGapsSection> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<CriticalControlGapsSection>(`/dashboard/ciso/organizations/${organizationId}/critical-gaps`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch critical gaps'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getRemediationTasks = async (organizationId: string, params?: {
    limit?: number
    include_completed?: boolean
  }): Promise<RemediationTaskTracker> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<RemediationTaskTracker>(`/dashboard/ciso/organizations/${organizationId}/remediation-tasks`, {
        method: 'GET',
        requireAuth: true,
        query: params
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch remediation tasks'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getReadinessMetrics = async (organizationId: string): Promise<ReadinessMetrics> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<ReadinessMetrics>(`/dashboard/ciso/organizations/${organizationId}/readiness-metrics`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch readiness metrics'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getAssetSummary = async (organizationId: string, includeRetired: boolean = false): Promise<CRODashboardResponse['asset_summary']> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<CRODashboardResponse['asset_summary']>(`/dashboard/cro/organizations/${organizationId}/asset-summary`, {
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

  const getBoardDashboard = async (organizationId: string): Promise<BoardDashboardResponse> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<BoardDashboardResponse>(`/dashboard/board/organizations/${organizationId}`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch board dashboard data'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getBoardOverallRiskStatus = async (organizationId: string): Promise<BoardDashboardResponse['overall_cyber_risk_status']> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<BoardDashboardResponse['overall_cyber_risk_status']>(`/dashboard/board/organizations/${organizationId}/risk-status`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch board risk status'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getBoardFinancialExposure = async (organizationId: string): Promise<any> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<any>(`/dashboard/board/organizations/${organizationId}/financial-exposure`, {
        method: 'GET',
        requireAuth: true
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch board financial exposure'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const getBoardPriorityRisks = async (organizationId: string, limit: number = 3): Promise<BoardDashboardResponse['top_3_priority_risks']> => {
    isLoading.value = true
    error.value = null
    try {
      return await api.request<BoardDashboardResponse['top_3_priority_risks']>(`/dashboard/board/organizations/${organizationId}/priority-risks`, {
        method: 'GET',
        requireAuth: true,
        query: { limit }
      })
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Failed to fetch board priority risks'
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    getCRODashboard,
    getCISODashboard,
    getExecutiveSummary,
    getRiskRegisterSummary,
    getControlMaturity,
    getCISOControlMaturity,
    getCriticalGaps,
    getRemediationTasks,
    getReadinessMetrics,
    getAssetSummary,
    getBoardDashboard,
    getBoardOverallRiskStatus,
    getBoardFinancialExposure,
    getBoardPriorityRisks
  }
}

