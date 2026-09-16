---
name: Aether Minimal Intelligence
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#464555'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system embodies the tension between computational power and human clarity: a "Premium Minimalist AI" aesthetic. It balances clinical precision with tactile, approachable modernism. Rather than relying on clichéd cyberpunk motifs or glowing neon tropes, the interface conveys intelligence through restraint, deliberate atmospheric depth, generous white space, and micro-precision typography.

The target audience consists of discerning engineers, product leaders, researchers, and executive operators who require powerful cognitive augmentation without visual distraction. The interface evokes quiet authority, effortless speed, confidence, and cognitive calm.

### Design Movement Synthesis
- **Hyper-Minimalism:** Systematic layouts, ruthless removal of decorative noise, and structured content hierarchy.
- **Modern Tactile Depth:** Layered surfaces featuring ultra-fine micro-borders, tinted diffuse shadows, and crisp tactile affordances that ground floating UI elements.
- **Intelligent Focus:** Monochromatic discipline interrupted only by targeted semantic accents—electric iris signaling synthetic cognition, and emerald confirming execution fidelity.

## Colors
The color architecture establishes an airy, gallery-grade canvas punctuated by razor-sharp structural contrasts.

### Palette Roles & Balance
- **Canvas Base (`#F8F9FA` / `#F9FAFB`):** A warm off-white that mitigates ocular strain, distinguishing the workspace from stark clinical white.
- **Structural Charcoal (`#0F172A` / `#111827`):** Deep midnight slate reserved for primary typography, primary structural containers, active states, and grounding headers.
- **Electric Iris (`#4F46E5` / `#6366F1`):** The primary intelligent energy color. Used surgically for execution CTAs, generative stream cursors, high-priority interactions, and selected states.
- **Vibrant Emerald (`#10B981`):** Functional tertiary accent for real-time model operational status, high-confidence inference scores, and completion states.
- **Subtle Surface Linework (`#E2E8F0` / `#E5E7EB`):** Muted slate dividers providing explicit bounds without visual weight.

Maintain an 80/15/5 distribution rule: 80% neutral base and white space, 15% structural charcoal and supporting neutrals, 5% radiant iris and emerald interaction points.

## Typography
The typographic hierarchy merges the geometric warmth and distinct personality of **Plus Jakarta Sans** for prominent headers with the rigorous, neutral utilitarian legibility of **Inter** for dense prompt outputs, settings, and analytical feeds.

### Typographic Hierarchy & Character
- Headings feature tighter tracking (`-0.01em` to `-0.03em`) to deliver modern, compact architectural presence.
- Body content maintains deliberate proportional leading to facilitate uninterrupted scanning across lengthy model outputs and complex telemetry.
- Meta labels, badges, and status chips apply slightly expanded letter-spacing to enhance legibility at ultra-compact scales.

## Layout & Spacing
This design system employs a rigorous, responsive fluid grid framework calibrated on an 8-point base rhythm, supplemented with 4-point micro-adjustments for compact contextual UI.

### Breakpoints & Adaptive Logic
- **Desktop (1200px+):** 12-column dynamic grid, 48px canvas margin, 24px gutters. Dual-pane and split-canvas workflows allow simultaneous inspection of source context and AI generation buffers.
- **Tablet (768px – 1199px):** 8-column grid, 32px canvas margins, 20px gutters. Collapsible sidebars shift into overlay sheets.
- **Mobile (320px – 767px):** 4-column fluid layout, 20px margins, 16px gutters. Stacked single-thread views with fixed bottom command inputs.

### Spacing Philosophy
Negative space is treated as an active structural element, isolating complex data blocks to minimize user fatigue during high-bandwidth workflows.

## Elevation & Depth
Elevation eschews heavy, dirty dropshadows in favor of ethereal, multi-layered atmospheric ambient occlusion tinted subtly with midnight slate.

