import { defineStore } from 'pinia'
import type { 
  CRODashboardResponse, 
  CISODashboardResponse,
  BoardDashboardResponse,
  ExecutiveSummary,
  RiskRegisterSummary,
  RemediationTaskTracker,
  ReadinessMetrics,
  CriticalControlGapsSection
} from '~/types/dashboard'

interface DashboardState {
  // CRO Dashboard
  croDashboard: CRODashboardResponse | null
  croDashboardLoading: boolean
  croDashboardError: string | null
  croDashboardLastFetched: number | null
  
  // CISO Dashboard
  cisoDashboard: CISODashboardResponse | null
  cisoDashboardLoading: boolean
  cisoDashboardError: string | null
  cisoDashboardLastFetched: number | null
  
  // Board Dashboard
  boardDashboard: BoardDashboardResponse | null
  boardDashboardLoading: boolean
  boardDashboardError: string | null
  boardDashboardLastFetched: number | null
  
  // Executive Summary
  executiveSummary: ExecutiveSummary | null
  executiveSummaryLoading: boolean
  executiveSummaryError: string | null
  
  // Risk Register
  riskRegister: RiskRegisterSummary | null
  riskRegisterLoading: boolean
  riskRegisterError: string | null
  
  // Control Maturity
  controlMaturity: CRODashboardResponse['control_maturity'] | null
  cisoControlMaturity: CISODashboardResponse['control_maturity_overview'] | null
  controlMaturityLoading: boolean
  controlMaturityError: string | null
  
  // Critical Gaps
  criticalGaps: CriticalControlGapsSection | null
  criticalGapsLoading: boolean
  criticalGapsError: string | null
  
  // Remediation Tasks
  remediationTasks: RemediationTaskTracker | null
  remediationTasksLoading: boolean
  remediationTasksError: string | null
  
  // Readiness Metrics
  readinessMetrics: ReadinessMetrics | null
  readinessMetricsLoading: boolean
  readinessMetricsError: string | null
  
  // Cache duration (5 minutes)
  cacheDuration: number
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    croDashboard: null,
    croDashboardLoading: false,
    croDashboardError: null,
    croDashboardLastFetched: null,
    
    cisoDashboard: null,
    cisoDashboardLoading: false,
    cisoDashboardError: null,
    cisoDashboardLastFetched: null,
    
    boardDashboard: null,
    boardDashboardLoading: false,
    boardDashboardError: null,
    boardDashboardLastFetched: null,
    
    executiveSummary: null,
    executiveSummaryLoading: false,
    executiveSummaryError: null,
    
    riskRegister: null,
    riskRegisterLoading: false,
    riskRegisterError: null,
    
    controlMaturity: null,
    cisoControlMaturity: null,
    controlMaturityLoading: false,
    controlMaturityError: null,
    
    criticalGaps: null,
    criticalGapsLoading: false,
    criticalGapsError: null,
    
    remediationTasks: null,
    remediationTasksLoading: false,
    remediationTasksError: null,
    
    readinessMetrics: null,
    readinessMetricsLoading: false,
    readinessMetricsError: null,
    
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    isCRODashboardStale: (state) => {
      if (!state.croDashboardLastFetched) return true
      return Date.now() - state.croDashboardLastFetched > state.cacheDuration
    },
    
    isCISODashboardStale: (state) => {
      if (!state.cisoDashboardLastFetched) return true
      return Date.now() - state.cisoDashboardLastFetched > state.cacheDuration
    },
    
