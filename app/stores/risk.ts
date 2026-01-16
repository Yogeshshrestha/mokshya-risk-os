import { defineStore } from 'pinia'
import type { Risk, RiskCreate, RiskWithAssets, RiskStatistics } from '~/types/asset-risk'

interface RiskState {
  risks: Risk[]
  currentRisk: RiskWithAssets | null
  statistics: RiskStatistics | null
  
  loading: boolean
  error: string | null
  
  currentRiskLoading: boolean
  currentRiskError: string | null
  
  statisticsLoading: boolean
  statisticsError: string | null
  
  lastFetched: number | null
  cacheDuration: number
}

export const useRiskStore = defineStore('risk', {
  state: (): RiskState => ({
    risks: [],
    currentRisk: null,
    statistics: null,
    
    loading: false,
    error: null,
    
    currentRiskLoading: false,
    currentRiskError: null,
    
    statisticsLoading: false,
    statisticsError: null,
    
    lastFetched: null,
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    isStale: (state) => {
      if (!state.lastFetched) return true
      return Date.now() - state.lastFetched > state.cacheDuration
    },
    
    riskById: (state) => (id: string) => {
      return state.risks.find(risk => risk.risk_id === id) || null
    },
    
    risksByStatus: (state) => (status: string) => {
      return state.risks.filter(risk => risk.status === status)
    },
    
    risksBySeverity: (state) => (severity: string) => {
      return state.risks.filter(risk => risk.risk_rating === severity)
    }
  },

  actions: {
    async fetchRisks(organizationId: string, params?: Record<string, any>, forceRefresh = false) {
      if (!forceRefresh && !this.isStale && this.risks.length > 0) {
        return this.risks
      }

      this.loading = true
      this.error = null

      try {
        const risk = useRisk()
        const data = await risk.listRisks(organizationId, params)
        this.risks = data
        this.lastFetched = Date.now()
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch risks'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRisk(organizationId: string, riskId: string, forceRefresh = false) {
      // Check cache first
      const cached = this.riskById(riskId)
      if (!forceRefresh && cached && this.currentRisk?.risk_id === riskId) {
        return this.currentRisk
      }

      this.currentRiskLoading = true
      this.currentRiskError = null

      try {
        const risk = useRisk()
        const data = await risk.getRisk(organizationId, riskId)
        this.currentRisk = data
        
        // Update in risks array if exists
        const index = this.risks.findIndex(r => r.risk_id === riskId)
        if (index >= 0 && data.risk) {
          this.risks[index] = data.risk
        }
        
        return data
      } catch (error: any) {
        this.currentRiskError = error.message || 'Failed to fetch risk'
        throw error
      } finally {
        this.currentRiskLoading = false
      }
    },

    async createRisk(organizationId: string, data: RiskCreate) {
      this.loading = true
      this.error = null

      try {
        const risk = useRisk()
        const newRisk = await risk.createRisk(organizationId, data)
        this.risks.push(newRisk)
        return newRisk
      } catch (error: any) {
        this.error = error.message || 'Failed to create risk'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateRisk(organizationId: string, riskId: string, data: Partial<RiskCreate>) {
      this.loading = true
      this.error = null

      try {
        const risk = useRisk()
        const updated = await risk.updateRisk(organizationId, riskId, data)
        
        // Update in risks array
        const index = this.risks.findIndex(r => r.risk_id === riskId)
        if (index >= 0) {
          this.risks[index] = updated
        }
        
        // Update current risk if it's the same
        if (this.currentRisk?.risk_id === riskId && this.currentRisk.risk) {
          this.currentRisk.risk = updated
        }
        
        return updated
      } catch (error: any) {
        this.error = error.message || 'Failed to update risk'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteRisk(organizationId: string, riskId: string) {
      this.loading = true
      this.error = null

      try {
        const risk = useRisk()
        await risk.deleteRisk(organizationId, riskId)
        this.risks = this.risks.filter(r => r.risk_id !== riskId)
        
        if (this.currentRisk?.risk_id === riskId) {
          this.currentRisk = null
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to delete risk'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStatistics(organizationId: string) {
      this.statisticsLoading = true
      this.statisticsError = null

      try {
        const risk = useRisk()
        const data = await risk.getStatistics(organizationId)
        this.statistics = data
        return data
      } catch (error: any) {
        this.statisticsError = error.message || 'Failed to fetch statistics'
        throw error
      } finally {
        this.statisticsLoading = false
      }
    },

    async reviewRisk(organizationId: string, riskId: string) {
      this.loading = true
      this.error = null

      try {
        const risk = useRisk()
        await risk.reviewRisk(organizationId, riskId)
        
        // Refresh the risk
        await this.fetchRisk(organizationId, riskId, true)
      } catch (error: any) {
        this.error = error.message || 'Failed to review risk'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateRiskStatus(organizationId: string, riskId: string, status: string) {
      this.loading = true
      this.error = null

      try {
        const risk = useRisk()
        await risk.updateStatus(organizationId, riskId, status)
        
        // Update in risks array
        const index = this.risks.findIndex(r => r.risk_id === riskId)
        if (index >= 0) {
          this.risks[index].status = status
        }
        
        // Update current risk if it's the same
        if (this.currentRisk?.risk_id === riskId && this.currentRisk.risk) {
          this.currentRisk.risk.status = status
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to update risk status'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearRisks() {
      this.risks = []
      this.currentRisk = null
      this.statistics = null
      this.lastFetched = null
    },

    setCurrentRisk(risk: RiskWithAssets | null) {
      this.currentRisk = risk
    }
  }
})
