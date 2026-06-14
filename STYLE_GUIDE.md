# Rob's Mini-App Style Guide
# Version 2.2 — updated from Pension Forecaster v4.3
#
# Purpose: apply this design system to new vanilla-JS SPAs so they share
# the same look, themes, colour wheel, and interaction patterns.
# ─────────────────────────────────────────────────────────────────────────────

## 1. FONTS

Primary: "Inter", "SF Pro Display", system-ui, sans-serif
Classic theme only: Georgia, "Times New Roman", serif
Monospace (share links etc.): "SF Mono", "Fira Code", monospace

h1: clamp(2.4rem, 5vw, 4.2rem), weight 700, letter-spacing -0.02em, line-height 0.94
h2: 1.05rem, weight 600, letter-spacing 0.01em
Labels / small caps: 0.72rem, weight 700, text-transform uppercase, letter-spacing 0.08–0.12em
Body: 0.88rem (field labels, table cells)
Muted notes: 0.84rem


## 2. CSS CUSTOM PROPERTIES (design tokens)

### 2a. :root defaults (Dark theme — applied by CSS, overridden by JS inline style)

```css
:root {
  --bg:            #07111d;
  --bg-2:          #1e2840;
  --bg-image:      url('./background.jpeg'); /* photo shown via body::before */
  --bg-opacity:    0.34;                    /* photo layer opacity; 0 = hidden */
  --panel:         rgba(9, 18, 33, 0.48);
  --panel-strong:  rgba(8, 12, 22, 0.85);
  --panel-a:       0.48;  /* panel alpha — driven by transparency slider */
  --panel-b:       0.38;  /* card-2 / slightly more transparent variant */
  --panel-c:       0.28;  /* table-header / most transparent variant */
  --table-bg:      rgba(9, 18, 33, 0.28); /* set by applyPanelTransparency() */
  --card:          rgba(12, 16, 30, 0.48);
  --card-2:        rgba(8, 12, 22, 0.38);
  --card-warn:     rgba(30, 14, 14, 0.96);
  --card-warn-2:   rgba(20, 10, 10, 0.9);
  --card-success:  rgba(10, 30, 20, 0.96);
  --card-success-2:rgba(8, 22, 16, 0.9);
  --line:          rgba(99, 179, 237, 0.13);
  --line-strong:   rgba(99, 179, 237, 0.24);
  --text:          #e8edf8;
  --muted:         #7a8fba;
  --accent:        #00d4b8;           /* teal */
  --accent-2:      #7c3aed;           /* violet */
  --accent-glow:   rgba(0, 212, 184, 0.25);
  --control-popover-bg: #08101c;       /* opaque dropdown/popover surface */
  --control-range-track-bg: #121a2b;   /* opaque vertical slider track */
  --violet-glow:   rgba(124, 58, 237, 0.2);
  --danger:        #f87171;
  --success:       #34d399;
  --shadow:
    0 2px 0px rgba(255,255,255,0.04),
    0 8px 24px rgba(0,0,0,0.5),
    0 24px 64px rgba(0,0,0,0.45),
    0 0 0 1px rgba(0,0,0,0.35);
  --glow:          0 0 30px rgba(0, 212, 184, 0.12);
  --radius:        20px;
  --input-bg:      rgba(255,255,255,0.04);
  --button-text:   #0b0f1a;
  --accent-dark:   #00a896;
}
```

### 2b. Token meanings

| Token           | Role |
|-----------------|------|
| --bg            | Page background colour |
| --panel         | Frosted-glass panel background |
| --panel-strong  | Stronger panel background; can still be affected by transparency controls |
| --theme-panel-bg | Theme panel opaque background (ignores transparency slider — set by applyTheme) |
| --control-popover-bg | Opaque dropdown/popover background for menus and slider popups |
| --control-range-track-bg | Opaque vertical slider track background |
| --card          | Summary card gradient stop A |
| --card-2        | Summary card gradient stop B |
| --card-warn     | Warning card gradient (red tint) |
| --card-success  | Success card gradient (green tint) |
| --line          | Subtle border / divider |
| --line-strong   | More visible border |
| --text          | Primary text |
| --muted         | Secondary / label text |
| --accent        | Brand colour (inputs focus, badges, links) |
| --accent-2      | Secondary brand (violet / amber) |
| --accent-glow   | Glow shadow derived from --accent |
| --danger        | Error / negative value |
| --success       | Positive value |
| --shadow        | Unified box-shadow for panels + buttons |
| --radius        | Panel border-radius |
| --input-bg      | Input field background |
| --button-text   | Text on filled primary buttons |


## 3. THEME SYSTEM (JS — copy verbatim, update STORAGE_KEY)

### 3a. Five themes

- **dark**      — default; deep navy, teal accent, background photo at 34 % opacity
- **bright**    — dark amber/fire; amber accent + teal secondary, photo at 44 % opacity; mirrors HealthViewer Original
- **original**  — warm parchment, serif font, teal/amber accent; photo hidden, CSS parchment gradient
- **metallic**  — charcoal + brushed steel, steel-blue accent, photo at 34 % opacity
- **custom**    — four hue sliders (bg accent, tile, canvas, text)

### 3b. THEME_PRESETS object

