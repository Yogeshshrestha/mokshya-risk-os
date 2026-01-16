# Store System Documentation

This directory contains Pinia stores for centralized state management across the application. All data fetching and state management should go through these stores for optimal performance and consistency.

## Installation

Make sure Pinia is installed:
```bash
pnpm install pinia @pinia/nuxt
```

The stores are already configured in `nuxt.config.ts` with the `@pinia/nuxt` module.

## Available Stores

### 1. Dashboard Store (`dashboard.ts`)
Manages all dashboard-related data (CRO, CISO, Board views).

**Usage:**
```typescript
const dashboardStore = useDashboardStore()

// Fetch CRO dashboard
await dashboardStore.fetchCRODashboard(organizationId, params)

// Access data
const croData = dashboardStore.croDashboard
const isLoading = dashboardStore.croDashboardLoading

// Force refresh
await dashboardStore.fetchCRODashboard(organizationId, params, true)
```

**Features:**
- Automatic caching (5 minutes)
- Separate loading states for each dashboard type
- Force refresh option
- Stale data detection

### 2. Organization Store (`organization.ts`)
Manages organizations, members, invitations, and roles.

**Usage:**
```typescript
const orgStore = useOrganizationStore()

// Fetch organizations
await orgStore.fetchOrganizations()

// Get organization by ID
const org = orgStore.organizationById(organizationId)

// Create organization
await orgStore.createOrganization(data)

// Fetch members
await orgStore.fetchMembers(organizationId)
```

**Features:**
- Cached organization list
- Current organization tracking
- Member management
- Invitation management
- Role management

### 3. Risk Store (`risk.ts`)
Manages risks and risk statistics.

**Usage:**
```typescript
const riskStore = useRiskStore()

// Fetch risks
await riskStore.fetchRisks(organizationId, params)

// Get risk by ID
const risk = riskStore.riskById(riskId)

// Filter by status
const openRisks = riskStore.risksByStatus('open')

// Create risk
await riskStore.createRisk(organizationId, data)
```

**Features:**
- Cached risk list
- Current risk tracking
- Risk statistics
- Filtering by status/severity

### 4. Asset Store (`asset.ts`)
Manages assets and asset-related data.

**Usage:**
```typescript
const assetStore = useAssetStore()

// Fetch assets
await assetStore.fetchAssets(organizationId, params)

// Get asset by ID
const asset = assetStore.assetById(assetId)

// Filter by criticality
const criticalAssets = assetStore.assetsByCriticality('critical')

// Create asset
await assetStore.createAsset(organizationId, data)
```

**Features:**
- Cached asset list
- Current asset tracking
- Filtering by status/criticality

### 5. Questionnaire Store (`questionnaire.ts`)
Manages global questions, answers, and scores.

**Usage:**
```typescript
const questionnaireStore = useQuestionnaireStore()

// Fetch questions
await questionnaireStore.fetchQuestions({ active_only: true })

// Fetch answers
await questionnaireStore.fetchAnswers(organizationId)

// Submit answer
await questionnaireStore.submitAnswer(questionId, organizationId, data)

// Get completion percentage
const percentage = questionnaireStore.completionPercentage
```

**Features:**
- Question and category management
- Answer tracking
- Score calculation
- Completion percentage

## Migration Guide

### Before (Using Composables):
```vue
<script setup>
const dashboard = useDashboard()
const dashboardData = ref(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  dashboardData.value = await dashboard.getCRODashboard(organizationId)
  loading.value = false
})
</script>
```

### After (Using Stores):
```vue
<script setup>
const dashboardStore = useDashboardStore()

onMounted(async () => {
  await dashboardStore.fetchCRODashboard(organizationId)
})

// Access data reactively
const dashboardData = computed(() => dashboardStore.croDashboard)
const loading = computed(() => dashboardStore.croDashboardLoading)
</script>
```

## Benefits

1. **Automatic Caching**: Data is cached for 5 minutes, reducing unnecessary API calls
2. **Reactive State**: All state is reactive and automatically updates components
3. **Centralized Loading States**: Loading and error states are managed centrally
4. **Force Refresh**: Option to bypass cache when needed
5. **Type Safety**: Full TypeScript support
6. **Performance**: Reduces duplicate API calls across components

## Best Practices

1. **Always use stores for data fetching**: Don't call composables directly in components
2. **Use computed properties**: Access store state through computed properties for reactivity
3. **Handle errors**: Check error states before displaying data
4. **Force refresh when needed**: Use `forceRefresh: true` after mutations
5. **Clear stores on logout**: Clear all stores when user logs out

## Example: Complete Component Migration

```vue
<script setup lang="ts">
const route = useRoute()
const organizationId = route.params.id as string

// Use stores
const dashboardStore = useDashboardStore()
const orgStore = useOrganizationStore()

// Reactive computed properties
const dashboardData = computed(() => dashboardStore.croDashboard)
const organization = computed(() => orgStore.currentOrganization)
const isLoading = computed(() => dashboardStore.croDashboardLoading)
const error = computed(() => dashboardStore.croDashboardError)

// Fetch data
onMounted(async () => {
  await Promise.all([
    orgStore.fetchOrganization(organizationId),
    dashboardStore.fetchCRODashboard(organizationId)
  ])
})

// Force refresh function
const refresh = async () => {
  await dashboardStore.fetchCRODashboard(organizationId, undefined, true)
}
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else-if="dashboardData">
    <!-- Use dashboardData -->
  </div>
</template>
```

## Store Structure

Each store follows this pattern:
- **State**: Reactive data and loading/error states
- **Getters**: Computed properties for derived state
- **Actions**: Async methods for data fetching and mutations
- **Cache Management**: Automatic stale data detection

## Cache Duration

Default cache duration is **5 minutes**. This can be adjusted per store by modifying the `cacheDuration` property in the state.

## Clearing Stores

Stores can be cleared when needed:
```typescript
// Clear specific store
dashboardStore.clearDashboard()

// Clear all organization data
orgStore.clearOrganizations()
```
