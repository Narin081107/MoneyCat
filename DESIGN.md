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
    usage: tables, input values, chat messages, labels
---

## Visual Rhythm

### The Overlay Architecture
To anchor focus on single-context interactions (Auth, Form Entry), the application uses absolute dark viewport overlays (`rgba(11, 13, 19, 0.6)`) paired with a `backdrop-filter: blur(4px)`. Content below is completely secondary. The entry blocks themselves are strictly centered cards with maximum widths of `420px` (Auth) and `480px` (Form).

### Card Hierarchy
Main stats use an explicit grid that snaps to rows based on available horizontal space. Each grid card utilizes a 1px solid border (`--border`) with a flat surface color (`--surface`). To maintain a modern flat appearance, elements don't leverage heavy drop-shadows; volume is defined by crisp, high-contrast borders and a consistent 16–20px padding. The only hover state is a border-color shift to accent — no lift, no shadow growth — keeping the dashboard calm even with many cards on screen at once.

### Forms & Inputs
Inputs use a slightly lighter surface (`--surface2`) than their parent card, a 1px border, and an accent border + soft glow ring on focus (`box-shadow: 0 0 0 3px #6c63ff22`). Error states are a small red caption beneath the field, hidden by default and toggled via a `.show` class rather than always reserving layout space.

### AI Surfaces
Anything AI-generated (the categorize suggestion box, the chat panel, the "AI" badge) uses a consistent visual signature: a soft violet gradient background (`linear-gradient(135deg, #6c63ff11, #a78bfa08)`), a violet-tinted border, and lavender (`--accent2`) text — distinguishing AI output from user-entered data without resorting to icons or labels alone.

### Budget Bar
A single horizontal progress track that shifts semantic color as it fills: green under 80%, yellow 80–100%, red once over budget. An alert banner only renders when the budget is actually exceeded, keeping the default state quiet.

### Chat Panel
A bottom-right floating panel pattern (toggle button + slide-up panel), common in support-widget UIs, repurposed here for the finance assistant. Messages are bubble-style with clear sender differentiation (accent-filled for user, neutral surface for AI), and a `.loading` state uses muted italic text rather than a spinner to keep it lightweight.