```js
const THEME_PRESETS = {
  bright: {
    "--bg":           "#20140d",
    "--panel":        "rgba(54, 34, 19, 0.42)",
    "--panel-strong": "rgba(62, 40, 22, 0.72)",
    "--card":         "rgba(80, 50, 28, 0.65)",
    "--card-2":       "rgba(60, 36, 18, 0.60)",
    "--card-warn":    "rgba(80, 30, 20, 0.70)",
    "--card-warn-2":  "rgba(62, 22, 14, 0.65)",
    "--card-success": "rgba(30, 60, 40, 0.70)",
    "--card-success-2":"rgba(20, 46, 30, 0.65)",
    "--input-bg":     "rgba(255, 220, 160, 0.08)",
    "--line":         "rgba(255, 216, 160, 0.14)",
    "--line-strong":  "rgba(255, 220, 168, 0.30)",
    "--text":         "#fff7e8",
    "--muted":        "#d8bb8d",
    "--accent":       "#f4b35e",
    "--accent-2":     "#55d6a5",
    "--accent-glow":  "rgba(244, 179, 94, 0.28)",
    "--control-popover-bg": "#2a1a0a",
    "--control-range-track-bg": "#3a2510",
    "--button-text":  "#2a1200",
    "--danger":       "#ff7b7b",
    "--success":      "#55d6a5",
    "--shadow":       "0 2px 0px rgba(255,220,160,0.06), 0 8px 24px rgba(0,0,0,0.55), 0 24px 64px rgba(0,0,0,0.50), 0 0 0 1px rgba(0,0,0,0.40)",
    "--radius":       "20px",
  },
  original: {
    "--bg":           "#f4efe6",
    "--panel":        "rgba(255, 252, 247, 0.92)",
    "--panel-strong": "#fffdf9",
    "--card":         "rgba(255, 252, 247, 0.97)",
    "--card-2":       "rgba(255, 246, 232, 0.93)",
    "--card-warn":    "rgba(255, 240, 240, 0.98)",
    "--card-warn-2":  "rgba(255, 226, 226, 0.94)",
    "--card-success": "rgba(240, 255, 248, 0.98)",
    "--card-success-2":"rgba(220, 252, 236, 0.94)",
    "--input-bg":     "rgba(255, 255, 255, 0.72)",
    "--line":         "rgba(66, 50, 28, 0.14)",
    "--line-strong":  "rgba(66, 50, 28, 0.26)",
    "--text":         "#26190c",
    "--muted":        "#6c5b48",
    "--accent":       "#0f766e",
    "--accent-2":     "#b45309",
    "--control-popover-bg": "#fffdf9",
    "--control-range-track-bg": "#f3eadc",
    "--danger":       "#b42318",
    "--success":      "#15803d",
    "--shadow":       "0 20px 50px rgba(56,35,7,0.12), 0 4px 12px rgba(56,35,7,0.08)",
    "--radius":       "22px",
  },
  dark: {
    "--bg":           "#1a2236",
    "--panel":        "rgba(10, 14, 26, 0.88)",
    "--panel-strong": "rgba(8, 12, 22, 0.97)",
    "--card":         "rgba(12, 16, 30, 0.97)",
    "--card-2":       "rgba(8, 12, 22, 0.95)",
    "--card-warn":    "rgba(30, 14, 14, 0.96)",
    "--card-warn-2":  "rgba(20, 10, 10, 0.9)",
    "--card-success": "rgba(10, 30, 20, 0.96)",
    "--card-success-2":"rgba(8, 22, 16, 0.9)",
    "--input-bg":     "rgba(255, 255, 255, 0.04)",
    "--line":         "rgba(99, 179, 237, 0.13)",
    "--line-strong":  "rgba(99, 179, 237, 0.24)",
    "--text":         "#e8edf8",
    "--muted":        "#7a8fba",
    "--accent":       "#00d4b8",
    "--accent-2":     "#7c3aed",
    "--accent-glow":  "rgba(0, 212, 184, 0.28)",
    "--control-popover-bg": "#08101c",
    "--control-range-track-bg": "#121a2b",
    "--button-text":  "#0b0f1a",
    "--danger":       "#f87171",
    "--success":      "#34d399",
    "--shadow":       "0 2px 0px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.35)",
    "--radius":       "20px",
  },
  metallic: {
    "--bg":           "#131416",
    "--panel":        "rgba(58, 62, 70, 0.92)",
    "--panel-strong": "rgba(38, 40, 46, 0.98)",
    "--card":         "rgba(72, 76, 86, 0.97)",
    "--card-2":       "rgba(48, 51, 58, 0.95)",
    "--card-warn":    "rgba(70, 48, 44, 0.97)",
    "--card-warn-2":  "rgba(52, 34, 30, 0.95)",
    "--card-success": "rgba(44, 62, 52, 0.97)",
    "--card-success-2":"rgba(32, 48, 38, 0.95)",
    "--input-bg":     "rgba(22, 24, 28, 0.75)",
    "--line":         "rgba(210, 218, 235, 0.16)",
    "--line-strong":  "rgba(220, 228, 245, 0.28)",
    "--text":         "#dde2ee",
    "--muted":        "#8890a4",
    "--accent":       "#7ab8d8",
    "--accent-2":     "#c8a060",
    "--accent-glow":  "rgba(122, 184, 216, 0.28)",
    "--control-popover-bg": "#26282e",
    "--control-range-track-bg": "#181a1e",
    "--button-text":  "#0e1012",
    "--danger":       "#e07878",
    "--success":      "#68c898",
    "--shadow":       "0 2px 0px rgba(240,245,255,0.1), 0 8px 24px rgba(0,0,0,0.65), 0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.5)",
    "--radius":       "20px",
  },
};
```

### 3c. Custom theme builder (four hue sliders → CSS vars)

