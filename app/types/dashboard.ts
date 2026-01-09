export interface RedFlag {
  code: string
  question_code: string
  question_text: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  recommendation: string
}

export interface FinancialExposure {
  total_estimated_exposure_usd: number
  data_breach_exposure: number
  ransomware_exposure: number
  business_interruption_exposure: number
  regulatory_fines_exposure: number
  high_criticality_assets: number
  restricted_data_assets: number
  high_rated_risks: number
  calculation_notes: string
}

export interface InsuranceReadiness {
  eligibility: 'eligible' | 'conditional' | 'at_risk' | 'ineligible'
  score: number
  has_mfa: boolean
  has_endpoint_protection: boolean
  has_backup_strategy: boolean
  has_incident_response_plan: boolean
  has_security_training: boolean
  has_privileged_access_management: boolean
  critical_gaps: string[]
  recommendations: string[]
  estimated_premium_impact: string
}

export interface ExecutiveSummary {
  organization_id: string
  organization_name: string
  assessment_date: string
  risk_tier: 'critical' | 'high' | 'medium' | 'low'
  risk_score: number
  risk_grade: string
  risk_trend: 'improving' | 'stable' | 'worsening'
  questionnaire_completion: number
  compliance_score: number
  red_flags_count: number
  critical_red_flags: number
  red_flags: RedFlag[]
  financial_exposure: FinancialExposure
  insurance_readiness: InsuranceReadiness
  total_assets: number
  high_criticality_assets: number
  total_risks: number
  high_rated_risks: number
  open_risks: number
  overdue_mitigations: number
}

export interface DashboardRisk {
  id: string
  risk_id: string
  title: string
  description: string
  category: string
  likelihood: string
  impact: string
  final_risk_score: number
  risk_rating: string
  threat_source: string
  affected_assets: string[]
  affected_asset_count: number
  max_asset_criticality: string
  treatment: string
  existing_controls: string
  risk_owner: string
  target_mitigation_date: string
  days_until_due: number
  is_overdue: boolean
  status: string
  last_reviewed_at: string
  days_since_review: number
}

export interface RiskRegisterSummary {
  total_risks: number
  open_risks: number
  in_progress_risks: number
  mitigated_risks: number
  accepted_risks: number
  critical_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
  average_risk_score: number
  risks_requiring_attention: number
  overdue_mitigations: number
  top_risks: DashboardRisk[]
}

export interface ControlDomain {
  domain: string
  display_name: string
  score: number
  maturity_level: 'optimized' | 'managed' | 'defined' | 'developing' | 'initial'
  total_controls: number
  implemented_controls: number
  partial_controls: number
  missing_controls: number
  trend: 'improving' | 'stable' | 'worsening'
  critical_gaps: string[]
}

export interface ControlMaturity {
  overall_maturity_score: number
  overall_maturity_level: string
  domains: ControlDomain[]
  strongest_domain: string
  weakest_domain: string
}

export interface AssetCategorySummary {
  category: string
  display_name: string
  count: number
  high_criticality: number
  medium_criticality: number
  low_criticality: number
  restricted_data: number
  linked_risks: number
}

export interface AssetSummary {
  total_assets: number
  active_assets: number
  retired_assets: number
  high_criticality: number
  medium_criticality: number
  low_criticality: number
  restricted_data: number
  confidential_data: number
  internal_data: number
  public_data: number
  assets_with_risks: number
  assets_with_high_risks: number
  unassessed_assets: number
  categories: AssetCategorySummary[]
}

export interface CRODashboardResponse {
  generated_at: string
  data_as_of: string
  executive_summary: ExecutiveSummary
  risk_register: RiskRegisterSummary
  control_maturity: ControlMaturity
  asset_summary: AssetSummary
  priority_actions: string[]
  report_available: boolean
  last_report_date: string | null
}

