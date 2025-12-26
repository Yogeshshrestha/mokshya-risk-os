# Pricing Components

This folder contains all pricing page-specific child components.

## Components

### `PricingCard.vue`
Main pricing plan card component that displays:
- Plan name, description, and pricing
- Badge (popular or category badge)
- Features list with checkmarks
- CTA button with different variants (primary, light, outline)

**Props:**
- `plan: PricingPlan` - The pricing plan data object

### `BillingToggle.vue`
Toggle component for switching between Monthly and Annual billing periods.

**Model:**
- `modelValue: 'monthly' | 'annual'` - Current billing period (default: 'annual')

### `PricingFeatureCard.vue`
Feature card component used in the features/benefits section.

**Props:**
- `title: string` - Feature title
- `description: string` - Main description
- `description2?: string` - Optional secondary description
- `icon: string` - Iconify icon name

## Usage

```vue
<script setup>
import PricingCard from '~/components/pricing/PricingCard.vue'
import BillingToggle from '~/components/pricing/BillingToggle.vue'
import PricingFeatureCard from '~/components/pricing/PricingFeatureCard.vue'
</script>
```

## Folder Structure

```
app/components/
├── pricing/              # Pricing page components
│   ├── PricingCard.vue
│   ├── BillingToggle.vue
│   ├── PricingFeatureCard.vue
│   └── README.md
├── sections/            # Reusable page sections
└── ui/                  # Base UI components
```