```js
// Default hue values for custom theme
let customBgHue     = 175;  // accent hue (teal-ish)
let customTileHue   = 220;  // panel/card hue (blue-ish)
let customCanvasHue = 220;  // body background hue
let customTextHue   = 220;  // text hue

function buildCustomVars(bgHue, tileHue, canvasHue, textHue) {
  const cardL = 8, bgL = 16, textL = 90, textS = 20;
  return {
    "--bg":           `hsl(${canvasHue}, 30%, ${bgL}%)`,
    "--panel":        `hsla(${tileHue}, 42%, ${cardL - 1}%, 0.88)`,
    "--panel-strong": `hsla(${tileHue}, 42%, ${Math.max(2, cardL - 3)}%, 0.97)`,
    "--card":         `hsla(${tileHue}, 38%, ${cardL}%, 0.97)`,
    "--card-2":       `hsla(${tileHue}, 38%, ${Math.max(2, cardL - 2)}%, 0.95)`,
    "--card-warn":    `hsla(0, 45%, ${cardL}%, 0.96)`,
    "--card-warn-2":  `hsla(0, 45%, ${Math.max(2, cardL - 2)}%, 0.9)`,
    "--card-success": `hsla(150, 45%, ${cardL}%, 0.96)`,
    "--card-success-2":`hsla(150, 45%, ${Math.max(2, cardL - 2)}%, 0.9)`,
    "--input-bg":     `hsla(${tileHue}, 30%, 18%, 0.6)`,
    "--line":         `hsla(${bgHue}, 60%, 65%, 0.13)`,
    "--line-strong":  `hsla(${bgHue}, 60%, 65%, 0.26)`,
    "--text":         `hsl(${textHue}, ${textS}%, ${textL}%)`,
    "--muted":        `hsl(${textHue}, 16%, 58%)`,
    "--accent":       `hsl(${bgHue}, 80%, 55%)`,
    "--accent-2":     `hsl(${(bgHue + 130) % 360}, 68%, 58%)`,
    "--accent-glow":  `hsla(${bgHue}, 80%, 55%, 0.3)`,
    "--control-popover-bg": `hsl(${tileHue}, 42%, ${Math.max(3, cardL - 2)}%)`,
    "--control-range-track-bg": `hsl(${tileHue}, 38%, ${cardL + 8}%)`,
    "--button-text":  `hsl(${canvasHue}, 30%, 10%)`,
    "--danger":       "#f87171",
    "--success":      "#34d399",
    "--shadow":       "0 2px 0px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.35)",
    "--radius":       "20px",
  };
}

function buildCustomBackground(bgHue, tileHue) {
  const h2 = (bgHue + 130) % 360;
  const h3 = (bgHue + 200) % 360;
  return [
    `radial-gradient(ellipse 80% 50% at 20% -10%, hsla(${bgHue},80%,55%,0.28) 0%, transparent 60%)`,
    `radial-gradient(ellipse 60% 40% at 85% 10%, hsla(${h2},65%,58%,0.32) 0%, transparent 55%)`,
    `radial-gradient(ellipse 50% 60% at 50% 100%, hsla(${h3},70%,50%,0.22) 0%, transparent 60%)`,
    `radial-gradient(ellipse 30% 30% at 10% 80%, hsla(${bgHue},80%,55%,0.14) 0%, transparent 50%)`,
  ].join(", ");
}
```

### 3d. applyTheme() function

```js
// Union of all var names so switching themes clears every previously set var
const ALL_THEME_VARS = [...new Set(Object.values(THEME_PRESETS).flatMap(Object.keys))];

function applyTheme(theme, bgHue, tileHue, canvasHue, textHue) {
  const root = document.documentElement;

  // 1. Clear all inline vars set by previous theme
  ALL_THEME_VARS.forEach((v) => root.style.removeProperty(v));

  // 2. Apply new vars
  const vars = theme === "custom"
    ? buildCustomVars(bgHue, tileHue, canvasHue, textHue)
    : THEME_PRESETS[theme] || THEME_PRESETS.dark;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

  // 3. Body background (inline style so it overrides the :root CSS rule)
  if (theme === "original") {
    document.body.style.backgroundImage = [
      "radial-gradient(circle at top left, rgba(15,118,110,0.12), transparent 28%)",
      "radial-gradient(circle at top right, rgba(180,83,9,0.16), transparent 24%)",
      "linear-gradient(180deg, #fbf7f0 0%, #f4efe6 48%, #efe4d1 100%)",
    ].join(", ");
    document.body.style.backgroundColor = "#f4efe6";
  } else if (theme === "metallic") {
    document.body.style.backgroundImage = [
      "radial-gradient(ellipse 70% 45% at 20% 10%, rgba(200,215,240,0.055) 0%, transparent 60%)",
      "radial-gradient(ellipse 55% 40% at 80% 85%, rgba(180,195,220,0.04) 0%, transparent 55%)",
      "linear-gradient(180deg, #1a1c20 0%, #131416 45%, #0e1012 100%)",
    ].join(", ");
    document.body.style.backgroundColor = "#131416";
  } else if (theme === "custom") {
    document.body.style.backgroundImage = buildCustomBackground(bgHue, tileHue);
    document.body.style.backgroundColor = `hsl(${canvasHue}, 30%, 16%)`;
  } else {
    // dark: let the CSS :root gradient rule take over
    document.body.style.backgroundImage = "";
    document.body.style.backgroundColor = "";
  }

  // 4. data-theme drives CSS-only overrides (font-family, h1 colour, table colours)
  root.setAttribute("data-theme", theme);

  // 5. Sync theme chip active states
  document.querySelectorAll(".theme-chip").forEach((btn) => {
    btn.classList.toggle("theme-chip-active", btn.dataset.theme === theme);
  });
}
```

### 3e. Persistence

Also persist `bgMode` and `transparency` alongside hue sliders:

