/* ─────────────────────────────────────────────────────────────────────────────
   mini-core.js  —  Shared theme engine for Rob's Mini apps

   Usage:
     1. Include this script before your app script.
     2. At the end of your script (after defining render()), call:
          MiniTheme.init({ storageKey: "my-app-theme-v1", onRender: render });
     3. Optionally override defaultTheme: "dark"|"metallic"|"bright"|"original"

   The module manages:
     - THEME_PRESETS (original, dark, bright, metallic)
     - Custom HSL theme builder + background gradient
     - Panel transparency + blur sliders
     - Background photo/mode control
     - localStorage persistence
     - All theme panel event listeners
     - getChartColours() helper for canvas charts
   ───────────────────────────────────────────────────────────────────────────── */

const MiniTheme = (() => {

  // ── Theme presets ──────────────────────────────────────────────────────────

  const THEME_PRESETS = {
    original: {
      "--bg":                    "#f4efe6",
      "--panel":                 "rgba(255, 252, 247, 0.92)",
      "--panel-strong":          "#fffdf9",
      "--card":                  "rgba(255, 252, 247, 0.97)",
      "--card-2":                "rgba(255, 246, 232, 0.93)",
      "--card-warn":             "rgba(255, 240, 240, 0.98)",
      "--card-warn-2":           "rgba(255, 226, 226, 0.94)",
      "--card-success":          "rgba(240, 255, 248, 0.98)",
      "--card-success-2":        "rgba(220, 252, 236, 0.94)",
      "--input-bg":              "rgba(255, 255, 255, 0.72)",
      "--line":                  "rgba(66, 50, 28, 0.14)",
      "--line-strong":           "rgba(66, 50, 28, 0.26)",
      "--text":                  "#26190c",
      "--muted":                 "#6c5b48",
      "--accent":                "#0f766e",
      "--accent-2":              "#b45309",
      "--control-popover-bg":    "#fffdf9",
      "--control-range-track-bg":"#f3eadc",
      "--danger":                "#b42318",
      "--success":               "#15803d",
      "--shadow":                "0 20px 50px rgba(56, 35, 7, 0.12), 0 4px 12px rgba(56, 35, 7, 0.08)",
      "--radius":                "22px",
    },
    dark: {
      "--bg":                    "#1a2236",
      "--panel":                 "rgba(10, 14, 26, 0.88)",
      "--panel-strong":          "rgba(8, 12, 22, 0.97)",
      "--card":                  "rgba(12, 16, 30, 0.97)",
      "--card-2":                "rgba(8, 12, 22, 0.95)",
      "--card-warn":             "rgba(30, 14, 14, 0.96)",
      "--card-warn-2":           "rgba(20, 10, 10, 0.9)",
      "--card-success":          "rgba(10, 30, 20, 0.96)",
      "--card-success-2":        "rgba(8, 22, 16, 0.9)",
      "--input-bg":              "rgba(255, 255, 255, 0.04)",
      "--line":                  "rgba(99, 179, 237, 0.13)",
      "--line-strong":           "rgba(99, 179, 237, 0.24)",
      "--text":                  "#e8edf8",
      "--muted":                 "#7a8fba",
      "--accent":                "#00d4b8",
      "--accent-2":              "#7c3aed",
      "--accent-glow":           "rgba(0, 212, 184, 0.28)",
      "--control-popover-bg":    "#08101c",
      "--control-range-track-bg":"#121a2b",
      "--button-text":           "#0b0f1a",
      "--danger":                "#f87171",
      "--success":               "#34d399",
      "--shadow":                "0 2px 0px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.35)",
      "--radius":                "20px",
    },
    bright: {
      "--bg":                    "#20140d",
      "--panel":                 "rgba(54, 34, 19, 0.42)",
      "--panel-strong":          "rgba(62, 40, 22, 0.72)",
      "--card":                  "rgba(80, 50, 28, 0.65)",
      "--card-2":                "rgba(60, 36, 18, 0.60)",
      "--card-warn":             "rgba(80, 30, 20, 0.70)",
      "--card-warn-2":           "rgba(62, 22, 14, 0.65)",
      "--card-success":          "rgba(30, 60, 40, 0.70)",
      "--card-success-2":        "rgba(20, 46, 30, 0.65)",
      "--input-bg":              "rgba(255, 220, 160, 0.08)",
      "--line":                  "rgba(255, 216, 160, 0.14)",
      "--line-strong":           "rgba(255, 220, 168, 0.30)",
      "--text":                  "#fff7e8",
      "--muted":                 "#d8bb8d",
      "--accent":                "#f4b35e",
      "--accent-2":              "#55d6a5",
      "--accent-glow":           "rgba(244, 179, 94, 0.28)",
      "--control-popover-bg":    "#2a1a0a",
      "--control-range-track-bg":"#3a2510",
      "--button-text":           "#2a1200",
      "--danger":                "#ff7b7b",
      "--success":               "#55d6a5",
      "--shadow":                "0 2px 0px rgba(255,220,160,0.06), 0 8px 24px rgba(0,0,0,0.55), 0 24px 64px rgba(0,0,0,0.50), 0 0 0 1px rgba(0,0,0,0.40)",
      "--radius":                "20px",
    },
    metallic: {
      "--bg":                    "#131416",
      "--panel":                 "rgba(58, 62, 70, 0.92)",
      "--panel-strong":          "rgba(38, 40, 46, 0.98)",
      "--card":                  "rgba(72, 76, 86, 0.97)",
      "--card-2":                "rgba(48, 51, 58, 0.95)",
      "--card-warn":             "rgba(70, 48, 44, 0.97)",
      "--card-warn-2":           "rgba(52, 34, 30, 0.95)",
      "--card-success":          "rgba(44, 62, 52, 0.97)",
      "--card-success-2":        "rgba(32, 48, 38, 0.95)",
      "--input-bg":              "rgba(22, 24, 28, 0.75)",
      "--line":                  "rgba(210, 218, 235, 0.16)",
      "--line-strong":           "rgba(220, 228, 245, 0.28)",
      "--text":                  "#dde2ee",
      "--muted":                 "#8890a4",
      "--accent":                "#7ab8d8",
      "--accent-2":              "#c8a060",
      "--accent-glow":           "rgba(122, 184, 216, 0.28)",
      "--control-popover-bg":    "#26282e",
      "--control-range-track-bg":"#181a1e",
      "--button-text":           "#0e1012",
      "--danger":                "#e07878",
      "--success":               "#68c898",
      "--shadow":                "0 2px 0px rgba(240,245,255,0.1), 0 8px 24px rgba(0,0,0,0.65), 0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.5)",
      "--radius":                "20px",
    },
  };

  const ALL_THEME_VARS = [...new Set(Object.values(THEME_PRESETS).flatMap(Object.keys))];

  // ── State ──────────────────────────────────────────────────────────────────

  let activeTheme       = "dark";
  let customBgHue       = 175;
  let customTileHue     = 220;
  let customCanvasHue   = 220;
  let customTextHue     = 220;
  let customBackgroundUrl = null;

  let _storageKey          = "mini-app-theme-v1";
  let _onRender            = () => {};
  let _defaultTheme        = "dark";
  let _defaultBackgroundUrl = "./background.jpeg";

  // ── Per-theme base RGB values (for transparency slider) ───────────────────

  function getPanelBaseRgb() {
    if (activeTheme === "metallic") return [52, 62, 82];
    if (activeTheme === "original") return [255, 252, 247];
    if (activeTheme === "bright")   return [54, 34, 19];
    return [9, 18, 33]; // dark + custom
  }

  function getCardBaseRgbs() {
    if (activeTheme === "metallic") return {
      card: [72, 76, 86],    card2: [48, 51, 58],
      warn: [70, 48, 44],    warn2: [52, 34, 30],
      success: [44, 62, 52], success2: [32, 48, 38],
    };
    if (activeTheme === "bright") return {
      card: [80, 50, 28],    card2: [60, 36, 18],
      warn: [80, 30, 20],    warn2: [62, 22, 14],
      success: [30, 60, 40], success2: [20, 46, 30],
    };
    if (activeTheme === "original") return {
      card: [255, 252, 247], card2: [255, 246, 232],
      warn: [255, 240, 240], warn2: [255, 226, 226],
      success: [240, 255, 248], success2: [220, 252, 236],
    };
    return {
      card: [12, 16, 30],    card2: [8, 12, 22],
      warn: [30, 14, 14],    warn2: [20, 10, 10],
      success: [10, 30, 20], success2: [8, 22, 16],
    };
  }

  // ── Custom theme builder ───────────────────────────────────────────────────

  function buildCustomVars(bgHue, tileHue, canvasHue, textHue) {
    const cardL = 8, bgL = 16, textL = 90, textS = 20;
    return {
      "--bg":                    `hsl(${canvasHue}, 30%, ${bgL}%)`,
      "--panel":                 `hsla(${tileHue}, 42%, ${cardL - 1}%, 0.88)`,
      "--panel-strong":          `hsla(${tileHue}, 42%, ${Math.max(2, cardL - 3)}%, 0.97)`,
      "--card":                  `hsla(${tileHue}, 38%, ${cardL}%, 0.97)`,
      "--card-2":                `hsla(${tileHue}, 38%, ${Math.max(2, cardL - 2)}%, 0.95)`,
      "--card-warn":             `hsla(0, 45%, ${cardL}%, 0.96)`,
      "--card-warn-2":           `hsla(0, 45%, ${Math.max(2, cardL - 2)}%, 0.9)`,
      "--card-success":          `hsla(150, 45%, ${cardL}%, 0.96)`,
      "--card-success-2":        `hsla(150, 45%, ${Math.max(2, cardL - 2)}%, 0.9)`,
      "--input-bg":              `hsla(${tileHue}, 30%, 18%, 0.6)`,
      "--line":                  `hsla(${bgHue}, 60%, 65%, 0.13)`,
      "--line-strong":           `hsla(${bgHue}, 60%, 65%, 0.26)`,
      "--text":                  `hsl(${textHue}, ${textS}%, ${textL}%)`,
      "--muted":                 `hsl(${textHue}, 16%, 58%)`,
      "--accent":                `hsl(${bgHue}, 80%, 55%)`,
      "--accent-2":              `hsl(${(bgHue + 130) % 360}, 68%, 58%)`,
      "--accent-glow":           `hsla(${bgHue}, 80%, 55%, 0.3)`,
      "--control-popover-bg":    `hsl(${tileHue}, 42%, ${Math.max(3, cardL - 2)}%)`,
      "--control-range-track-bg":`hsl(${tileHue}, 38%, ${cardL + 8}%)`,
      "--button-text":           `hsl(${canvasHue}, 30%, 10%)`,
      "--danger":  "#f87171",
      "--success": "#34d399",
      "--shadow":  "0 2px 0px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.35)",
      "--radius":  "20px",
    };
  }

  function buildCustomBackground(bgHue) {
    const h2 = (bgHue + 130) % 360;
    const h3 = (bgHue + 200) % 360;
    return [
      `radial-gradient(ellipse 80% 50% at 20% -10%, hsla(${bgHue},80%,55%,0.28) 0%, transparent 60%)`,
      `radial-gradient(ellipse 60% 40% at 85% 10%,  hsla(${h2},65%,58%,0.32) 0%, transparent 55%)`,
      `radial-gradient(ellipse 50% 60% at 50% 100%, hsla(${h3},70%,50%,0.22) 0%, transparent 60%)`,
      `radial-gradient(ellipse 30% 30% at 10% 80%,  hsla(${bgHue},80%,55%,0.14) 0%, transparent 50%)`,
    ].join(", ");
  }

  // ── Panel transparency + blur ──────────────────────────────────────────────

  function applyPanelTransparency() {
    const slider  = document.getElementById("panel-transparency");
    const valueEl = document.getElementById("panel-transparency-value");
    if (!slider) return;

    const clear = parseInt(slider.value, 10);
    const alpha = Math.max(0.02, Math.min(0.95, 1 - clear / 100));
    const a  = alpha.toFixed(2);
    const b  = Math.max(0.02, alpha - 0.05).toFixed(2);
    const c  = Math.max(0.02, alpha - 0.10).toFixed(2);
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
    document.body.style.setProperty("--control-popover-bg",    `rgb(${r},${g},${bl})`);
    document.body.style.setProperty("--control-range-track-bg",`rgba(${r},${g},${bl},0.92)`);

    if (valueEl) valueEl.textContent = `${clear}%`;

    const blurSlider  = document.getElementById("panel-blur");
    const blurValueEl = document.getElementById("panel-blur-value");
    if (blurSlider) {
      const raw  = parseInt(blurSlider.value, 10);
      const blur = Number.isFinite(raw) ? raw : 18;
      document.body.style.setProperty("--panel-blur", `${blur}px`);
      if (blurValueEl) blurValueEl.textContent = `${blur}px`;
    }
  }

  // ── Background photo/mode ──────────────────────────────────────────────────

  function applyBackgroundMode() {
    const modeEl = document.getElementById("bg-mode");
    if (!modeEl) return;
    const mode  = modeEl.value;
    const image = customBackgroundUrl
      ? `url("${customBackgroundUrl}")`
      : `url("${_defaultBackgroundUrl}")`;

    if (mode === "plain") {
      document.body.style.setProperty("--bg-image",   "none");
      document.body.style.setProperty("--bg-opacity",  "0");
    } else {
      document.body.style.setProperty("--bg-image", image);
      const opacity = mode === "soft"  ? "0.18"
                    : mode === "vivid" ? "0.55"
                    : activeTheme === "bright" ? "0.44"
                    : "0.34";
      document.body.style.setProperty("--bg-opacity", opacity);
    }
  }

  // ── Apply theme ────────────────────────────────────────────────────────────

  function applyTheme(theme, bgHue, tileHue, canvasHue, textHue) {
    const root = document.documentElement;

    ALL_THEME_VARS.forEach((v) => root.style.removeProperty(v));

    const vars = theme === "custom"
      ? buildCustomVars(bgHue, tileHue, canvasHue, textHue)
      : THEME_PRESETS[theme] || THEME_PRESETS.dark;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

    const bgColours = {
      original: "#f4efe6",
      bright:   "#20140d",
      metallic: "#0c1014",
      dark:     "#07111d",
    };
    document.body.style.backgroundColor = theme === "custom"
      ? `hsl(${canvasHue}, 30%, 10%)`
      : bgColours[theme] || bgColours.dark;
    document.body.style.backgroundImage = "";

    applyPanelTransparency();
    applyBackgroundMode();

    const [pr, pg, pb] = getPanelBaseRgb();
    document.body.style.setProperty("--theme-panel-bg", `rgb(${pr},${pg},${pb})`);
    document.body.style.setProperty("--theme-panel",    `rgb(${pr},${pg},${pb})`);

    root.setAttribute("data-theme", theme);

    document.querySelectorAll(".theme-chip").forEach((btn) => {
      btn.classList.toggle("theme-chip-active", btn.dataset.theme === theme);
    });
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  function saveThemePrefs() {
    const bgModeEl      = document.getElementById("bg-mode");
    const transparencyEl = document.getElementById("panel-transparency");
    const blurEl        = document.getElementById("panel-blur");
    try {
      localStorage.setItem(_storageKey, JSON.stringify({
        theme:        activeTheme,
        bgHue:        customBgHue,
        tileHue:      customTileHue,
        canvasHue:    customCanvasHue,
        textHue:      customTextHue,
        bgMode:       bgModeEl       ? bgModeEl.value       : "photo",
        transparency: transparencyEl ? transparencyEl.value : "52",
        blur:         blurEl         ? blurEl.value         : "18",
      }));
    } catch { /* storage unavailable */ }
  }

  function loadThemePrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(_storageKey) || "{}");
      const valid = ["original", "bright", "dark", "metallic", "custom"];
      activeTheme    = valid.includes(saved.theme) ? saved.theme : _defaultTheme;
      customBgHue    = Number.isFinite(saved.bgHue)     ? saved.bgHue     : 175;
      customTileHue  = Number.isFinite(saved.tileHue)   ? saved.tileHue   : 220;
      customCanvasHue= Number.isFinite(saved.canvasHue) ? saved.canvasHue : 220;
      customTextHue  = Number.isFinite(saved.textHue)   ? saved.textHue   : 220;

      const bgModeEl       = document.getElementById("bg-mode");
      const transparencyEl = document.getElementById("panel-transparency");
      const blurEl         = document.getElementById("panel-blur");
      const blurValueEl    = document.getElementById("panel-blur-value");

      if (bgModeEl       && saved.bgMode)       bgModeEl.value       = saved.bgMode;
      if (transparencyEl && saved.transparency) transparencyEl.value = saved.transparency;
      if (blurEl         && saved.blur != null) {
        blurEl.value = saved.blur;
        if (blurValueEl) blurValueEl.textContent = `${saved.blur}px`;
      }
    } catch {
      activeTheme = _defaultTheme;
    }
  }

  // ── Swatch sync ────────────────────────────────────────────────────────────

  function syncSwatches() {
    const set = (id, bg) => {
      const el = document.getElementById(id);
      if (el) el.style.background = bg;
    };
    set("bg-hue-swatch",     `hsl(${customBgHue},     80%, 55%)`);
    set("tile-hue-swatch",   `hsl(${customTileHue},   45%, 20%)`);
    set("canvas-hue-swatch", `hsl(${customCanvasHue}, 30%, 20%)`);
    set("text-hue-swatch",   `hsl(${customTextHue},   22%, 88%)`);
  }

  // ── Event listeners ────────────────────────────────────────────────────────

  function initEventListeners() {
    const themeBtn    = document.getElementById("theme-settings-button");
    const themePanel  = document.getElementById("theme-panel");
    const customSliders = document.getElementById("theme-custom-sliders");

    if (themeBtn && themePanel) {
      themeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        themePanel.classList.toggle("open");
      });

      document.addEventListener("click", (e) => {
        if (themePanel.classList.contains("open") &&
            !themePanel.contains(e.target) &&
            e.target !== themeBtn) {
          themePanel.classList.remove("open");
        }
      });
    }

    document.querySelectorAll(".theme-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTheme = btn.dataset.theme;
        if (customSliders) {
          customSliders.hidden = activeTheme !== "custom";
        }
        if (activeTheme !== "custom" && themePanel) {
          themePanel.classList.remove("open");
        }
        applyTheme(activeTheme, customBgHue, customTileHue, customCanvasHue, customTextHue);
        saveThemePrefs();
        _onRender();
      });
    });

    const bgModeEl = document.getElementById("bg-mode");
    if (bgModeEl) {
      bgModeEl.addEventListener("change", () => {
        applyBackgroundMode();
        saveThemePrefs();
      });
    }

    const bgFileEl = document.getElementById("bg-file");
    if (bgFileEl) {
      bgFileEl.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (customBackgroundUrl) URL.revokeObjectURL(customBackgroundUrl);
        customBackgroundUrl = URL.createObjectURL(file);
        if (bgModeEl) bgModeEl.value = "photo";
        applyBackgroundMode();
        saveThemePrefs();
      });
    }

    const transpEl = document.getElementById("panel-transparency");
    if (transpEl) {
      transpEl.addEventListener("input", () => {
        applyPanelTransparency();
        saveThemePrefs();
        _onRender();
      });
    }

    const blurEl = document.getElementById("panel-blur");
    if (blurEl) {
      blurEl.addEventListener("input", () => {
        applyPanelTransparency();
        saveThemePrefs();
      });
    }

    const sliderDefs = [
      { id: "bg-hue-slider",     get: () => customBgHue,     set: (v) => { customBgHue = v; } },
      { id: "tile-hue-slider",   get: () => customTileHue,   set: (v) => { customTileHue = v; } },
      { id: "canvas-hue-slider", get: () => customCanvasHue, set: (v) => { customCanvasHue = v; } },
      { id: "text-hue-slider",   get: () => customTextHue,   set: (v) => { customTextHue = v; } },
    ];

    sliderDefs.forEach(({ id, set }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        set(Number(el.value));
        syncSwatches();
        applyTheme("custom", customBgHue, customTileHue, customCanvasHue, customTextHue);
        saveThemePrefs();
        _onRender();
      });
    });
  }

  // ── Chart colour helper ────────────────────────────────────────────────────

  function getChartColours() {
    const cs  = getComputedStyle(document.documentElement);
    const get = (v) => cs.getPropertyValue(v).trim();
    return {
      accent:  get("--accent"),
      accent2: get("--accent-2"),
      muted:   get("--muted"),
      text:    get("--text"),
      line:    get("--line"),
      danger:  get("--danger"),
      success: get("--success"),
      bg:      get("--bg"),
    };
  }

  // ── Public init ────────────────────────────────────────────────────────────

  function init({ storageKey, onRender, defaultTheme, backgroundUrl } = {}) {
    if (storageKey)   _storageKey   = storageKey;
    if (onRender)     _onRender     = onRender;
    if (defaultTheme) _defaultTheme = defaultTheme;

    // Resolve to absolute URL — CSS resolves url() relative to the CSS file, not the HTML doc
    const rawBg = backgroundUrl || _defaultBackgroundUrl;
    _defaultBackgroundUrl = new URL(rawBg, document.baseURI).href;

    loadThemePrefs();

    // Sync slider positions to loaded values
    const sliderMap = {
      "bg-hue-slider":     () => customBgHue,
      "tile-hue-slider":   () => customTileHue,
      "canvas-hue-slider": () => customCanvasHue,
      "text-hue-slider":   () => customTextHue,
    };
    Object.entries(sliderMap).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val();
    });

    syncSwatches();

    const customSliders = document.getElementById("theme-custom-sliders");
    if (customSliders) customSliders.hidden = activeTheme !== "custom";

    applyTheme(activeTheme, customBgHue, customTileHue, customCanvasHue, customTextHue);

    initEventListeners();

    _onRender();
  }

  // ── Exports ────────────────────────────────────────────────────────────────

  return {
    init,
    applyTheme: (theme) => {
      activeTheme = theme;
      applyTheme(theme, customBgHue, customTileHue, customCanvasHue, customTextHue);
    },
    getChartColours,
    get activeTheme() { return activeTheme; },
  };

})();
