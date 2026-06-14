# Pension Forecaster

A standalone HTML/CSS/JS retirement forecaster and optimiser based on the workbook `Cashflow - 2026d.xlsx`.

## Open it

Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 8765
```

## What it does

- Lets you edit core personal details such as pension pot, current age, and retirement age.
- Recalculates the projection instantly as assumptions change.
- Supports import and export of personal details as JSON, with legacy CSV/JSON import support.
- Shows summary cards, a trend chart, and summarised, detailed, or granular year-by-year projection tables.
- Includes a read-only **Optimiser** view that uses the current forecaster plan directly, without importing a separate plan export.
- Uses friendly percentage inputs while keeping stored rates as decimals.
- Adds a tax optimisation mode for drawdown planning that prioritises staying within the basic-rate band, using TFLS and then savings before higher-rate drawdown where possible.
- Exports the visible projection table to Excel, exports a separate formula workbook, and supports browser PDF export.

## Themes and visuals

Five themes: **Classic** (warm parchment), **Bright** (dark amber/fire with background photo), **Dark** (deep navy), **Metal** (brushed steel), and **Custom** (four hue sliders).

The colour sphere button opens a theme panel with:
- **Background** — Photo / Soft photo / Vivid photo / Plain colour, plus an image file upload to replace the default background.
- **Panel glass** — Transparency slider (20–100 %) and Blur slider (0–24 px). Both update all panels, summary tiles, charts, and table backgrounds in real time via `--panel-a/b/c` and `--panel-blur` CSS custom properties.
- **Custom colours** — Accent, tile, canvas, and text hue sliders (Custom theme only).

Dropdown menus, the theme panel, tooltips, and vertical quick-slider popups use opaque `--theme-panel` / `--control-popover-bg` surfaces with no `backdrop-filter`. This prevents double-blur and alpha-stacking artefacts when a popover appears over a glass panel (see STYLE_GUIDE §13).

Click the **Version badge** to see when the plan was last changed; it reverts after a few seconds.

## Notes

This version mirrors the main spreadsheet logic around growth, inflation, partner income, state pension timing, and drawdown planning. It is a browser-friendly rebuild rather than a cell-for-cell Excel clone, so a few spreadsheet-specific details are simplified.
