---
name: Arabic Clinical Booking System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3f484d'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f787e'
  outline-variant: '#bfc8cd'
  surface-tint: '#006684'
  primary: '#00556d'
  on-primary: '#ffffff'
  primary-container: '#0f6e8c'
  on-primary-container: '#c1eaff'
  inverse-primary: '#85d0f2'
  secondary: '#555f6d'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f1'
  on-secondary-container: '#596372'
  tertiary: '#025a2a'
  on-tertiary: '#ffffff'
  tertiary-container: '#287340'
  on-tertiary-container: '#a8f6b6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bde9ff'
  primary-fixed-dim: '#85d0f2'
  on-primary-fixed: '#001f2a'
  on-primary-fixed-variant: '#004d64'
  secondary-fixed: '#d9e3f4'
  secondary-fixed-dim: '#bdc7d8'
  on-secondary-fixed: '#121c28'
  on-secondary-fixed-variant: '#3e4755'
  tertiary-fixed: '#a6f4b5'
  tertiary-fixed-dim: '#8bd79b'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005226'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  label-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-sm:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered specifically for institutional, high-trust medical clinic appointment scheduling. The target audience includes patients of all demographics and ages, necessitating clear readability, low cognitive load, and zero visual friction. The emotional baseline is quiet assurance, surgical precision, and institutional authority—reminiscent of civil infrastructure and premier healthcare institutions.

The design movement is purely Flat Minimalism with an institutional cadence:
- **Zero Ornamentation:** No drop shadows, no color gradients, no blurred backdrops, and no purely decorative illustrations or iconography.
- **RTL-First Structure:** Every alignment, flow, and spatial rhythm naturally originates from the right and terminates on the left.
- **Cognitive Singularity:** Every screen is architected around a single unambiguous primary decision to prevent decision paralysis in anxious or elderly patients.

## Colors

The palette is tuned specifically to minimize eye fatigue under prolonged mobile usage and combat harsh blue-light emission. 

- **Canvas Background:** `#F8F6F0` (warm ivory / sugar tone) forms the foundational surface for the entire viewport.
- **Card & Component Surfaces:** `#FFFFFF` (crisp white) layered over the warm background, framed with a 1px solid hairline border of `#E5E7EB`.
- **Primary Brand / Action:** `#0F6E8C` (deep clinical teal), signaling clinical composure and professional credibility. Used strictly for the single primary action button, selected state indicators, and top-level branding accents.
- **Text & Foreground:**
  - Primary text & headlines: `#1F2937` (high-contrast deep charcoal).
  - Secondary text, hints, & metadata: `#4B5563` (accessible muted slate).
  - Hairline borders & structural dividers: `#E5E7EB`.
- **State Semantics:**
  - Success / Confirmed: `#166534` (deep forest green).
  - Destructive / Alert / Cancel: `#991B1B` (deep crimson).
  - These semantic tones are applied strictly to confirmed states, appointment cancellations, or critical form errors—never for decorative highlights.

## Typography

Typography prioritizes Arabic legibility and institutional neutrality using clean, open Kufic-influenced forms (`Noto Sans Arabic` or system equivalents). Arabic script requires generous line height compared to Latin typography to prevent diacritics and ascenders/descenders from colliding.

- **Baseline Body Size:** The default body text is set to 18px regular with a 30px line height (`body-lg`) to ensure effortless reading for patients under varying stress or lighting conditions.
- **Section Headers & Titles:** 24px bold (`headline-lg`) with 36px line height.
- **Letter Spacing:** Maintained at `normal` (0px) to prevent cursive Arabic letter detachments, with tracking applied strictly to Latin numeric systems if present.
- **Text Alignment:** Right-aligned (`text-align: right`) by default across all layouts.

## Layout & Spacing

The layout is built around a single-column fluid mobile flow with strict RTL alignment:

