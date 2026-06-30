---
name: MoneyCat Dark Fintech
colors:
  bg: '#0f1117'
  surface: '#1a1d27'
  surface-2: '#22263a'
  border: '#2e3250'
  accent: '#6c63ff'
  accent-2: '#a78bfa'
  green: '#34d399'
  red: '#f87171'
  yellow: '#fbbf24'
  text: '#e8eaf6'
  muted: '#7b82a8'
  bg-light: '#f8f9fc'
  surface-light: '#ffffff'
  surface-2-light: '#f0f2f8'
  border-light: '#e0e4f0'
  accent-light: '#5a52e0'
  accent-2-light: '#7c6ee8'
  green-light: '#10b981'
  red-light: '#ef4444'
  yellow-light: '#f59e0b'
  text-light: '#1f2937'
  muted-light: '#6b7280'
typography:
  display:
    fontFamily: Space Grotesk
    fontWeight: '700'
    usage: card values, logo, modal titles, amount cells
  heading:
    fontFamily: Space Grotesk
    fontWeight: '600'
    usage: section titles, chat header
  body:
    fontFamily: Inter
    fontWeight: '400'
    usage: paragraph text, table cells, descriptions
  label:
    fontFamily: Inter
    fontWeight: '600'
    fontSize: 0.72rem-0.8rem
    letterSpacing: 0.04em-0.08em
    transform: uppercase
    usage: card labels, form labels, table headers
radius:
  sm: 6px
  DEFAULT: 8px
  md: 10px
  lg: 12px
  xl: 16px
  pill: 20px
  full: 9999px
spacing:
  container-max: 960px
  page-padding: 24px
  card-padding: 20px
  modal-padding: 28px
  gap-grid: 16px
---

## Brand & Style
MoneyCat is a personal expense tracker with an AI assistant ("MoneyCat AI") layered on top. The personality is friendly but precise — a finance tool that doesn't feel intimidating. The visual language sits closer to a modern SaaS dashboard than a spreadsheet: dark-first, card-based, with a violet accent that signals "AI-powered" without overwhelming the financial data it sits next to.

The style is best described as **Minimal Dark Fintech**. Flat surfaces, restrained borders, and color used almost exclusively as a semantic signal (category colors, budget status, income vs. spend) rather than for decoration. A light theme is available as a full token swap, not an afterthought — every color in the dark palette has a light counterpart tuned to keep the same contrast relationships.

## Colors
The base palette is built on **near-black Slate (#0f1117)** for the canvas, with two raised surface tones (`--surface`, `--surface2`) used to create a shallow two-level card hierarchy — never more than two levels of elevation at once.

**Indigo-Violet (#6c63ff)**, paired with a softer **Lavender (#a78bfa)**, is the single accent used for primary actions, focus rings, the AI badge, and the chat bubble. It is intentionally the *only* saturated hue used for UI chrome, which keeps the semantic colors (green/red/yellow) legible at a glance.

Semantic color is reserved entirely for money states: **Green (#34d399)** for totals/positive budget standing, **Red (#f87171)** for overspending and destructive actions, **Yellow (#fbbf24)** for "approaching budget limit" warnings. Each expense category also carries its own fixed hue (see `CAT_COLORS` in script.js) so a category stays visually identifiable across the pie chart, table pills, and breakdown chips.

## Typography
A two-typeface system: **Space Grotesk** for anything numeric or branded (the logo, big card values, amounts in the table, modal titles) — its geometric, slightly technical character reinforces "this is a finance tool." **Inter** handles everything else: body copy, form fields, table content, and all uppercase micro-labels.

Labels are consistently small (0.72–0.8rem), bold (600–700), letter-spaced, and uppercase — this is the primary hierarchy device used to separate metadata (card labels, table headers, form labels) from the actual content sitting beneath it.

## Layout & Spacing
A single centered column, **max-width 960px**, narrower than a typical dashboard — this is a personal tool, not a multi-pane admin panel. Content flows top to bottom in a fixed order: summary cards → budget bar → chart → category breakdown → transaction table. There is no sidebar and no multi-column split; everything is a vertically stacked sequence of cards.

Grids are responsive via `auto-fit`/`auto-fill` with a `minmax()` floor (summary cards: 180px min, category chips: 150px min), so the layout degrades gracefully to a single column on narrow viewports without needing separate breakpoint rules for every grid.

## Elevation & Depth
Depth is intentionally shallow and flat — there are no glassmorphism, blur, or large ambient shadows in the base layout. The header is the one exception: it uses `backdrop-filter: blur(12px)` while sticky, so content can scroll underneath it without a hard seam.

Elevation is communicated almost entirely through **border color shifts on interaction** (`.card:hover { border-color: var(--accent) }`) rather than shadow. Modals and the chat panel are the only components that lift off the page, using a real shadow (`0 16px 48px #0009`) and a spring-like transform (`cubic-bezier(.34,1.56,.64,1)`) to feel distinct from the static page beneath them.

## Shapes
Radii scale with component importance: **8px** for buttons, inputs, and small chips; **10–12px** for cards and table containers; **16px** for modals and the auth box; **full pill (9999px/20px)** for the AI badge, category pills, and the floating chat-toggle button. Sharper corners signal "interactive/dense," rounder corners signal "container."

## Components

### Buttons
`.btn-primary` is solid accent-violet with white text and a small lift + glow shadow on hover (`box-shadow: 0 4px 16px #6c63ff44`). `.btn-ghost` is bordered/transparent for secondary actions (cancel, search-adjacent icon actions). `.btn-danger` is text-only red, reserved for delete actions, with a faint red background on hover. Disabled buttons drop to 40% opacity and lose all hover transforms.

### Cards
Flat, single-border surfaces with consistent 16–20px padding. The only hover state is a border-color shift to accent — no lift, no shadow growth — keeping the dashboard calm even with many cards on screen at once.

### Forms & Inputs
Inputs use a slightly lighter surface (`--surface2`) than their parent card, a 1px border, and an accent border + soft glow ring on focus (`box-shadow: 0 0 0 3px #6c63ff22`). Error states are a small red caption beneath the field, hidden by default and toggled via a `.show` class rather than always reserving layout space.

### AI Surfaces
Anything AI-generated (the categorize suggestion box, the chat panel, the "AI" badge) uses a consistent visual signature: a soft violet gradient background (`linear-gradient(135deg, #6c63ff11, #a78bfa08)`), a violet-tinted border, and lavender (`--accent2`) text — distinguishing AI output from user-entered data without resorting to icons or labels alone.

### Budget Bar
A single horizontal progress track that shifts semantic color as it fills: green under 80%, yellow 80–100%, red once over budget. An alert banner only renders when the budget is actually exceeded, keeping the default state quiet.

### Chat Panel
A bottom-right floating panel pattern (toggle button + slide-up panel), common in support-widget UIs, repurposed here for the finance assistant. Messages are bubble-style with clear sender differentiation (accent-filled for user, neutral surface for AI), and a `.loading` state uses muted italic text rather than a spinner to keep it lightweight.