```js
const THEME_STORAGE_KEY = "MY-APP-theme-v1"; // change MY-APP per project

function saveThemePrefs() {
  const bgModeEl      = document.getElementById("bg-mode");
  const transparencyEl = document.getElementById("panel-transparency");
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
    theme: activeTheme,
    bgHue: customBgHue, tileHue: customTileHue,
    canvasHue: customCanvasHue, textHue: customTextHue,
    bgMode:       bgModeEl       ? bgModeEl.value       : "photo",
    transparency: transparencyEl ? transparencyEl.value  : "52",
  }));
}

function loadThemePrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || "{}");
    activeTheme    = ["original","bright","dark","metallic","custom"].includes(saved.theme) ? saved.theme : "dark";
    customBgHue    = Number.isFinite(saved.bgHue)    ? saved.bgHue    : 175;
    customTileHue  = Number.isFinite(saved.tileHue)  ? saved.tileHue  : 220;
    customCanvasHue= Number.isFinite(saved.canvasHue)? saved.canvasHue: 220;
    customTextHue  = Number.isFinite(saved.textHue)  ? saved.textHue  : 220;
    const bgModeEl      = document.getElementById("bg-mode");
    const transparencyEl = document.getElementById("panel-transparency");
    if (bgModeEl && saved.bgMode)           bgModeEl.value       = saved.bgMode;
    if (transparencyEl && saved.transparency) transparencyEl.value = saved.transparency;
  } catch { activeTheme = "dark"; }
}
```

### 3g. Panel glass transparency system

All panel/card surfaces respond to a transparency slider (20–100 %). The slider value is the
**clearness** percentage: 52 % clear → alpha 0.48.

```js
function getPanelBaseRgb() {
  // Returns [r, g, b] of the darkest tint for this theme's panels
  if (activeTheme === "metallic") return [52, 62, 82];
  if (activeTheme === "original") return [255, 252, 247]; // light cream
  if (activeTheme === "bright")   return [54, 34, 19];
  return [9, 18, 33]; // dark + custom
}

function getCardBaseRgbs() {
  // Returns base RGB for each card variant so transparency applies consistently
  if (activeTheme === "metallic") return {
    card: [72, 76, 86], card2: [48, 51, 58],
    warn: [70, 48, 44], warn2: [52, 34, 30],
    success: [44, 62, 52], success2: [32, 48, 38],
  };
  if (activeTheme === "bright") return {
    card: [80, 50, 28], card2: [60, 36, 18],
    warn: [80, 30, 20], warn2: [62, 22, 14],
    success: [30, 60, 40], success2: [20, 46, 30],
  };
  if (activeTheme === "original") return {
    card: [255, 252, 247], card2: [255, 246, 232],
    warn: [255, 240, 240], warn2: [255, 226, 226],
    success: [240, 255, 248], success2: [220, 252, 236],
  };
  return { // dark + custom
    card: [12, 16, 30], card2: [8, 12, 22],
    warn: [30, 14, 14], warn2: [20, 10, 10],
    success: [10, 30, 20], success2: [8, 22, 16],
  };
}

function applyPanelTransparency() {
  const clear = parseInt(document.getElementById("panel-transparency").value);
  const alpha = Math.max(0.02, Math.min(0.95, 1 - clear / 100));
  const a = alpha.toFixed(2);
  const b = Math.max(0.02, alpha - 0.05).toFixed(2);
  const c = Math.max(0.02, alpha - 0.10).toFixed(2);
  const [r, g, bl] = getPanelBaseRgb();
  const cards = getCardBaseRgbs();
  const cv = (rgb, al) => `rgba(${rgb.join(",")},${al})`;

  document.body.style.setProperty("--panel-a", a);
  document.body.style.setProperty("--panel-b", b);
  document.body.style.setProperty("--panel-c", c);
  document.body.style.setProperty("--panel",        `rgba(${r},${g},${bl},${a})`);
  document.body.style.setProperty("--panel-strong",  `rgba(${r},${g},${bl},${Math.min(0.97, alpha + 0.2).toFixed(2)})`);
  document.body.style.setProperty("--card",           cv(cards.card,     a));
  document.body.style.setProperty("--card-2",         cv(cards.card2,    b));
  document.body.style.setProperty("--card-warn",      cv(cards.warn,     a));
  document.body.style.setProperty("--card-warn-2",    cv(cards.warn2,    b));
  document.body.style.setProperty("--card-success",   cv(cards.success,  a));
  document.body.style.setProperty("--card-success-2", cv(cards.success2, b));
  document.body.style.setProperty("--table-bg",       `rgba(${r},${g},${bl},${c})`);
  document.body.style.setProperty("--control-popover-bg",     `rgb(${r},${g},${bl})`);
  document.body.style.setProperty("--control-range-track-bg",  `rgba(${r},${g},${bl},0.92)`);
}
```

CSS rules that have hardcoded `rgba` backgrounds (e.g. metallic `.panel`, table headers, sticky columns)
must use `var(--panel-a)` / `var(--panel-b)` / `var(--panel-c)` instead of literal alpha values so
the slider takes effect. The base `table` rule should use `var(--table-bg, fallback)`.

**Exception — opaque control popovers:** dropdown menus, theme panels, and vertical slider popups must not
reuse transparent `--panel`/`--panel-strong` values. Use `--control-popover-bg` for the container and
`--control-range-track-bg` for vertical slider tracks so controls stay legible at all transparency settings.

**Stacked opacity warning:** a transparent child surface over a transparent parent surface will not match
the same child surface placed directly over the page background. The alphas compound visually, making the
child look darker or more opaque. If two tiles must match exactly, put them on the same backing layer or make
the parent wrapper transparent. This mattered when embedding optimiser tiles inside a results panel: matching
the tile CSS was not enough until the parent panel background was removed.

