# Design System Document: The Wine Archive

## 1. Overview & Creative North Star
**Creative North Star: The Digital Sommelier’s Ledger**
This design system is crafted for the rigorous academic environment of WSET Level 4 candidates. It moves beyond the standard Android "app" feel to evoke the atmosphere of a high-end, private wine library. The aesthetic is rooted in **Academic Editorialism**: a fusion of Material Design 3’s functional logic with the prestige of a traditional archive.

To break the "template" look, the system leverages extreme typographic contrast and intentional asymmetry. Large, high-contrast serif headers sit in wide margins, while data-rich UI elements are nested within soft, tonal layers. We avoid rigid grids in favor of a "layered vellum" approach—where information feels curated and archived rather than merely displayed.

---

## 2. Colors: Tonal Depth & The Burgundy Core
Inspired by the deep burgundy of the vintage wine seal (#5E2129), the palette focuses on rich oenological tones and warm paper neutrals.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established solely through background shifts. For example, a `surface-container-low` list should sit directly on a `surface` background without a dividing line.

### Surface Hierarchy & Nesting
Treat the interface as a series of physical layers. We use the Material 3 `surface-container` tiers to create depth without visual noise:
- **Surface (Base):** `#fff8f7` - The primary canvas, mimicking fine stationery.
- **Surface-Container-Low:** `#fff0f0` - Use for secondary content areas.
- **Surface-Container-Highest:** `#eedfdf` - Use for interactive elements like cards or modal sheets.

### The Glass & Gradient Rule
To achieve a "premium archive" feel, use **Glassmorphism** for floating headers or navigation bars. Apply `surface` colors at 85% opacity with a `16px` backdrop-blur. 
- **Signature Texture:** For primary CTAs and Hero sections, use a subtle linear gradient from `primary` (#420b15) to `primary_container` (#5e2129) at a 135-degree angle. This adds a "velvet" depth that flat colors lack.

---

## 3. Typography: Editorial Authority
The type system is a dialogue between the tradition of print and the efficiency of modern UI.

- **The Display & Headline Scale (Newsreader):** Used for titles, vintage names, and region headers. This serif is high-contrast and sophisticated. For an editorial look, use `display-lg` with tightened letter-spacing (-0.02em) to mimic luxury mastheads.
- **The UI Scale (Inter):** Used for tasting notes, alcohol percentages, and technical data. Inter provides high legibility at small sizes (`label-sm`), ensuring the academic data remains accessible.

**Hierarchy Strategy:** 
Pair a `headline-lg` (Newsreader) with a `label-md` (Inter, All-Caps, tracked 0.1em) directly above it to act as a "brow" or category tag. This creates a scholarly, curated appearance.

---

## 4. Elevation & Depth: Tonal Layering
We reject traditional drop shadows in favor of **Tonal Layering**. Depth is communicated through the proximity of light-colored surfaces.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. The slight shift in "paper" tone provides enough contrast for the human eye to perceive elevation without the clutter of lines.
- **Ambient Shadows:** Only for elements that require a "floating" state (e.g., FABs or dropdowns). Use a blur value of `24dp` and a 6% opacity shadow tinted with `on-surface` (#211a1a).
- **The Ghost Border Fallback:** If accessibility requirements demand a border, use a "Ghost Border": `outline-variant` (#d8c1c2) at **15% opacity**. This provides a hint of structure without breaking the editorial flow.

---

## 5. Components: Refined Utility

### Buttons
- **Primary:** High-gloss burgundy gradient (`primary` to `primary_container`). Use `xl` (1.5rem) roundedness for a pill-shaped, premium feel. 
- **Secondary:** Outlined with a "Ghost Border." No fill. Text in `primary`.

### Cards & Tasting Lists
- **Forbid Dividers:** Do not use horizontal rules between wines in a list. Instead, use `8` (2rem) or `12` (3rem) spacing from the scale to create "breathable" separation.
- **Tonal Grouping:** Group related academic notes (e.g., "Acidity," "Tannin," "Alcohol") within a single `surface-container-high` card with a `md` (0.75rem) corner radius.

### Input Fields
- **Style:** Underline-only style with a `surface-variant` background fill. When focused, the underline transitions to `primary` burgundy.
- **Academic Context:** Helper text should use `label-sm` in `secondary` (#7a5557) to provide technical context for tasting inputs.

### Signature Component: The "Vintage Badge"
- A selection chip using `tertiary_container` (#003e26) with `on_tertiary_container` text. This deep forest green acts as a scholarly accent against the burgundy, perfect for marking "Exceptional" vintages.

---

## 6. Do's and Don'ts

### Do:
- **Do** use asymmetrical layouts. Align a serif header to the left while keeping technical UI data slightly offset to the right.
- **Do** lean into white space. Give the "Archive" room to breathe; use the `10` (2.5rem) and `12` (3rem) spacing tokens liberally.
- **Do** use "Paper" transitions. Animate surface color shifts (e.g., on hover) with a subtle, slow ease-in-out.

### Don't:
- **Don't** use 100% black. The "academic archive" feel relies on the "on-surface" charcoal (#211a1a) for text to prevent eye strain.
- **Don't** use sharp corners. Stick strictly to the `md` (0.75rem) to `xl` (1.5rem) range to maintain a soft, organic feel reminiscent of aged paper.
- **Don't** use standard Material 3 "elevated" shadows. They are too aggressive for this high-end context; stick to tonal shifts.