# Product

## Register

moneycat

## Users
Individuals (Vietnamese-speaking) who want a fast, private, no-signup-friction way to track personal spending — students, young professionals, and budget-conscious users who find bank apps or spreadsheets too slow or too complex for daily logging.

## Product Purpose
To provide a lightweight, local-first expense tracker that combines manual transaction logging, automatic category suggestions via AI, a monthly budget tracker with overspend alerts, and a conversational AI assistant that can answer questions about a user's own spending history.

## Brand Personality
Friendly, fast, and a little playful (cat mascot, emoji-led categories) while staying precise and trustworthy about numbers. Approachable finance, not corporate banking.

## Anti-references
Heavy multi-page banking dashboards, dense spreadsheet-style tables with no visual hierarchy, intrusive onboarding flows, AI features that feel bolted-on rather than integrated into the core logging flow.

## Core Features
- **Authentication (local, client-side)**: simple username/password register & login, scoped per-browser via localStorage; no backend account system.
- **Expense Logging**: add/edit/delete transactions with amount, date, category, and a free-text note.
- **AI Auto-Categorize**: as the user types a note, an LLM (via OpenRouter) suggests the most likely category from a fixed list; the user applies it with one tap.
- **AI Chat Assistant ("MoneyCat AI")**: a floating chat panel that can answer natural-language questions about the user's own logged expenses (e.g. "how much did I spend on food this month?").
- **Monthly Budget**: a settable budget ceiling with a live progress bar (green → yellow → red) and an overspend alert banner.
- **Visual Breakdown**: a category pie chart (Chart.js) plus per-category summary chips, kept in sync with the transaction list.
- **Search & Table**: a searchable, sortable transaction table with inline edit/delete actions.
- **Light/Dark Theme**: full token-based theme toggle, persisted per device.

## Design Principles
- **Local-First & Private**: all data lives in the browser's localStorage; nothing is logged or sent anywhere except the user's own LLM API calls.
- **Low-Friction Logging**: adding an expense should take seconds — minimal required fields, AI-assisted categorization to remove a decision step.
- **Calm Numbers**: financial data should never feel alarming by default; color (red/yellow) is reserved strictly for states that need attention (overspend, errors).
- **AI as Assistant, Not Gatekeeper**: AI suggestions (category, chat answers) are always optional and reversible — the user can ignore, edit, or override any AI output.
