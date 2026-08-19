---
name: NextKinLife Design System
description: Premium expat relocation and accommodation visual system.
colors:
  primary: "#00162D"
  secondary: "#0A1C30"
  accent: "#CB2A26"
  neutral: "#D5CBA8"
  cream: "#F9EDD3"
  ink: "#222222"
  ink-light: "#484848"
  ink-muted: "#717171"
  background: "#ffffff"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  subtitle:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  bodySmall:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
  caption:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "#A9221F"
  input-field:
    height: "48px"
    rounded: "{rounded.md}"
  card-container:
    padding: "24px"
    rounded: "{rounded.lg}"
---

# Design System: NextKinLife

## 1. Overview

**Creative North Star: "The Relocation Haven"**

This visual design system focuses on creating a secure, premium, and functional portal for expats and immigrants settling in a new country. The aesthetic rejects typical generic SaaS boilerplate (such as high-contrast purple/blue gradients or heavily-shadowed glassmorphism) in favor of deep structural colors, clean borders, highly legible typography, and a spacious grid layout. The layout feels professional and trustworthy, resembling established brands like Airbnb and Stripe.

**Key Characteristics:**
- Deep, anchor primary background tones (#00162D) to communicate safety and credibility.
- Highly functional layout with generous spacing and visible gutters.
- Restrained color application, using the vibrant red accent (#CB2A26) only for high-priority CTA interactions.
- Accessible typography with ample contrast and optimized readability.

## 2. Colors

The color palette centers around NextKinLife's brand navy and warm neutral details, with terracotta red to draw direct attention to primary actions.

### Primary
- **Expat Navy** (#00162D): The primary brand tone, representing stability, security, and institutional trustworthiness. Used for the app shell, headers, and major section titles.

### Secondary
- **Structural Blue** (#0A1C30): A supporting shade used to style sub-headers, primary active navigations, and subtle page partitions.

### Accent
- **Terracotta Red** (#CB2A26): NextKinLife's signature action color. Used on high-priority CTAs, primary buttons, and critical interactive hover outlines.

### Neutral
- **Ochre Gold** (#D5CBA8): A premium, earthy neutral used to emphasize minor headings and anchor border boundaries.
- **Warm Cream** (#F9EDD3): A soft background tone used to separate cards or draw highlight focus in sections.
- **Ink Dark** (#222222): The default body typography color, providing a solid 4.5:1 contrast against pure white backgrounds.
- **Ink Light** (#484848): Secondary body text.
- **Ink Muted** (#717171): Captions, labels, and borders.

### Named Rules
**The Rarity of Red Rule.** The terracotta red (#CB2A26) accent must only be applied to a single primary call to action on any viewport. Using it on decorative elements or repeating it on secondary elements is strictly prohibited.

## 3. Typography

**Display Font:** Plus Jakarta Sans (with system-sans fallback)
**Body Font:** Plus Jakarta Sans (with system-sans fallback)

**Character:** Unified under the crisp, geometric, yet human Sans-serif font *Plus Jakarta Sans*, ensuring readability at both large header scale and dense data density.

### Hierarchy
- **Display** (800, clamp(2.5rem, 6vw, 4rem), 1.1): Used for main page headers and landing page hero folds.
- **Headline** (700, 2rem, 1.2): Used for major sections.
- **Title** (600, 1.5rem, 1.3): Used for cards and list item groups.
- **Subtitle** (500, 1.125rem, 1.4): Used for sub-captions and intro texts.
- **Body** (400, 1rem, 1.5): Used for descriptions, inputs, and listings. Cap line length at 70ch.
- **BodySmall** (400, 0.875rem, 1.5): Small paragraphs and descriptions.
- **Label** (600, 0.75rem, 1.4, tracking-wider uppercase): Used for tags, badges, and metadata captions.
- **Caption** (500, 0.75rem, 1.4): Supporting metadata and captions.

### Named Rules
**The 65ch Rule.** Block text layouts and descriptions must be capped at 65 to 75 characters (approx. 550px width) to guarantee optimal reading focus.

## 4. Elevation

NextKinLife relies on structured borders and tonal backgrounds to create clean information hierarchy, using shadows strictly to provide tactile feedback to user clicks and hovers.

### Shadow Vocabulary
- **None**: For flat backgrounds.
- **Subtle** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05)`): Low elevations like inputs.
- **Card** (`box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03)`): Diffuse resting shadow.
- **Hover** (`box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06)`): Active card elevator.
- **Modal** (`box-shadow: 0 24px 50px rgba(0, 16, 45, 0.12)`): Highly elevated dialogs.

### Named Rules
**The Hover-Lift Rule.** Elevated cards are flat at rest. They must lift and expand their shadow depth only in response to a pointer hover, using a smooth cubic-bezier easing (all 0.3s cubic-bezier(0.16, 1, 0.3, 1)).

## 5. Components

### Buttons
- **Shape:** Rounded corners (12px button radius / `{rounded.md}`).
- **Primary:** Terracotta Red (#CB2A26) background with white text, using 12px vertical and 24px horizontal padding.
- **Hover / Focus:** Shifts background color to Deep Red (#A9221F) with a smooth transition.

### Cards / Containers
- **Corner Style:** Smooth rounded edges (16px card radius / `{rounded.lg}`).
- **Background:** White (#ffffff) with a thin border (border border-slate-200/50).
- **Shadow Strategy:** Uses Card shadow, scaling to Hover on focus/hover.

### Inputs / Fields
- **Style:** Clean border outline (1px solid border-slate-200) with a 12px border radius.
- **Focus:** Highlights outline with brand red (#CB2A26) with a subtle ring overlay.

## 6. Do's and Don'ts

### Do:
- **Do** use generous whitespace (at least 80px vertical margins between sections) to let the layout breathe.
- **Do** pair borders with light background tints (e.g., --color-cream or --color-neutral) for card separation.
- **Do** ensure contrast ratios for body copy hit or exceed 4.5:1 against the background.

### Don't:
- **Don't** use purple, blue, or violet gradients on marketing pages.
- **Don't** wrap cards inside other cards.
- **Don't** use aggressive, fast, or bouncing animations. Motion must be slow and smooth.
- **Don't** use gray body text on colored backgrounds.
- **Don't** use border-left or border-right accent stripes on cards to indicate categories.

---

## 7. Layout & Responsive Breakpoints

### Layout Grid System
- **Maximum Width**: Content is clamped at a max-width of `1280px` (`max-w-7xl` with `px-4 sm:px-6 lg:px-8` horizontal margins). Wide viewports clamp at `1440px`. Reading-only text containers are restricted to `72ch` (`max-w-2xl`).
- **Section Spacing**:
  - Hero margins: `120px` vertical margins.
  - Large sections: `96px` margins.
  - Normal sections: `80px` margins.
  - Compact sections: `48px` margins.
- **Gutter & Grid**: 12-column grid configuration with a default `24px` gap (`gap-6`) on desktop.

### Responsive Breakpoints
- **xs**: `480px` (small mobile devices).
- **sm**: `640px` (standard mobile/tablet transitions).
- **md**: `768px` (portrait tablets).
- **lg**: `1024px` (landscape tablets / small laptops).
- **xl**: `1280px` (desktop display).
- **2xl**: `1536px` (wide monitors).

---

## 8. Motion System

Motion is purposeful, responsive, and organic. Bouncing, elastic, or overly active choreography is forbidden.

- **Durations**:
  - Instant transitions (toggle switches, checkmarks): `100ms`.
  - Fast feedback transitions (button hover background changes): `150ms`.
  - Normal structural animations (fade-in, accordion expansion): `250ms`.
  - Slow layout shifts (modal entries, visual slide sweeps): `350ms`.
- **Easings**:
  - Standard curve: `cubic-bezier(0.16, 1, 0.3, 1)` (Ultra-smooth ease-out).
  - Entrance curve: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- **A11y reduced motion requirement**: Animations must be bypassed or replaced with simple opacity fades if the user's browser has configured `@media (prefers-reduced-motion: reduce)`.

---

## 9. Iconography

- **Library**: `lucide-react` is the canonical project icon set.
- **Icon Sizing Scale**:
  - Extra Small (`xs`): `16px` (used inside tags or inline button labels).
  - Small (`sm`): `18px` (default button decorators).
  - Medium (`md`): `20px` (default input/section labels).
  - Large (`lg`): `24px` (feature headers, stand-alone indicators).
- **Stroke Width**: Icons must be configured with a uniform stroke width of `1.75` for visual balance.

---

## 10. Trust Architecture

NextKinLife's primary value proposition is trust. Every interface rendering list data must satisfy the trust protocol:

- **Verified Badges**: Accommodation cards, expert advisors, and seller avatars must render a verified icon if the database record is flagged.
- **Reviews**: Star counts and written ratings must be visible on property layouts.
- **Identity Visibility**: Host profiles must display authentic names, response times, and clear photos.
- **Security Indicators**: Forms containing payment or identity detail entries must display secure connection indicators.

---

## 11. Empty States & Page Templates

### Empty State Design
Skeletons or structured loaders are required for remote data fetches. Static empty states must feature:
- An descriptive layout including:
  1. A minimal icon in warm cream or primary tone.
  2. A clear headline describing what is missing (e.g., "No Stays Found in This Region").
  3. A supporting paragraph detailing alternative filters.
  4. An action button to reset parameters.

### Page Templates
- **Landing page**: Left-heavy hero section followed by value propositions, search directory grids, testimonial carousels, and an editorial CTA.
- **Search Results page**: Split grid featuring list item cards on the left (50%) and an interactive map on the right (50%).
- **Dashboard / Profile**: Clean left vertical sidebar containing primary links, and a spacious main content box containing tables or lists.

---

## 12. Accessibility (A11y) & Interactive States

- **Keyboard Focus**: Focus outlines must be visible on all keyboard actions. Use a focus ring offset: outline-2 outline-offset-2 outline-[#CB2A26].
- **Touch Target size**: Touch targets must measure at least `44px` on mobile devices.
- **Typography Sizing**: Minimum size for body text is `14px` (`text-sm`), and display Kickers are restricted to `12px` (`text-xs`).
- **Contrast ratio**: The contrast ratio for body copy must hit or exceed `4.5:1` against the canvas background.

---

## 13. AI Generation & Performance Rules

### Generation Rules
- **Avoid**: Nested card layouts, floating blobs, heavy neon gradients, non-semantic grid elements, and placeholder text like "Lorem Ipsum".
- **Always**: Use realistic mock names, verify HTML tags (main, section, header, nav), enforce the 65ch line limits, and use proper grid structures.

### Performance Rules
- **Images**: Enforce `loading="lazy"` on visual imagery.
- **Blur restrictions**: Avoid heavy backdrop-filters or blurs inside loops.
- **Skeletons**: Always render skeletons instead of layout shifts.
