/**
 * Asset and Risk type definitions
 */

// Asset Enums
export type AssetType = 'application' | 'database' | 'server' | 'cloud_service' | 'endpoint' | 'vendor' | 'data';
export type DataSensitivity = 'public' | 'internal' | 'confidential' | 'restricted';
export type BusinessCriticality = 'low' | 'medium' | 'high';
export type AssetStatus = 'active' | 'retired';

// Risk Enums
export type RiskCategory = 'data_security' | 'access_control' | 'network' | 'third_party' | 'compliance' | 'operational';
export type ThreatSource = 'internal' | 'external';
export type LikelihoodLevel = 'low' | 'medium' | 'high';
export type ImpactLevel = 'low' | 'medium' | 'high';
export type RiskRating = 'low' | 'medium' | 'high';
export type RiskTreatment = 'accept' | 'mitigate' | 'transfer' | 'avoid';
export type RiskStatus = 'open' | 'in_progress' | 'mitigated' | 'accepted';

// Asset Interfaces
export interface Asset {
  id: string;
  organization_id: string;
  asset_id: string;
  sequence_number: number;
  name: string;
  asset_type: AssetType;
  description?: string;
  business_owner: string;
  technical_owner?: string;
  data_sensitivity: DataSensitivity;
  business_criticality: BusinessCriticality;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  created_by_name?: string;
}

export interface AssetCreate {
  name: string;
  asset_type: AssetType;
  description?: string;
  business_owner: string;
  technical_owner?: string;
  data_sensitivity?: DataSensitivity;
  business_criticality?: BusinessCriticality;
}

export interface AssetUpdate {
  name?: string;
  asset_type?: AssetType;
  description?: string;
  business_owner?: string;
  technical_owner?: string;
  data_sensitivity?: DataSensitivity;
  business_criticality?: BusinessCriticality;
  status?: AssetStatus;
}

export interface AssetWithRisks extends Asset {
  risks: Array<{
    id: string;
    risk_id: string;
    title: string;
    category: RiskCategory;
    risk_rating: RiskRating;
    status: RiskStatus;
    created_by_name?: string;
  }>;
}

// Risk Interfaces
export interface Risk {
  id: string;
  organization_id: string;
  risk_id: string;
  sequence_number: number;
  title: string;
  description?: string;
  category: RiskCategory;
  threat_source: ThreatSource;
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  base_risk_score: number;
  final_risk_score: number;
  risk_rating: RiskRating;
  existing_controls?: string;
  risk_owner: string;
  treatment: RiskTreatment;
  target_mitigation_date?: string;
  status: RiskStatus;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  created_by_name?: string;
}

export interface RiskCreate {
  title: string;
  description?: string;
  category: RiskCategory;
  threat_source?: ThreatSource;
  likelihood?: LikelihoodLevel;
  impact?: ImpactLevel;
  existing_controls?: string;
  risk_owner: string;
  treatment?: RiskTreatment;
  target_mitigation_date?: string;
  asset_ids: string[];
}

export interface RiskUpdate {
  title?: string;
  description?: string;
  category?: RiskCategory;
  threat_source?: ThreatSource;
  likelihood?: LikelihoodLevel;
  impact?: ImpactLevel;
  existing_controls?: string;
  risk_owner?: string;
  treatment?: RiskTreatment;
  target_mitigation_date?: string;
  asset_ids?: string[];
}

export interface RiskWithAssets extends Risk {
  assets: Array<{
    id: string;
    asset_id: string;
    name: string;
    asset_type: AssetType;
    business_criticality: BusinessCriticality;
    status: AssetStatus;
  }>;
}

export interface RiskStatistics {
  total_risks: number;
  open_risks: number;
  in_progress_risks: number;
  mitigated_risks: number;
  accepted_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  average_risk_score: number;
}