### Elevation Hierarchy
- **Level 0 (Base Canvas):** Solid `#F8F9FA`. Recessed areas (such as code preview zones or input wells) use `#F1F5F9` with a subtle inner hairline shadow.
- **Level 1 (Default Surface / Tactile Cards):** Pure `#FFFFFF` surface accompanied by a crisp `1px` border in `#E2E8F0` and a dual-layer soft shadow:
  - `0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)`
- **Level 2 (Hover States & Interactive Widgets):** Smooth spatial uplift:
  - `0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 12px 24px -4px rgba(15, 23, 42, 0.06)`
  - Accompanying border color transitions smoothly to `#CBD5E1`.
- **Level 3 (Command Palettes, Popovers & Dialogs):** High focal floating depth:
  - `0 20px 32px -8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)`
  - Pair with a semi-translucent backdrop filter: `rgba(248, 249, 250, 0.75)` with `backdrop-filter: blur(12px)`.

## Shapes
The shape system revolves around modern, soft geometric squircle silhouettes, creating approachable yet disciplined frames.

- **Primary Cards & Modals:** Standardized on `rounded-2xl` (1rem / 16px) to ground analytical interfaces with friendly, human-centric perimeters.
- **Inputs, Buttons, & Interactive Controls:** Standardized on `rounded-lg` (0.5rem / 8px) to preserve crisp clickable precision.
- **Badges, Tags, & Status Pills:** Standardized on full pill radius (`9999px`) for quick visual identification.
- **Form Selectors & Checkboxes:** Soft squircle (`6px`) balancing mechanical precision and touch accessibility.

## Components

### Buttons & Interactive Triggers
- **Primary Action:** Solid midnight charcoal (`#0F172A`) base with white text, transitioning to electric iris (`#4F46E5`) on hover or during processing. 8px radius, subtle top-edge highlight (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.12)`).
- **Secondary / Ghost:** `#FFFFFF` fill, 1px `#E2E8F0` border, charcoal text. Hover elevates border to `#CBD5E1` and transitions background to `#F8F9FA`.
- **AI Accent Button:** Gradient tinting or solid `#4F46E5` fill reserved exclusively for generative execution triggers (e.g., "Generate", "Synthesize", "Deploy").

### Cards & Model Viewports
- Rendered on crisp `#FFFFFF` backgrounds bound by a 1px `#E2E8F0` hairline border and Level 1 soft atmospheric shadow.
- Inner padding follows dynamic steps: 24px for desktop data containers, 16px for compact mobile cards.

### Input Fields & Command Prompts
- Resting state: Crisp `#FFFFFF` surface with 1px `#E2E8F0` border, 8px border radius, and muted placeholder text (`#94A3B8`).
- Focus state: Smooth transition to a 1px iris border (`#4F46E5`) supported by an iris glow ring: `0 0 0 3px rgba(79, 70, 229, 0.12)`.
- AI Command Prompt Bar: Multi-line dynamic floating input bar elevated at Level 2, with integrated contextual pills and prompt submission shortcuts.

### Status Indicators & Badges
- **Active / Operational:** Soft emerald wash (`#ECFDF5`), deep emerald text (`#065F46`), accompanied by a live 6px pulsing emerald dot (`#10B981`).
- **Processing / Inferring:** Subtle iris wash (`#EEF2FF`), saturated iris text (`#3730A3`), with a synchronized breathing indicator.
- **Neutral / Meta:** Warm slate wash (`#F1F5F9`), neutral text (`#475569`).

### Checkboxes, Radios, & Switches
- 1px neutral border in inactive state. When checked, surfaces transition to solid `#4F46E5` displaying a pure white geometric icon checkmark.
- Switches feature a smooth rolling thumb with Level 1 elevation against a low-contrast neutral track that fills with iris upon activation.

### Streaming Generation Container
- Live tokens render into an isolated `#FAFAFA` sub-surface with an animated vertical iris pulse bar (`2px width`, `#4F46E5`) indicating streaming inference. Monospaced blocks feature syntax highlighting calibrated against Slate 900.