- **Canvas Margins:** Mobile screens maintain a consistent `1.25rem` (20px) outer padding. Content never bleeds to the screen edge except for edge-to-edge structured card groups.
- **Vertical Rhythm:** Group related form inputs and options with `space-md` (16px), and separate distinct appointment stages or operational cards with `space-lg` (24px) or `space-xl` (32px).
- **Single Action Anchoring:** The primary user journey relies on a persistent or bottom-anchored container holding the single primary button, padded with `margin` from the viewport baseline.

## Elevation & Depth

This design system rejects all drop shadows, elevation blurs, skeuomorphic bevels, and layered glass effects. Depth is established purely through two-dimensional contrast and structural outlines:

- **Layer 0 (Canvas):** Solid `#F8F6F0`.
- **Layer 1 (Cards, Modules, Field Inputs):** Solid `#FFFFFF` surfaces defined by a crisp 1px solid `#E5E7EB` border.
- **Layer 2 (Selected / Active States):** The 1px border transitions from `#E5E7EB` to a 2px solid `#0F6E8C` border. No drop shadow is added.
- **Hierarchy:** Established solely by layout grouping, typographic scale, and deliberate use of white space.

## Shapes

Shapes communicate institutional precision and structural restraint.

- **Border Radius:** Modest 8px (`0.5rem`) corner rounding applied uniformly across buttons, cards, list items, and form inputs.
- **No Pill Radii:** Full pill (`9999px`) rounded elements are excluded to preserve a serious, civic, and clinical aesthetic.
- **No Sharp Angles:** Fully sharp `0px` corners are avoided to ensure comfortable touch targets and visual softness.

## Components

### Buttons
- **Primary Button:** Minimum height of 56px, full width (`width: 100%`), solid `#0F6E8C` background, `#FFFFFF` text (`label-lg`), 8px border radius, no border, no shadow. Exactly one per screen.
- **Secondary / Back Action:** Text or 1px bordered button (`#1F2937` text, `#FFFFFF` surface, 1px border `#E5E7EB`), 56px height.
- **Destructive Button (Cancel Appointment):** Solid `#991B1B` background with `#FFFFFF` text, or 1px border `#991B1B` with `#991B1B` text. Used exclusively for irreversible actions.
- **Disabled State:** Solid `#E5E7EB` background with `#4B5563` text.

### Cards & Appointment Summaries
- **Surface:** Solid `#FFFFFF`, 1px solid border `#E5E7EB`, 8px border radius, `space-lg` (24px) internal padding.
- **Data Rows:** Labeled metadata paired with values. The label is rendered in 16px `#4B5563`, aligned to the right. The value is rendered in 18px bold `#1F2937`.
- **Dividers:** 1px solid `#E5E7EB` hairline rule separating distinct sections.

### Form Inputs & Date/Time Selectors
- **Input Fields:** Solid `#FFFFFF` fill, 1px solid `#E5E7EB` border, 56px height, 8px border radius, text aligned to the right with 16px padding on right and left edges.
- **Selection Chips (Slots / Dates):** 
  - *Unselected:* Solid `#FFFFFF`, 1px solid `#E5E7EB` border, `#1F2937` text.
  - *Selected:* Solid `#0F6E8C` with `#FFFFFF` text, or `#FFFFFF` surface with a 2px solid `#0F6E8C` border and `#0F6E8C` text.
- **Labels:** 16px `#1F2937` font weight 600, positioned directly above the input field with `space-xs` (4px) clearance.

### Checkboxes & Radio Controls
- **Geometry:** 24px by 24px square (checkbox) or circle (radio), positioned on the far right of the option row in RTL layout.
- **Inactive:** Solid `#FFFFFF` surface with 2px solid `#E5E7EB`.
- **Active:** Solid `#0F6E8C` fill with a flat white inner mark. No motion or bounce animations.

### Lists
- **Structure:** Edge-to-edge or card-contained rows. Each row is separated by a 1px solid `#E5E7EB` border.
- **Paddings:** Minimum 16px vertical padding per row to facilitate thumb tapping.
- **Chevron:** If a navigation chevron is required, use a simple functional vector arrow pointing to the left (`←` for RTL progression), colored `#4B5563`.