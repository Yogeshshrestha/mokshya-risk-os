import type { Asset, AssetWithRisks, Risk, RiskWithAssets, RiskStatistics } from '~/types/asset-risk';

export const SAMPLE_ASSETS: Asset[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    organization_id: 'org-123',
    asset_id: 'ASSET-001',
    sequence_number: 1,
    name: 'Customer Database',
    asset_type: 'database',
    description: 'Primary PostgreSQL database storing customer PII',
    business_owner: 'John Smith',
    technical_owner: 'Jane Doe',
    data_sensitivity: 'restricted',
    business_criticality: 'high',
    status: 'active',
    created_at: '2024-12-31T10:30:00Z',
    updated_at: '2024-12-31T10:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    organization_id: 'org-123',
    asset_id: 'ASSET-002',
    sequence_number: 2,
    name: 'Marketing Website',
    asset_type: 'application',
    description: 'Public-facing corporate website',
    business_owner: 'Alice Green',
    technical_owner: 'Bob White',
    data_sensitivity: 'public',
    business_criticality: 'medium',
    status: 'active',
    created_at: '2025-01-02T09:15:00Z',
    updated_at: '2025-01-02T09:15:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    organization_id: 'org-123',
    asset_id: 'ASSET-003',
    sequence_number: 3,
    name: 'Internal File Server',
    asset_type: 'server',
    description: 'On-premise server for internal documentation',
    business_owner: 'Charlie Brown',
    technical_owner: 'David Black',
    data_sensitivity: 'internal',
    business_criticality: 'low',
    status: 'active',
    created_at: '2025-01-05T14:45:00Z',
    updated_at: '2025-01-05T14:45:00Z'
  }
];

export const SAMPLE_RISKS: Risk[] = [
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    organization_id: 'org-123',
    risk_id: 'RISK-001',
    sequence_number: 1,
    title: 'SQL Injection Vulnerability',
    description: 'Application vulnerable to SQL injection attacks in login form',
    category: 'data_security',
    threat_source: 'external',
    likelihood: 'high',
    impact: 'high',
    base_risk_score: 9.0,
    final_risk_score: 18.0,
    risk_rating: 'high',
    existing_controls: 'WAF enabled, parameterized queries partially implemented',
    risk_owner: 'Security Team Lead',
    treatment: 'mitigate',
    target_mitigation_date: '2025-03-31',
    status: 'open',
    created_at: '2024-12-31T10:30:00Z',
    updated_at: '2024-12-31T10:30:00Z'
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440004',
    organization_id: 'org-123',
    risk_id: 'RISK-002',
    sequence_number: 2,
    title: 'Unauthorized Access to Marketing CRM',
    description: 'Weak password policy could lead to unauthorized access',
    category: 'access_control',
    threat_source: 'internal',
    likelihood: 'medium',
    impact: 'medium',
    base_risk_score: 4.0,
    final_risk_score: 6.0,
    risk_rating: 'medium',
    existing_controls: 'Basic auth in place',
    risk_owner: 'Marketing Manager',
    treatment: 'mitigate',
    target_mitigation_date: '2025-04-15',
    status: 'in_progress',
    created_at: '2025-01-03T11:20:00Z',
    updated_at: '2025-01-03T11:20:00Z'
  }
];

export const SAMPLE_RISK_STATS: RiskStatistics = {
  total_risks: 2,
  open_risks: 1,
  in_progress_risks: 1,
  mitigated_risks: 0,
  accepted_risks: 0,
  high_risks: 1,
  medium_risks: 1,
  low_risks: 0,
  average_risk_score: 12.0
};

export const getSampleAssetWithRisks = (assetId: string): AssetWithRisks | null => {
  const asset = SAMPLE_ASSETS.find(a => a.id === assetId || a.asset_id === assetId);
  if (!asset) return null;
  return {
    ...asset,
    risks: SAMPLE_RISKS.filter(r => r.risk_id === 'RISK-001' && asset.asset_id === 'ASSET-001').map(r => ({
      id: r.id,
      risk_id: r.risk_id,
      title: r.title,
      category: r.category,
      risk_rating: r.risk_rating,
      status: r.status
    }))
  };
};

export const getSampleRiskWithAssets = (riskId: string): RiskWithAssets | null => {
  const risk = SAMPLE_RISKS.find(r => r.id === riskId || r.risk_id === riskId);
  if (!risk) return null;
  return {
    ...risk,
    assets: SAMPLE_ASSETS.filter(a => a.asset_id === 'ASSET-001' && risk.risk_id === 'RISK-001').map(a => ({
      id: a.id,
      asset_id: a.asset_id,
      name: a.name,
      asset_type: a.asset_type,
      business_criticality: a.business_criticality,
      status: a.status
    }))
  };
};