    isBoardDashboardStale: (state) => {
      if (!state.boardDashboardLastFetched) return true
      return Date.now() - state.boardDashboardLastFetched > state.cacheDuration
    }
  },

  actions: {
    async fetchCRODashboard(organizationId: string, params?: {
      include_retired_assets?: boolean
      risk_limit?: number
      include_financial_exposure?: boolean
      include_insurance_assessment?: boolean
    }, forceRefresh = false) {
      // Return cached data if fresh and not forcing refresh
      if (!forceRefresh && !this.isCRODashboardStale && this.croDashboard) {
        return this.croDashboard
      }

      this.croDashboardLoading = true
      this.croDashboardError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getCRODashboard(organizationId, params)
        this.croDashboard = data
        this.croDashboardLastFetched = Date.now()
        return data
      } catch (error: any) {
        this.croDashboardError = error.message || 'Failed to fetch CRO dashboard'
        throw error
      } finally {
        this.croDashboardLoading = false
      }
    },

    async fetchCISODashboard(organizationId: string, params?: {
      include_completed_tasks?: boolean
      task_limit?: number
      gap_limit?: number
      target_maturity_level?: number
      include_low_priority_gaps?: boolean
    }, forceRefresh = false) {
      if (!forceRefresh && !this.isCISODashboardStale && this.cisoDashboard) {
        return this.cisoDashboard
      }

      this.cisoDashboardLoading = true
      this.cisoDashboardError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getCISODashboard(organizationId, params)
        this.cisoDashboard = data
        this.cisoDashboardLastFetched = Date.now()
        return data
      } catch (error: any) {
        this.cisoDashboardError = error.message || 'Failed to fetch CISO dashboard'
        throw error
      } finally {
        this.cisoDashboardLoading = false
      }
    },

    async fetchBoardDashboard(organizationId: string, forceRefresh = false) {
      if (!forceRefresh && !this.isBoardDashboardStale && this.boardDashboard) {
        return this.boardDashboard
      }

      this.boardDashboardLoading = true
      this.boardDashboardError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getBoardDashboard(organizationId)
        this.boardDashboard = data
        this.boardDashboardLastFetched = Date.now()
        return data
      } catch (error: any) {
        this.boardDashboardError = error.message || 'Failed to fetch board dashboard'
        throw error
      } finally {
        this.boardDashboardLoading = false
      }
    },

    async fetchExecutiveSummary(organizationId: string) {
      this.executiveSummaryLoading = true
      this.executiveSummaryError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getExecutiveSummary(organizationId)
        this.executiveSummary = data
        return data
      } catch (error: any) {
        this.executiveSummaryError = error.message || 'Failed to fetch executive summary'
        throw error
      } finally {
        this.executiveSummaryLoading = false
      }
    },

    async fetchRiskRegister(organizationId: string, limit = 10) {
      this.riskRegisterLoading = true
      this.riskRegisterError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getRiskRegisterSummary(organizationId, limit)
        this.riskRegister = data
        return data
      } catch (error: any) {
        this.riskRegisterError = error.message || 'Failed to fetch risk register'
        throw error
      } finally {
        this.riskRegisterLoading = false
      }
    },

    async fetchControlMaturity(organizationId: string) {
      this.controlMaturityLoading = true
      this.controlMaturityError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getControlMaturity(organizationId)
        this.controlMaturity = data
        return data
      } catch (error: any) {
        this.controlMaturityError = error.message || 'Failed to fetch control maturity'
        throw error
      } finally {
        this.controlMaturityLoading = false
      }
    },

    async fetchCISOControlMaturity(organizationId: string, targetMaturityLevel = 3) {
      this.controlMaturityLoading = true
      this.controlMaturityError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getCISOControlMaturity(organizationId, targetMaturityLevel)
        this.cisoControlMaturity = data
        return data
      } catch (error: any) {
        this.controlMaturityError = error.message || 'Failed to fetch CISO control maturity'
        throw error
      } finally {
        this.controlMaturityLoading = false
      }
    },

    async fetchCriticalGaps(organizationId: string, params?: {
      limit?: number
      target_maturity_level?: number
      include_low_priority?: boolean
    }) {
      this.criticalGapsLoading = true
      this.criticalGapsError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getCriticalGaps(organizationId, params)
        this.criticalGaps = data
        return data
      } catch (error: any) {
        this.criticalGapsError = error.message || 'Failed to fetch critical gaps'
        throw error
      } finally {
        this.criticalGapsLoading = false
      }
    },

    async fetchRemediationTasks(organizationId: string, params?: {
      limit?: number
      include_completed?: boolean
    }) {
      this.remediationTasksLoading = true
      this.remediationTasksError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getRemediationTasks(organizationId, params)
        this.remediationTasks = data
        return data
      } catch (error: any) {
        this.remediationTasksError = error.message || 'Failed to fetch remediation tasks'
        throw error
      } finally {
        this.remediationTasksLoading = false
      }
    },

    async fetchReadinessMetrics(organizationId: string) {
      this.readinessMetricsLoading = true
      this.readinessMetricsError = null

      try {
        const dashboard = useDashboard()
        const data = await dashboard.getReadinessMetrics(organizationId)
        this.readinessMetrics = data
        return data
      } catch (error: any) {
        this.readinessMetricsError = error.message || 'Failed to fetch readiness metrics'
        throw error
      } finally {
        this.readinessMetricsLoading = false
      }
    },

    // Clear all dashboard data
    clearDashboard() {
      this.croDashboard = null
      this.cisoDashboard = null
      this.boardDashboard = null
      this.executiveSummary = null
      this.riskRegister = null
      this.controlMaturity = null
      this.cisoControlMaturity = null
      this.criticalGaps = null
      this.remediationTasks = null
      this.readinessMetrics = null
      this.croDashboardLastFetched = null
      this.cisoDashboardLastFetched = null
      this.boardDashboardLastFetched = null
    },

    // Clear specific dashboard
    clearCRODashboard() {
      this.croDashboard = null
      this.croDashboardLastFetched = null
    },

    clearCISODashboard() {
      this.cisoDashboard = null
      this.cisoDashboardLastFetched = null
    },

    clearBoardDashboard() {
      this.boardDashboard = null
      this.boardDashboardLastFetched = null
    }
  }
})
