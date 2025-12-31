/**
 * Static data constants
 */

import type { FAQItem, FeatureCard, Step, TargetAudience, PricingPlan } from '~/types'

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'What is Mokshya OS?',
    a: 'Mokshya OS is a comprehensive risk management platform that translates technical cybersecurity data into financial risk metrics, enabling organizations to quantify exposure in real-time.'
  },
  {
    q: 'Who is Mokshya OS built for?',
    a: 'It is designed for CISOs, CFOs, Risk Managers, and Board Members who need to bridge the gap between technical security signals and business risk decisions.'
  },
  {
    q: 'How does the assessment work?',
    a: 'We securely integrate with your existing security stack (cloud, identity, endpoint) via API to collect data, then use our proprietary engine to model potential loss scenarios.'
  },
  {
    q: 'What kind of results do I get?',
    a: 'You receive a real-time risk tier (A-F), estimated financial exposure (probable vs max), policy readiness scores, and actionable remediation paths prioritized by financial impact.'
  }
]

export const FEATURE_CARDS: FeatureCard[] = [
  {
    title: 'Assess Risk',
    description: 'Convert abstract cyber threats into quantified real-time risk scores (A-F) that the board can understand immediately.',
    image: 'assessRiskIcon',
    badge: 'Core Capability'
  },
  {
    title: 'Analyze Risk',
    description: 'Automated mapping of your security posture to key compliance frameworks like SOC2, ISO 27001, and HIPAA.',
    image: 'analyzeRiskIcon',
    badge: 'Audit-Ready'
  },
  {
    title: 'Decide & Act',
    description: 'Calculate potential loss expectancy instantly based on your unique tech stack and threat landscape.',
    image: 'decideActIcon',
    badge: 'Real-Time'
  }
] as const

export const STEPS: Step[] = [
  {
    title: 'Connect Stack',
    description: 'Securely integrate with your existing cloud, identity, and security tools via API.',
    icon: 'i-lucide-plug',
    duration: '10 Minutes'
  },
  {
    title: 'Analyze Risk',
    description: 'Our engine maps vulnerabilities to business impact and calculates financial exposure.',
    icon: 'i-lucide-bar-chart-3',
    duration: 'Instant'
  },
  {
    title: 'Decide & Act',
    description: 'Receive board-ready reports and actionable remediation paths optimized for insurance.',
    icon: 'i-lucide-zap',
    duration: 'Continuous'
  }
]

export const TARGET_AUDIENCE: TargetAudience[] = [
  { title: 'CISO', icon: 'i-lucide-shield-check', position: { x: 237, y: 0 } },
  { title: 'CRO', icon: 'i-lucide-trending-up', position: { x: 0, y: 122 } },
  { title: 'CFO', icon: 'i-lucide-wallet', position: { x: 462, y: 122 } },
  { title: 'Risk Mgrs', icon: 'i-lucide-alert-triangle', position: { x: 462.05, y: 378.86 } },
  { title: 'Board Members', icon: 'i-lucide-building-2', position: { x: 0, y: 379 } },
  { title: 'Under writers', icon: 'i-lucide-file-text', position: { x: 241.13, y: 521.98 } }
]

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Essential Risk',
    description: '',
    price: '$499',
    period: 'month',
    billingNote: 'Billed annually',
    features: [
      '10-minute guided risk assessment',
      'A-E risk tier classification',
      'Financial exposure range',
      'Board-ready 1-page summary',
      'Basic control maturity overview',
      'Secure dashboard access'
    ],
    ctaText: 'Start Assessment',
    badge: 'FOR FIRST-TIME ASSESSMENTS',
    buttonVariant: 'light'
  },
  {
    name: 'Risk Intelligence',
    description: '',
    price: '$999',
    period: 'month',
    billingNote: 'Billed annually',
    features: [
      'Full CRO dashboard',
      'Top risk register with RAG status',
      'Insurance eligibility & gap analysis',
      'Mitigation roadmap with ROI',
      'Exportable CRO & Board reports (PDF)',
      'Renewal tracking & alerts',
      'Persona-based views (CRO, Board, CFO)'
    ],
    ctaText: 'Start Full Assessment',
    popular: true,
    badge: 'Most chosen by CROs',
    includesLabel: 'EVERYTHING IN ESSENTIAL, PLUS:',
    buttonVariant: 'primary'
  },
  {
    name: 'Enterprise Custom',
    description: 'Tailored to your organization',
    price: 'Custom',
    period: '',
    billingNote: '',
    features: [
      'Broker & underwriter views',
      'Submission-ready insurer packs',
      'Custom scoring & benchmarks',
      'API & data exports',
      'Dedicated support & onboarding'
    ],
    ctaText: 'Book a Risk Consultation',
    badge: 'ADVANCED & INSURANCE-READY',
    includesLabel: 'EVERYTHING IN RISK INTELLIGENCE, PLUS:',
    buttonVariant: 'outline'
  }
] as const

// Assessment form options
export const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'energy', label: 'Energy' },
  { value: 'education', label: 'Education' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'other', label: 'Other' }
] as const

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
] as const

export const OPERATING_REGIONS = [
  { value: 'north-america', label: 'North America' },
  { value: 'south-america', label: 'South America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia-pacific', label: 'Asia Pacific' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'africa', label: 'Africa' }
] as const

