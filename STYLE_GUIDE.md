# Pension Forecaster — Style Guide

> For the shared design system, typography, tokens, theme panel HTML, and mini-core integration see:
> **`Mini/Template/mini-core-StyleTemplate.md`**

---

## App identity

| Property | Value |
|---|---|
| Default theme | `metallic` |
| storageKey | `pension-forecaster-theme-v1` |
| backgroundUrl | `./background.jpeg` |
| Files | `index.html`, `app.js`, `styles.css`, `mini-core.css`, `mini-core.js` |

---

## MiniTheme.init call

```js
MiniTheme.init({
  storageKey:    THEME_STORAGE_KEY,           // "pension-forecaster-theme-v1"
  onRender:      () => { syncOptimiserTheme(); render(); },
  defaultTheme:  "metallic",
  backgroundUrl: "./background.jpeg",
});
```

`onRender` fires `syncOptimiserTheme()` first so the embedded optimiser iframe always matches before the main chart redraws.

---

## Optimiser iframe theme sync

The app embeds an optimiser tool in an iframe (`optimizer-embedded.html`). On every theme change, `syncOptimiserTheme()` posts the full token set to the iframe:

```js
function syncOptimiserTheme() {
  const frame = document.getElementById('optimiser-frame');
  if (!frame?.contentWindow) return;
  frame.contentWindow.postMessage(getOptimiserThemePayload(), '*');
}
```

`getOptimiserThemePayload()` reads `OPTIMISER_THEME_VARS` (a fixed list of CSS var names) from `document.documentElement` and returns a plain object. The iframe listens for `message` events and applies them directly.

---

## App-specific CSS (styles.css)

`styles.css` loads after `mini-core.css` and contains only app-specific overrides. Key selectors:

- `.income-vslider` — vertical range slider for income inputs
- `.special-events-panel` — collapsible event timeline
- `.optimiser-section` — iframe wrapper with sizing
- `.sticky-column` — pinned first column in projection table
- `body[data-app-view="optimiser"]` — hides forecaster UI when optimiser is shown

Per-theme overrides in `styles.css` use `html[data-theme="X"]` selectors. Only the `original` theme needs explicit overrides (light background, serif font).

---

## App views

Toggled via `setAppView("forecaster" | "optimiser")` which sets `body.dataset.appView` and shows/hides sections via CSS.

---

## Print styles

`@media print` in `styles.css`: white background, hides controls and the optimiser section, flattens the table.