### 3h. Background photo system

The background photo sits on `body::before` (position: fixed, full cover):

```css
body::before {
  content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: var(--bg-image);
  background-size: cover; background-position: center;
  opacity: var(--bg-opacity);
}
```

`applyBackgroundMode()` updates `--bg-image` and `--bg-opacity` on `body`:
- **Photo** — default JPEG at ~34 % (44 % for Bright)
- **Soft photo** — 18 %
- **Vivid photo** — 55 %
- **Plain colour** — image: none, opacity: 0

Classic (`original`) theme forces `body::before { opacity: 0 }` via a CSS data-theme override
and uses `body::after` for its warm parchment gradient instead.

### 3f. Double-render pattern (IMPORTANT)

Theme functions use `let`/`const` (not hoisted). `render()` is typically called before
theme init. To ensure charts use the correct colours on first load:

```js
// At end of script, after all declarations:
loadThemePrefs();
bgHueSlider.value     = customBgHue;
tileHueSlider.value   = customTileHue;
canvasHueSlider.value = customCanvasHue;
textHueSlider.value   = customTextHue;
applyTheme(activeTheme, customBgHue, customTileHue, customCanvasHue, customTextHue);
render(); // second render — charts now read the correct CSS vars
```

Theme chip click handler:
```js
activeTheme = btn.dataset.theme;
applyTheme(activeTheme, customBgHue, customTileHue, customCanvasHue, customTextHue);
saveThemePrefs();
render(); // always re-render after theme change so canvas charts recolour
```

Hue slider input handler (same pattern for all four sliders):
```js
customBgHue = Number(bgHueSlider.value);
syncSwatches();
applyTheme("custom", customBgHue, customTileHue, customCanvasHue, customTextHue);
saveThemePrefs();
render();
```


## 4. PAGE BACKGROUNDS

### Dark (CSS rule, no inline style)
```css
body {
  background-color: var(--bg);
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0,212,184,0.28) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 85% 10%,  rgba(124,58,237,0.32) 0%, transparent 55%),
    radial-gradient(ellipse 50% 60% at 50% 100%, rgba(37,99,235,0.22)  0%, transparent 60%),
    radial-gradient(ellipse 30% 30% at 10% 80%,  rgba(0,212,184,0.14)  0%, transparent 50%);
}
```

Subtle grid overlay (body::before, position: fixed):
```css
background-image:
  linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
background-size: 48px 48px;
```

Floating glow orb (body::after, position: fixed, animation: drift 18s):
```css
background: radial-gradient(circle, rgba(0,212,184,0.06) 0%, transparent 65%);
```
```css
@keyframes drift {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(8%,6%) scale(1.08); }
}
```

### Panel top-edge highlight (panel::before)
```css
content: "";
position: absolute; top: 0; left: 0; right: 0; height: 1px;
background: linear-gradient(90deg, transparent, rgba(0,212,184,0.3), transparent);
```


## 5. COMPONENTS — CSS SNIPPETS

### 5a. Panel
```css
.panel {
  background: var(--panel);
  backdrop-filter: blur(var(--panel-blur));
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255,255,255,0.08);
  padding: 18px;
  position: relative;
  overflow: hidden;
}
```

### 5b. Summary card
```css
.summary-card {
  background: linear-gradient(160deg, var(--card), var(--card-2));
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.summary-card:hover {
  transform: translateY(-3px);
  border-color: var(--line-strong);
  box-shadow: var(--shadow), 0 0 28px rgba(0,212,184,0.1);
}
/* top rainbow shimmer line */
.summary-card::before {
  content: "";
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg,
    transparent, rgba(0,212,184,0.4), rgba(124,58,237,0.4), transparent);
}
/* bottom-right glow orb */
.summary-card::after {
  content: "";
  position: absolute; bottom: -40px; right: -40px;
  width: 100px; height: 100px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,212,184,0.08), transparent 70%);
  pointer-events: none;
}
/* Warning / success variants — swap border-color and gradient colours */
.summary-card-warning { background: linear-gradient(135deg, var(--card-warn), var(--card-warn-2)); border-color: rgba(248,113,113,0.3); }
.summary-card-success  { background: linear-gradient(135deg, var(--card-success), var(--card-success-2)); border-color: rgba(52,211,153,0.3); }
```

### 5c. Primary button
```css
.button {
  border: 0; border-radius: 999px; padding: 11px 20px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark, #00a896));
  color: var(--button-text, #0b0f1a);
  font-weight: 700; font-size: 0.9rem; cursor: pointer;
  box-shadow: 0 0 20px var(--accent-glow, rgba(0,212,184,0.3)), var(--shadow);
  transition: box-shadow 0.2s, transform 0.15s;
}
.button:hover {
  box-shadow: 0 0 32px var(--accent-glow, rgba(0,212,184,0.5)), var(--shadow);
  transform: translateY(-1px);
}
```

### 5d. Secondary button
```css
.button.secondary {
  background: var(--panel-strong);
  color: var(--text);
  border: 1px solid var(--line-strong);
  font-weight: 500;
  box-shadow: var(--shadow);
}
.button.secondary:hover {
  border-color: var(--accent);
  box-shadow: 0 0 16px var(--accent-glow, rgba(0,212,184,0.12)), var(--shadow);
  transform: translateY(-1px);
}
```

### 5e. Input / Select
```css
input:not([type="checkbox"]), select {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--input-bg, rgba(255,255,255,0.04));
  padding: 9px 11px;
  color: var(--text);
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
input:focus, select:focus {
  outline: none;
  border-color: rgba(0,212,184,0.5);
  background: rgba(0,212,184,0.06);
  box-shadow: 0 0 0 3px rgba(0,212,184,0.1);
}
```

