export interface RedFlag {
  code: string
  question_code: string
  question_text: string
  severity: 'critical' | 'major' | 'medium' | 'low'
  category: string
  recommendation: string
  name?: string
  triggered?: boolean
  description?: string
  remediation?: string
}

export interface FinancialExposure {
  annual_revenue: number
  daily_revenue: number
  records_held: number
  sector_multiplier: number
  ransomware_loss: number
  data_breach_loss: number
  bec_loss: number
  single_event_low: number
  single_event_mid: number
  single_event_high: number
  expected_annual_loss_low: number
  expected_annual_loss_mid: number
  expected_annual_loss_high: number
  pml_95: number
  pml_99: number
}

export interface RiskScoring {
  base_scores: {
    severity_raw: number
    likelihood_raw: number
    severity: number
    likelihood: number
    severity_factors: string[]
    likelihood_factors: string[]
  }
  modified_scores: {
    severity: number
    likelihood: number
    sector_modifier_severity: number
    sector_modifier_likelihood: number
    size_modifier_severity: number
    size_modifier_likelihood: number
  }
  exposure_score: number
  base_tier: string
  red_flags: RedFlag[]
  critical_red_flags_count: number
  major_red_flags_count: number
  total_tier_penalty: number
  final_tier: string
  financial_exposure: FinancialExposure
  eligibility: string
  eligibility_reason: string
  calculation_timestamp: string
  calculation_version: string
}

export interface ExecutiveSummary {
  organization_id: string
  organization_name: string
  assessment_date: string
  risk_tier_grade: string
  exposure_score: number
  base_tier: string
  questionnaire_completion: number
  compliance_score: number
  red_flags_count: number
  critical_red_flags: number
  major_red_flags: number
  red_flags: RedFlag[]
  insurance_eligibility: string
  insurance_eligibility_reason: string
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
  description: string | null
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
  existing_controls: string | null
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
  maturity_level: string
  total_controls: number
  implemented_controls: number
  partial_controls: number
  missing_controls: number
  trend: string
  previous_score: number | null
  critical_gaps: string[]
}

export interface ControlMaturity {
  overall_maturity_score: number
  overall_maturity_level: string
  domains: ControlDomain[]
  strongest_domain: string
  weakest_domain: string
  industry_average: number | null
  peer_comparison: number | null
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
  risk_scoring: RiskScoring
  priority_actions: string[]
  report_available: boolean
  last_report_date: string | null
}
