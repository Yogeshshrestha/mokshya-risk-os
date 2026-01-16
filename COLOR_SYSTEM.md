# Color System Documentation

## Standardized Color Palette

This document outlines the standardized color system used throughout the project. All colors should use CSS variables defined in `app/assets/css/main.css`.

### Primary Colors
- **Primary**: `#09423C` → `var(--color-primary)`
- **Secondary**: `#F7FDF9` → `var(--color-secondary)`

### Text Colors
- **Title**: `#0D1B12` → `var(--color-title)`
- **Subtitle**: `#4B5563` → `var(--color-subtitle)`

### Status Colors
- **In Progress**: `#1D4ED8` → `var(--color-in-progress)`
- **Complete/Done**: `#22C55E` → `var(--color-complete)`
- **Critical**: `#DC2626` → `var(--color-critical)`
- **High**: `#EA580C` → `var(--color-high)`
- **Warning**: `#F59E0B` → `var(--color-warning)`
- **Warning Alt**: `#D97706` → `var(--color-warning-alt)`

## Color Replacement Patterns

### Old Colors → New Colors

#### Primary/Teal Colors
- `#09423C`, `#09423c`, `#09433e`, `#0d635c` → `var(--color-primary)` or `bg-[var(--color-primary)]`
- For hover states: Use opacity → `bg-[var(--color-primary)]/80` or `hover:bg-[var(--color-primary)]/80`

#### Text Colors
- `#0D1B12`, `#0e1b1a` → `var(--color-title)` or `text-[var(--color-title)]`
- `#4B5563`, `#4f9690` → `var(--color-subtitle)` or `text-[var(--color-subtitle)]`

#### Status Colors
- `#ef4444`, `#DC2626`, `red-500`, `rose-600` → `var(--color-critical)` or `bg-[var(--color-critical)]`
- `#f59e0b`, `#F59E0B`, `amber-500`, `amber-600` → `var(--color-warning)` or `bg-[var(--color-warning)]`
- `#10b981`, `#22C55E`, `green-500`, `emerald-500` → `var(--color-complete)` or `bg-[var(--color-complete)]`
- `#EA580C`, `orange-500`, `orange-600` → `var(--color-high)` or `bg-[var(--color-high)]`
- `#1D4ED8`, `blue-500` → `var(--color-in-progress)` or `bg-[var(--color-in-progress)]`

### Using Opacity for Variations

Instead of using different color shades, use opacity modifiers:

**Background Colors:**
- Light background: `bg-[var(--color-primary)]/10`
- Medium background: `bg-[var(--color-primary)]/20`
- Dark background: `bg-[var(--color-primary)]/80`

**Text Colors:**
- Light text: `text-[var(--color-subtitle)]/60`
- Medium text: `text-[var(--color-subtitle)]`
- Dark text: `text-[var(--color-title)]`

**Borders:**
- Light border: `border-[var(--color-primary)]/10`
- Medium border: `border-[var(--color-primary)]/20`

### Examples

#### Before:
```vue
<div class="bg-[#09423C] text-white hover:bg-[#07332e]">
  Button
</div>
```

#### After:
```vue
<div class="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/80">
  Button
</div>
```

#### Before:
```vue
<span class="text-[#ef4444]">Critical</span>
<div class="bg-rose-50 text-rose-600">Alert</div>
```

#### After:
```vue
<span class="text-[var(--color-critical)]">Critical</span>
<div class="bg-[var(--color-critical)]/10 text-[var(--color-critical)]">Alert</div>
```

## Files Updated

The following files have been updated to use the new color system:
- ✅ `app/assets/css/main.css` - Color variables defined
- ✅ `app/components/dashboard/ControlMaturityBarChart.vue`
- ✅ `app/components/dashboard/CriticalControlGapsTable.vue`
- ✅ `app/components/sections/TargetAudienceSection.vue`
- ✅ `app/app.vue` (partial)

## Remaining Files

The following files still need color updates (use the patterns above):
- `app/pages/organizations/[id]/dashboard.vue`
- `app/components/dashboard/board/*.vue` (multiple files)
- `app/components/dashboard/*.vue` (multiple files)
- `app/components/organizations/*.vue` (multiple files)
- `app/pages/**/*.vue` (multiple files)

## Migration Checklist

When updating a file:
1. ✅ Replace hardcoded hex colors with CSS variables
2. ✅ Use opacity modifiers instead of different color shades
3. ✅ Replace Tailwind color classes (rose-*, amber-*, etc.) with standardized colors + opacity
4. ✅ Test visual appearance to ensure colors match design intent
5. ✅ Verify hover states use opacity instead of darker colors