### 5f. Version badge

Clicking the badge shows the last-modified date of the current plan for ~2.5 s, then reverts
to the version string. Store the original text in `data-version` on first click.

```css
.version-badge {
  padding: 8px 16px; border-radius: 999px;
  background: rgba(0,212,184,0.1);
  border: 1px solid rgba(0,212,184,0.35);
  color: var(--accent);
  font-size: 0.82rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.version-badge:hover {
  background: rgba(0,212,184,0.18);
  box-shadow: 0 0 18px rgba(0,212,184,0.25);
}
```

Click handler pattern:
```js
let versionBadgeTimeout = null;
function showVersionChangeDate() {
  const versionText = versionBadge.dataset.version || versionBadge.textContent;
  if (!versionBadge.dataset.version) versionBadge.dataset.version = versionText;
  // format the last-saved timestamp from state here
  versionBadge.textContent = `Changed ${formatted}`;
  clearTimeout(versionBadgeTimeout);
  versionBadgeTimeout = setTimeout(() => {
    versionBadge.textContent = versionBadge.dataset.version;
  }, 2500);
}
versionBadge.addEventListener("click", showVersionChangeDate);
```

### 5g. h1 gradient text (dark theme)
```css
h1 {
  background: linear-gradient(135deg, #e8edf8 0%, var(--accent) 60%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 5h. Empty-state placeholder (dashed box)
```css
.empty-message {
  padding: 20px;
  border: 1px dashed var(--line);
  border-radius: 12px;
  color: var(--muted);
  text-align: center;
  font-size: 0.88rem;
  background: rgba(255,255,255,0.02);
}
```

### 5i. Dialog / modal backdrop
```css
.dialog-backdrop {
  position: fixed; inset: 0; z-index: 20;
  display: grid; place-items: center; padding: 24px;
  background: rgba(7,10,20,0.72);
  backdrop-filter: blur(8px);
}
.dialog {
  background: rgba(14,20,36,0.98);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,184,0.08);
  padding: 22px;
}
@keyframes panel-drop {
  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
/* Apply: animation: panel-drop 0.18s cubic-bezier(0.34,1.3,0.64,1); */
```


## 6. THEME SWITCHER UI

### 6a. Colour-sphere button (opens theme panel)

24 px sphere with three-layer gloss (top-left highlight, bottom-right shadow, mid gloss) + full-spectrum conic rainbow. Spins 180° on hover with a slow 0.6 s ease — no scale, no glyph.

**Placement:** sits immediately after the version badge in the header, right-aligned. Keep it at 24 px — it sits neatly beside the badge without dominating the header.

HTML order (within `version-badge-group`):
```html
<button id="version-badge" class="version-badge" …>Version 4.3</button>
<button id="theme-settings-button" class="theme-settings-button" …></button>
```

```css
.theme-settings-button {
  width: 24px; height: 24px;
  display: inline-grid; place-items: center;
  border-radius: 999px; border: none;
  background:
    radial-gradient(circle at 35% 32%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 55%),
    radial-gradient(circle at 68% 72%, rgba(0,0,0,0.28)       0%, rgba(0,0,0,0)       55%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 48%),
    conic-gradient(hsl(0,100%,60%), hsl(60,100%,60%), hsl(120,100%,60%),
                   hsl(180,100%,60%), hsl(240,100%,60%), hsl(300,100%,60%), hsl(360,100%,60%));
  box-shadow: 0 1px 4px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.4);
  cursor: pointer;
  transition: transform 0.6s, box-shadow 0.2s;
  flex-shrink: 0;
}
.theme-settings-button:hover { transform: rotate(180deg); }
```

### 6b. Theme panel (dropdown)

Use `.open` class to show/hide (not the `hidden` attribute). Width 310 px with scroll for tall content.

```css
.theme-panel {
  display: none;
  position: absolute; top: calc(100% + 8px); right: 0; z-index: 30;
  width: 310px; max-height: 80vh; overflow-y: auto;
  background: var(--theme-panel-bg, var(--control-popover-bg, #08101c)); /* opaque */
  border: 1px solid var(--line-strong);
  border-radius: 14px; padding: 16px;
  backdrop-filter: none;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 30px rgba(0,212,184,0.06);
}
.theme-panel.open {
  display: block;
  animation: panel-drop 0.18s cubic-bezier(0.34,1.3,0.64,1);
}
```

`--theme-panel-bg` is set once per theme in `applyTheme()` as an opaque RGB value. It is **never** written as a translucent panel value, so the panel stays legible regardless of the transparency slider.

```js
// In applyTheme(), after applyPanelTransparency():
const [pr, pg, pb] = getPanelBaseRgb();
document.body.style.setProperty("--theme-panel-bg", `rgb(${pr},${pg},${pb})`);
```

### 6c. Menus and vertical slider popups

All dropdown menus should share the `.io-menu-dropdown` surface and stay opaque:

```css
.io-menu-dropdown,
.income-vslider-popup {
  background: var(--control-popover-bg, var(--panel-strong));
  border: 1px solid var(--line-strong);
  backdrop-filter: none;
}

html[data-theme] input.income-vslider-input[type="range"],
html[data-theme] input.income-vslider-input[type="range"]::-webkit-slider-runnable-track,
html[data-theme] input.income-vslider-input[type="range"]::-moz-range-track {
  background: var(--control-range-track-bg, var(--control-popover-bg, var(--panel-strong)));
  background-image: none;
}
```

Avoid `background: var(--panel)` on popovers. It will become transparent when the panel-glass slider moves.

Toggle logic (JS):
```js
sphereBtn.addEventListener("click", e => {
  e.stopPropagation();
  themePanel.classList.toggle("open");
});
document.addEventListener("click", () => themePanel.classList.remove("open"));
themePanel.addEventListener("click", e => e.stopPropagation());
```

Panel sections (in order): **Theme** chips → **Background** (Mode select + Image file input) →
**Panel Glass** (Transparency range 20–100 %) → **Custom Colours** (visible only when Custom active).

```css
.theme-custom-section { border-top: 1px solid var(--line); padding-top: 12px; margin-top: 12px; }
.theme-section-label  { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
.theme-control-row    { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.theme-control-row label { font-size: 0.74rem; color: var(--muted); flex: 1; }
.theme-control-row select,
.theme-control-row input[type=range] { flex: 2; }
.theme-range-value { width: 36px; text-align: right; font-size: 0.72rem; font-weight: 700; color: var(--accent); }
```

### 6c. Theme chips

**Canonical order (use this order across all apps in this family):**
Classic → Bright → Dark → Metal → Custom

```html
<button class="theme-chip" data-theme="original">Classic</button>
<button class="theme-chip" data-theme="bright">Bright</button>
<button class="theme-chip" data-theme="dark">Dark</button>
<button class="theme-chip" data-theme="metallic">Metal</button>
<button class="theme-chip" data-theme="custom">Custom</button>
```

Use `flex-wrap: wrap` with `flex: 1 1 calc(33% - 4px)` on each chip so five chips wrap to two rows without overflow.

```css
.theme-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.theme-chip {
  flex: 1 1 calc(33% - 4px); padding: 8px 4px; border-radius: 10px;
  border: 1px solid var(--line); background: transparent;
  color: var(--muted); font-size: 0.82rem; font-weight: 500; cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.theme-chip:hover { border-color: var(--line-strong); color: var(--text); }
.theme-chip-active {
  background: rgba(0,212,184,0.12);
  border-color: rgba(0,212,184,0.5);
  color: var(--accent); font-weight: 700;
}
```

### 6d. Custom hue sliders

Four sliders: Background hue, Tile hue, Canvas hue, Text hue.
Each slider = `<input type="range" min="0" max="360" step="1">`.

```css
/* Generic rainbow slider */
.theme-slider {
  flex: 1; height: 8px; padding: 0; border: none; border-radius: 999px;
  background: linear-gradient(to right,
    hsl(0,80%,55%), hsl(30,80%,55%), hsl(60,80%,55%), hsl(90,80%,55%),
    hsl(120,80%,55%), hsl(150,80%,55%), hsl(180,80%,55%), hsl(210,80%,55%),
    hsl(240,80%,55%), hsl(270,80%,55%), hsl(300,80%,55%), hsl(330,80%,55%),
    hsl(360,80%,55%)
  ) !important;
  -webkit-appearance: none; appearance: none; cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4);
}
.theme-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 20px; height: 20px; border-radius: 50%;
  background: white; border: 2px solid rgba(0,0,0,0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.35); cursor: pointer;
  transition: transform 0.15s;
}
.theme-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }

/* Canvas slider — dark/muted variant */
.canvas-hue-slider {
  background: linear-gradient(to right,
    hsl(0,30%,13%), hsl(60,28%,13%), hsl(120,30%,13%), hsl(180,30%,13%),
    hsl(240,32%,13%), hsl(300,30%,13%), hsl(360,30%,13%)
  ) !important;
}

/* Text slider — near-white variant */
.text-hue-slider {
  background: linear-gradient(to right,
    hsl(0,22%,91%), hsl(60,18%,91%), hsl(120,16%,91%), hsl(180,20%,91%),
    hsl(240,24%,91%), hsl(300,22%,91%), hsl(360,22%,91%)
  ) !important;
}
```

Swatch circles (live preview dot next to each slider):
```css
.theme-swatch {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.25);
  flex-shrink: 0; display: block;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  transition: background 0.1s;
}
```
Update swatch colour on slider input:
```js
bgHueSwatch.style.background     = `hsl(${customBgHue}, 80%, 55%)`;
tileHueSwatch.style.background   = `hsl(${customTileHue}, 45%, 20%)`;
canvasHueSwatch.style.background = `hsl(${customCanvasHue}, 30%, 20%)`;
textHueSwatch.style.background   = `hsl(${customTextHue}, 22%, 88%)`;
```

### 6e. CSS-only theme overrides (data-theme attribute)

These handle things JS vars can't: font-family, :before pseudo-elements, table backgrounds.

```css
/* Classic/warm theme */
html[data-theme="original"] body { font-family: Georgia, "Times New Roman", serif; }
html[data-theme="original"] h1   { background: none; -webkit-text-fill-color: #26190c; color: #26190c; }
html[data-theme="original"] .panel::before { background: linear-gradient(90deg, transparent, rgba(15,118,110,0.22), transparent); }
html[data-theme="original"] table { background: rgba(255,255,255,0.75); }
html[data-theme="original"] th    { background: #f9f3e9; }
html[data-theme="original"] tbody tr:nth-child(even) { background: rgba(249,243,233,0.55); }
html[data-theme="original"] select option { background: #fffdf9; color: #26190c; }

/* Metallic theme */
html[data-theme="metallic"] .panel {
  background: linear-gradient(160deg, rgba(78,83,94,0.92), rgba(48,51,58,0.95), rgba(62,66,76,0.92));
}
html[data-theme="metallic"] h1 {
  background: linear-gradient(135deg, #b0b8c8 0%, #dde4f0 25%, #9098a8 45%, #e8eef8 60%, #a8b2c4 80%, #ccd4e4 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
html[data-theme="metallic"] table { background: rgba(40,43,50,0.85); }
html[data-theme="metallic"] th    { background: linear-gradient(180deg, rgba(28,30,36,0.98), rgba(22,24,29,0.98)); color: #8890a4; }
html[data-theme="metallic"] select option { background: #22242a; color: #dde2ee; }
```


## 7. LAYOUT CONVENTIONS

```
page-shell — max-width: min(1800px, calc(100% - 32px)); margin: auto; padding: 28px 0 40px
  hero — flex, space-between, gap 24px (title left, buttons right)
  layout — CSS grid: minmax(320px,400px) minmax(0,1fr); gap 22px
    control-panel — grid, gap 16px, align-content: start
    results-panel — grid, gap 16px, align-content: start
      summary-grid — 4 cols (→ 2 cols ≤1100px → 1 col ≤700px)
      chart panels
      table panel
      special-events panel (if needed)
```

Breakpoints:
- ≤1100px: layout collapses to 1 column, summary → 2 columns
- ≤700px:  hero stacks vertically, field-grid → 1 column


## 8. FIELD GRID INSIDE PANELS

```css
.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
.field-pair { grid-column: 1/-1; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
label { display: grid; gap: 5px; font-size: 0.88rem; }
label span { color: var(--muted); }
```

Optional field groups (collapsible sub-section):
```css
.optional-field-group {
  grid-column: 1/-1;
  display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px;
  padding: 12px;
  border: 1px solid rgba(0,212,184,0.15); border-radius: 14px;
  background: rgba(0,212,184,0.04);
}
```


## 9. THOUSAND SEPARATOR PATTERN FOR NUMBER INPUTS

Currency inputs (large money values) should be displayed as text with commas.

HTML: use `type="text" inputmode="numeric"` (not `type="number"`) for currency fields.

```js
function isCurrencyInput(input) {
  // Detect by step attribute: step >= 500 and not a percent field
  return !isPercentInput(input) && Number(input.step) >= 500;
}

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

// On syncForm / setting input values:
input.value = formatCurrency(stateValue);

// On focus: strip commas so user can type freely
input.addEventListener("focus", () => {
  input.value = String(input.value).replace(/,/g, "");
});

// On blur: re-apply formatting
input.addEventListener("blur", () => {
  const n = Number(String(input.value).replace(/,/g, ""));
  if (Number.isFinite(n)) input.value = formatCurrency(n);
});

// On parse (change/input handler): always strip commas before Number()
function parseInputValue(input) {
  const raw = String(input.value).replace(/,/g, "");
  return Number(raw);
}
```

At startup, convert matching inputs:
```js
inputs.forEach((input) => {
  if (input.type === "number" && isCurrencyInput(input)) {
    input.type = "text";
    input.inputMode = "numeric";
  }
  // ... add focus/blur handlers ...
});
```


## 10. CANVAS CHART COLOUR CONVENTIONS

Charts are drawn on `<canvas>` using vanilla JS (no library).
Read CSS vars at draw time so they respond to theme changes.
Always call `render()` after `applyTheme()` so charts redraw with new colours.

```js
function getChartColours() {
  const cs = getComputedStyle(document.documentElement);
  const get = (v) => cs.getPropertyValue(v).trim();
  return {
    accent:      get("--accent"),
    accent2:     get("--accent-2"),
    muted:       get("--muted"),
    text:        get("--text"),
    line:        get("--line"),
    danger:      get("--danger"),
    success:     get("--success"),
    bg:          get("--bg"),
  };
}
```

Typical series palette (dark theme values):
```
Series 1: --accent        #00d4b8  teal
Series 2: --accent-2      #7c3aed  violet
Series 3: #f59e0b                  amber
Series 4: #3b82f6                  blue
Series 5: #ec4899                  pink
Series 6: #84cc16                  lime
```


## 11. PRINT STYLES

Always include a print stylesheet. Key rules:
- Override --bg, --panel, --text, --muted, --accent to white/dark ink
- Remove body::before, body::after overlays
- Remove box-shadow, backdrop-filter
- Set font-size: 7-11px for dense tables
- Use @page { size: A4 landscape; margin: 10mm; }

```css
@media print {
  :root {
    --bg: #ffffff; --panel: #ffffff; --panel-strong: #ffffff;
    --line: rgba(66,50,28,0.2); --text: #1a1a2e; --muted: #555; --accent: #0f766e;
  }
  body { background: #ffffff; }
  body::before, body::after { display: none; }
  h1 { -webkit-text-fill-color: var(--text); }
  .panel, .summary-card { box-shadow: none; backdrop-filter: none; }
  .panel::before, .summary-card::before, .summary-card::after { display: none; }
}
```


## 12. MISC CONVENTIONS

- `border-radius` for pills/badges/buttons: `999px`
- `border-radius` for cards: `18px`
- `border-radius` for inputs: `10px`
- `border-radius` for panels: `var(--radius)` (20–22px)
- Transitions: `0.2s` for colour/shadow, `0.15s` for transform, `0.5–0.6s` for spin
- Hover lift: `transform: translateY(-1px)` on buttons, `translateY(-3px)` on cards
- `accent-color: var(--accent)` on all checkboxes and native range inputs
- `backdrop-filter: blur(20px)` on panels (glass effect)
- Panel inner top-edge shimmer: `::before` with `linear-gradient(90deg, transparent, rgba(accent,0.3), transparent)`, height 1px
- State storage: always use `localStorage`, key per project, parse with try/catch
- Share/export: encode state as base64 URL param; decode on load
