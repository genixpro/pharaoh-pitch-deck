# Pharaoh — Investment Pitch Deck

39-slide Reveal.js presentation for the WELL Health pitch.
$1M · $5M valuation · Investor + Customer #1.

---

## Quick start

```bash
# From the repo root
cd pitch/pharaoh-pitch

# Serve locally (port 8788 — required for font loading)
python3 -m http.server 8788

# Open in browser
open http://127.0.0.1:8788
```

Navigate with arrow keys. `F` for fullscreen. `ESC` for slide overview.

---

## Regenerate mockup screenshots

If you edit any of the mockup HTML pages under `mockups/`, re-capture:

```bash
cd mockups
node capture.mjs
```

Outputs go to `assets/screenshots/mockups/`. The deck references these directly, so refresh the browser to see changes.

---

## Smoke-test key slides

```bash
cd mockups
node verify-deck.mjs
```

Captures 13 key slides as PNGs into `assets/screenshots/verify/` with the server running on :8788. Review them visually.

---

## Export to PDF

Reveal.js prints cleanly via the browser's built-in PDF export:

1. Start the server: `python3 -m http.server 8788`
2. Open: `http://127.0.0.1:8788?print-pdf`
3. **File → Print → Save as PDF**
   - Paper: Custom 16×10 in (or A4 landscape)
   - Margins: None
   - Background graphics: **On**
4. Save as `pharaoh-pitch-2026.pdf`

> Tip: Use Chrome or Edge for best fidelity. Safari omits some gradients.

---

## File layout

```
pharaoh-pitch/
├── index.html                  # All 39 slides
├── styles/
│   └── pharaoh-deck.css        # Custom Pharaoh theme
├── assets/
│   ├── logo.svg
│   └── screenshots/
│       ├── mockups/            # Captured from mockups/*.html
│       └── real/               # Real product screenshots
└── mockups/
    ├── pharaoh-app.css         # Shared mockup design system
    ├── endpoint-agent.html     # Endpoint detail view
    ├── backend-agent.html      # Backend Agent session
    ├── coding-agent.html       # Coding Agent IaC PR
    ├── end-user-agent.html     # End-User Agent chat
    ├── master-agent.html       # Master Agent fleet migration
    ├── android-app.html        # Android Field App
    ├── capture.mjs             # Playwright screenshot capture
    └── verify-deck.mjs         # Deck smoke-test
```

---

## Slide map

| # | Section | Slide |
|---|---------|-------|
| 1 | Title | Pharaoh — Self-healing IT, at fleet scale |
| 2–4 | Opening Act | Personal story, what changed, the moment |
| 5–10 | Vision | What Pharaoh is, product surfaces |
| 11 | The Gap | Competitor matrix |
| 12–15 | How It Works | Architecture + self-healing loop |
| 16 | Security | Rings of defense |
| 17–20 | Benefits + Market | ROI, TAM ($44.7B combined) |
| 21–24 | The Ask | $1M · $5M valuation · terms |
| 25 | Closing | "Let's build together" |
| 26 | Appendix A divider | Detailed product walkthrough |
| 27–38 | Appendix A | Endpoint, Backend, Coding, End-User, Master agents + more |
| 39 | End card | — |
