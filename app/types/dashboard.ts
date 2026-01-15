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
  current_level: number
  target_level: number
  status: string
  gap: number
  score_percentage: number
  questions_answered: number
  total_questions: number
}

export interface MetricValue {
  value: number
  unit: string
  trend: number | null
  trend_period: string
  status: string | null
  additional_info: string | null
}

export interface ControlMaturityOverview {
  domains: ControlDomain[]
  overall_current_level: number
  overall_target_level: number
  domains_above_target: number
  domains_at_target: number
  domains_below_target: number
  patch_velocity: MetricValue
  mfa_coverage: MetricValue
  endpoint_protection: MetricValue
  backup_success: MetricValue
}

export interface RemediationTask {
  id: string
  task_name: string
  control_name: string
  control_domain: string
  owner: {
    id: string
    initials: string
    full_name: string
  }
  due_date: string
  created_at: string
  updated_at: string
  status: string
  priority: string
  progress_percentage: number
}

export interface RemediationTaskTracker {
  total_tasks: number
  open: number
  in_progress: number
  done: number
  overdue: number
  tasks: RemediationTask[]
}

export interface ReadinessMetric {
  score: number
  status: string
  status_color: string
  trend: string
  last_assessment: string
  due_in_days: number | null
  blockers: string[]
}

export interface EvidenceCompleteness extends ReadinessMetric {
  total_required: number
  completed: number
  missing: number
  missing_categories: {
    category: string
    missing_count: number
  }[]
}

export interface ReadinessMetrics {
  insurance_readiness: ReadinessMetric
  audit_readiness: ReadinessMetric
  evidence_completeness: EvidenceCompleteness
}

export interface BoardDashboardResponse {
  generated_at: string
  organization_id: string
  organization_name: string
  quarter: string
  overall_cyber_risk_status: {
    status: string
    status_label: string
    trend: string
    trend_description: string
    trend_percentage: number
    compliance_score: number
    risk_tier: string
    exposure_score: number
  }
  estimated_financial_exposure: {
    low_estimate: number
    high_estimate: number
    low_formatted: string
    high_formatted: string
    confidence_level: string
    description: string
    trend_percentage: number
  }
  top_3_priority_risks: {
    risks: {
      id: string
      risk_name: string
      risk_category: string
      estimated_impact: number
      impact_formatted: string
      description: string
      severity: string
      rank: number
    }[]
    ranking_criteria: string
  }
  insurance_status: string
  insurance_readiness_score: number
  total_open_risks: number
  high_severity_risks: number
  overdue_mitigations: number
  // Keep optional fields for backwards compatibility if needed during migration
  decisions_required?: {
    id: string
    title: string
    description: string
    cost: string
    benefit: string
    status: 'awaiting' | 'reviewing' | 'approved'
  }[]
  trend_summary?: string
  peer_comparison?: {
    percentile: number
    sector: string
  }
}

export interface CriticalControlGapsSection {
  total_gaps: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count?: number
  gaps: RedFlag[]
}

export interface CISODashboardResponse {
  generated_at: string
  organization_id: string
  organization_name: string
  control_maturity_overview: ControlMaturityOverview
  critical_control_gaps: CriticalControlGapsSection
  remediation_task_tracker: RemediationTaskTracker
  readiness_metrics: ReadinessMetrics
  overall_security_score: number
  total_critical_gaps: number
  total_open_tasks: number
  insurance_ready: boolean
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
