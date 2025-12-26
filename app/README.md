# Mokshya OS - Component Architecture

## Project Structure

This project follows a professional, scalable component architecture pattern.

### Directory Structure

```
app/
├── components/
│   ├── ui/              # Reusable UI primitives
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   └── Badge.vue
│   └── sections/        # Page sections
│       ├── HeroSection.vue
│       ├── DashboardPreview.vue
│       ├── FeaturesSection.vue
│       ├── FeatureCard.vue
│       ├── HowItWorksSection.vue
│       ├── StepItem.vue
│       ├── TargetAudienceSection.vue
│       ├── AudienceOrb.vue
│       ├── FAQSection.vue
│       ├── FAQAccordion.vue
│       └── CTASection.vue
├── constants/
│   ├── images.ts        # Image asset URLs
│   └── data.ts          # Static data (FAQ, features, etc.)
├── composables/
│   └── useAccordion.ts  # Reusable accordion logic
├── types/
│   └── index.ts         # TypeScript type definitions
└── pages/
    └── index.vue        # Main landing page
```

## Component Hierarchy

### UI Components (`components/ui/`)
Base, reusable components that can be used throughout the application:
- **Button**: Customizable button with variants (primary, secondary, outline, ghost)
- **Card**: Flexible card component with variants (default, feature, dashboard)
- **Badge**: Badge component for labels and tags

### Section Components (`components/sections/`)
Large, page-specific sections that compose UI components:
- **HeroSection**: Landing page hero with CTA and social proof
- **DashboardPreview**: Interactive dashboard preview card
- **FeaturesSection**: Three-column feature showcase
- **HowItWorksSection**: Step-by-step process explanation
- **TargetAudienceSection**: Radial audience visualization
- **FAQSection**: Accordion FAQ section
- **CTASection**: Call-to-action section

## Data Management

### Constants
- **`constants/images.ts`**: Centralized image asset URLs from Figma
- **`constants/data.ts`**: Static content data (FAQ items, features, steps, etc.)

### Types
- **`types/index.ts`**: TypeScript interfaces for type safety

## Composables

Reusable Vue composition functions:
- **`useAccordion`**: Manages accordion state and interactions

## Dependencies Used

### @nuxt/ui
- `UContainer`: Responsive container component
- `UApp`, `UHeader`, `UMain`, `UFooter`: Layout components

### @nuxt/image
- `NuxtImg`: Optimized image component with lazy loading

### TypeScript
- Full type safety across components
- Interfaces for all data structures

## Best Practices

1. **Component Composition**: Large sections are broken into smaller, focused components
2. **Type Safety**: All components use TypeScript for better DX and error prevention
3. **Reusability**: UI components are generic and reusable
4. **Separation of Concerns**: Data, types, and logic are separated from presentation
5. **Performance**: Using `NuxtImg` for optimized image loading
6. **Maintainability**: Centralized constants make updates easy

## Usage Example

```vue
<script setup lang="ts">
// Components are auto-imported in Nuxt
</script>

<template>
  <HeroSection />
  <FeaturesSection />
</template>
```

## Adding New Components

1. **UI Component**: Add to `components/ui/` for reusable primitives
2. **Section Component**: Add to `components/sections/` for page sections
3. **Composable**: Add to `composables/` for reusable logic
4. **Constants**: Add to `constants/` for static data
5. **Types**: Add to `types/` for TypeScript definitions


