/**
 * TypeScript type definitions
 */

export interface FAQItem {
  q: string
  a: string
}

export interface FeatureCard {
  title: string
  description: string
  image: string
  badge: string
}

export interface Step {
  title: string
  description: string
  icon: string
  duration: string
}

export interface TargetAudience {
  title: string
  icon: string // Iconify icon name (e.g., 'i-lucide-shield-check')
  position: {
    x: number
    y: number
  }
}

export interface SocialProof {
  avatars: string[]
  rating: number
  text: string
}

export interface PricingPlan {
  name: string
  description: string
  price: string
  period?: string
  billingNote?: string
  features: string[]
  ctaText: string
  popular?: boolean
  badge?: string
  includesLabel?: string
  buttonVariant?: 'primary' | 'light' | 'outline'
}

// Re-export auth types
export * from './auth'

// Re-export organization types
export * from './organization'

// Re-export global questionnaire types
export * from './global-questionnaire'

