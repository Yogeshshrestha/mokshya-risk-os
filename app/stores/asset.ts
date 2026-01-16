import { defineStore } from 'pinia'
import type { Asset, AssetCreate, AssetWithRisks } from '~/types/asset-risk'

interface AssetState {
  assets: Asset[]
  currentAsset: AssetWithRisks | null
  
  loading: boolean
  error: string | null
  
  currentAssetLoading: boolean
  currentAssetError: string | null
  
  lastFetched: number | null
  cacheDuration: number
}

export const useAssetStore = defineStore('asset', {
  state: (): AssetState => ({
    assets: [],
    currentAsset: null,
    
    loading: false,
    error: null,
    
    currentAssetLoading: false,
    currentAssetError: null,
    
    lastFetched: null,
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    isStale: (state) => {
      if (!state.lastFetched) return true
      return Date.now() - state.lastFetched > state.cacheDuration
    },
    
    assetById: (state) => (id: string) => {
      return state.assets.find(asset => asset.asset_id === id) || null
    },
    
    assetsByStatus: (state) => (status: string) => {
      return state.assets.filter(asset => asset.status === status)
    },
    
    assetsByCriticality: (state) => (criticality: string) => {
      return state.assets.filter(asset => asset.business_criticality === criticality)
    }
  },

  actions: {
    async fetchAssets(organizationId: string, params?: Record<string, any>, forceRefresh = false) {
      if (!forceRefresh && !this.isStale && this.assets.length > 0) {
        return this.assets
      }

      this.loading = true
      this.error = null

      try {
        const asset = useAsset()
        const data = await asset.listAssets(organizationId, params)
        this.assets = data
        this.lastFetched = Date.now()
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch assets'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAsset(organizationId: string, assetId: string, forceRefresh = false) {
      // Check cache first
      const cached = this.assetById(assetId)
      if (!forceRefresh && cached && this.currentAsset?.asset_id === assetId) {
        return this.currentAsset
      }

      this.currentAssetLoading = true
      this.currentAssetError = null

      try {
        const asset = useAsset()
        const data = await asset.getAsset(organizationId, assetId)
        this.currentAsset = data
        
        // Update in assets array if exists
        const index = this.assets.findIndex(a => a.asset_id === assetId)
        if (index >= 0 && data.asset) {
          this.assets[index] = data.asset
        }
        
        return data
      } catch (error: any) {
        this.currentAssetError = error.message || 'Failed to fetch asset'
        throw error
      } finally {
        this.currentAssetLoading = false
      }
    },

    async createAsset(organizationId: string, data: AssetCreate) {
      this.loading = true
      this.error = null

      try {
        const asset = useAsset()
        const newAsset = await asset.createAsset(organizationId, data)
        this.assets.push(newAsset)
        return newAsset
      } catch (error: any) {
        this.error = error.message || 'Failed to create asset'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateAsset(organizationId: string, assetId: string, data: Partial<AssetCreate>) {
      this.loading = true
      this.error = null

      try {
        const asset = useAsset()
        const updated = await asset.updateAsset(organizationId, assetId, data)
        
        // Update in assets array
        const index = this.assets.findIndex(a => a.asset_id === assetId)
        if (index >= 0) {
          this.assets[index] = updated
        }
        
        // Update current asset if it's the same
        if (this.currentAsset?.asset_id === assetId && this.currentAsset.asset) {
          this.currentAsset.asset = updated
        }
        
        return updated
      } catch (error: any) {
        this.error = error.message || 'Failed to update asset'
        throw error
      } finally {
        this.loading = false
      }
    },

    async retireAsset(organizationId: string, assetId: string) {
      this.loading = true
      this.error = null

      try {
        const asset = useAsset()
        const retired = await asset.retireAsset(organizationId, assetId)
        
        // Update in assets array
        const index = this.assets.findIndex(a => a.asset_id === assetId)
        if (index >= 0) {
          this.assets[index] = retired
        }
        
        // Update current asset if it's the same
        if (this.currentAsset?.asset_id === assetId && this.currentAsset.asset) {
          this.currentAsset.asset = retired
        }
        
        return retired
      } catch (error: any) {
        this.error = error.message || 'Failed to retire asset'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteAsset(organizationId: string, assetId: string) {
      this.loading = true
      this.error = null

      try {
        const asset = useAsset()
        await asset.deleteAsset(organizationId, assetId)
        this.assets = this.assets.filter(a => a.asset_id !== assetId)
        
        if (this.currentAsset?.asset_id === assetId) {
          this.currentAsset = null
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to delete asset'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearAssets() {
      this.assets = []
      this.currentAsset = null
      this.lastFetched = null
    },

    setCurrentAsset(asset: AssetWithRisks | null) {
      this.currentAsset = asset
    }
  }
})
