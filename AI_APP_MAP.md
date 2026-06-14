# AI App Map: Pension Forecaster

## 1. What this app does

Pension Forecaster is a standalone browser app for modelling UK retirement cashflow, pension drawdown, tax, TFLS, savings, partner income, and year-by-year pot depletion. It is for a user who wants to test retirement scenarios interactively without working directly in the original spreadsheet.

## 2. Current status

Working now:
- Single-page app runs from `index.html` with no build step.
- User inputs update the forecast live.
- Projection table supports summary, detailed, granular, and custom views.
- Charts show spending and income/drawdown composition.
- Plan data can be imported/exported as JSON, exported to Excel-style tables/formula workbooks, exported to PDF, and shared by URL.
- Five themes: Classic (warm parchment), Bright (dark amber/fire), Dark (deep navy), Metal (brushed steel), Custom (hue sliders).
- Background photo layer (`background.jpeg`) displayed via `body::before`; mode and opacity controlled by the theme panel (Photo / Soft / Vivid / Plain).
- Panel glass transparency slider (20–100 %) updates all panels, summary tiles, table, and sticky columns in real time via CSS custom properties `--panel-a/b/c` and `--table-bg`.
- Clicking the version badge briefly shows the last-modified date then reverts to the version string.
- Tax/drawdown logic includes UK income tax bands, personal allowance taper, personal savings allowance, TFLS, lump sum allowance, regular drawdown, maximise drawdown, and 25/75 pairing options.
- Basic setup popup supports first-run/reset onboarding.

Unfinished or areas to treat carefully:
- The model is a browser-friendly rebuild of spreadsheet logic, not a cell-for-cell Excel clone.
- UK tax assumptions are hard-coded in `app.js`; keep them explicit and date-sensitive.
- Formula workbook export mirrors core projection logic but may not cover every interactive edge case as fully as the app model.
- There is no automated test suite.

Known broken:
- No confirmed broken feature at the time this map was written. Validate with `node --check app.js` after JavaScript changes and browser smoke tests for UI changes.

## 3. Tech stack

Frontend: Vanilla HTML, CSS, JavaScript.

Backend: None.

Database: None. Browser `localStorage` stores app state, UI state, and theme settings.

Auth: None.

Hosting: Static hosting. The app can be opened directly as `index.html` or served from any static file host, including GitHub Pages.

Key libraries:
- No package-managed runtime dependencies.
- Browser APIs: `localStorage`, `Blob`, `URL.createObjectURL`, `FileReader`, `navigator.clipboard`, `window.print`.
- Excel exports are generated manually as SpreadsheetML/XML-style files in `app.js`.

## 4. Folder structure

- `index.html`: Main app markup, panels, inputs, modals, menus, and templates.
- `app.js`: All state management, projection logic, tax/drawdown calculations, chart rendering, table rendering, import/export, share links, themes, and event handlers.
- `styles.css`: Full visual styling, layout, responsive rules, panels, controls, charts, tables, modals, and theme-specific styling.
- `STYLE_GUIDE.md`: Design system notes for this app family, including colours, theme tokens, fonts, and interaction patterns.
- `README.md`: Short project overview and basic open/run notes.
- `AI_APP_MAP.md`: This file. Read first when using AI to modify the app.

## 5. Main user flows

- Open the app and either use saved browser state or complete the basic setup panel.
- Enter personal details: plan name, year of birth, retirement age, plan years or plan-to-age.
- Enter pension pot, crystallised amount, lump sum allowance used, growth scenarios, and pot growth assumptions.
- Enter spending needs: income required, bills, holidays, car cost, CPI options.
- Enter savings: bank savings, ISA, Premium Bonds, growth/interest assumptions.
- Optionally enable partner details and partner income/savings assumptions.
- Configure personal tax assumptions: state pension, tax allowance CPI, tax band CPI.
- Configure drawdown behaviour: regular drawdown, year 1 TFLS, TFLS by 75, maximise drawdown, force 25/75 pairing.
- Add exceptional income/expense events and route them through drawdown or savings.
- View summary tiles, spending chart, income chart, and projection table.
- Switch table views or choose custom fields.
- Import a plan, export a plan, export visible table, export formula workbook, export PDF, or create a share link.

## 6. Data model

Primary state lives in the `state` object in `app.js`, initialized from `DEFAULT_STATE` and persisted to `localStorage`.

Key state groups:
- Plan identity and timing: `planName`, `currentYear`, `yearOfBirth`, `currentAge`, `retirementAge`, `retirementYear`, `planYears`, `planToAge`, `planEndMode`, `limitPlanYears`.
- Pension pot: `currentPot`, `currentCrystallisedPot`, `lumpSumAllowanceUsed`, growth scenario rates, post-retirement growth rates, `applyPotGrowth`, tapering options.
- Spending: `incomeRequired`, `incomeAfterYear10`, `billsAnnual`, `holidaysAnnual`, `carCost`, car frequency/start year, CPI toggles.
- Savings: bank, ISA, Premium Bonds, partner savings, interest/growth rates, savings-use toggles.
- Partner details: partner birth year, work income, state pension, work pension, CPI settings.
- Tax: own state pension, state pension growth, tax allowance CPI, tax band CPI rate/frequency/start year.
- Drawdown: regular drawdown, tax optimisation mode, TFLS by 75, maximise basic-rate drawdown, force 25/75 pairing, year-one TFLS settings.
- Events: user-added exceptional income/expense items with amount, timing, taxable flag, and routing.
- UI state: table view, selected custom fields, granular toggles, panel visibility, chart modes.
- Theme state: active theme (`original` | `bright` | `dark` | `metallic` | `custom`), custom hue sliders (bgHue, tileHue, canvasHue, textHue), background mode (`photo` | `soft` | `vivid` | `plain`), panel transparency value (20–100). All persisted to `localStorage` under `pension-forecaster-theme-v1`.

Projection output is created by `calculateProjection(source)` and returns derived rows with annual fields such as age, income, bills, holidays, tax, TFLS, taxable drawdown, savings used/left, pot balances, crystallisation, and free cash.

## 7. Important business rules

- Rates are stored as decimals internally; user inputs display percentage values.
- `normaliseState()` is the gatekeeper for defaults, migration, clamping, and linked fields.
- `planYears` and `planToAge` are linked; editing one should update the other without fighting the user.
- Current year is derived from the browser date and is not a user-editable assumption.
- Personal allowance and tax bands can inflate separately.
- Tax band CPI applies to basic-rate limit, higher-rate limit, and allowance taper start from the configured calendar year, then every N years.
- Bills and holidays CPI treat entered values as today’s values and inflate from current year to each plan year when enabled.
- Income can be treated as relative to today or relative to retirement depending on `incomeValuesRelativeToToday`.
- TFLS is limited by remaining lump sum allowance and available uncrystallised pension.
- When forced 25/75 pairing is enabled, same-year TFLS should be supported by taxable drawdown where possible.
- Maximise drawdown aims to use available basic-rate band and preserve savings, subject to pot and TFLS constraints.
- Savings are allocated in defined order where relevant, with ISA and Premium Bonds treated as tax-free growth/prizes and bank interest subject to PSA/tax.
- Import should preserve known fields and tolerate older saved/exported formats where practical.
- Export plan JSON should remain backward-compatible for downstream tools; do not rename or remove existing fields without user agreement.

## 8. Design/UI rules

Use `STYLE_GUIDE.md` as the source of truth for visual style.

Current UI rules:
- Single-screen app, not a marketing landing page.
- Left control panel with grouped panels; right/main area shows summary, charts, and projection table.
- Preserve existing theme system and CSS custom properties; see `STYLE_GUIDE.md` for tokens and patterns.
- Keep controls compact and scannable.
- Use existing button, dropdown, toggle, modal, table, and panel patterns.
- Avoid adding new visual systems unless necessary.
- For input changes, keep labels short and aligned with nearby related fields.
- Maintain responsive behaviour in `styles.css`; check narrow layouts when moving controls.
- Avoid large explanatory text in the app UI unless the user explicitly asks for it.

Theme panel behaviour:
- Opened by the 36 px colour-sphere button (top-right of header); uses `.open` class toggle, not `hidden` attribute.
- Contains: Theme chips (Classic / Bright / Dark / Metal / Custom), Background section (Mode select + Image file input), Panel Glass section (Transparency slider 20–100 %), Custom Colours section (visible only in Custom theme).
- `applyPanelTransparency()` sets `--panel-a/b/c`, `--panel`, `--panel-strong`, all `--card-*` vars, and `--table-bg` on `document.body` so every surface responds immediately.
- `applyBackgroundMode()` controls `--bg-image` and `--bg-opacity` on `body::before`. Classic (`original`) theme forces `body::before { opacity: 0 }` via CSS so it always uses the parchment gradient; other themes respect the Mode selector.
- Version badge click: shows last-modified date for ~2.5 s then reverts to the version string. Behaviour is in `showVersionChangeDate()` in `app.js`.

Adding a new theme:
1. Add a preset object to `THEME_PRESETS` in `app.js`.
2. Add the theme name to the valid-themes list in `loadThemePrefs()`.
3. Add a chip to the `.theme-chips` div in `index.html`.
4. Add `html[data-theme="name"] body::after` (gradient overlay), `h1`, panel shimmer, and table/sticky-column overrides in `styles.css`.
5. Add a case to `getPanelBaseRgb()` and `getCardBaseRgbs()` in `app.js` so the transparency slider uses the correct base colours.
6. Add a `backgroundColor` case in `applyTheme()` in `app.js`.

## 9. Known issues

- No automated tests; regression checks are manual.
- `app.js` is large and contains state, model, rendering, exports, themes, and event handling in one file.
- Projection formula export is complex string-based spreadsheet generation; changes need careful syntax checks.
- Tax logic is simplified to the app’s modelling needs and should not be treated as financial advice.
- There is ongoing risk of app calculations and exported formula workbook calculations drifting apart.
- Existing user/local changes may be present in the working tree; inspect `git status` before editing.

## 10. Next planned work

1. Add lightweight regression tests around projection cases: TFLS, 25/75 pairing, maximise drawdown, CPI timing, savings allocation, and tax-band CPI.
2. Split calculation logic from rendering/export code so future changes are easier to validate.
3. Add a small set of golden plan JSON fixtures for known scenarios.
4. Strengthen import/export versioning and document exported plan JSON shape.
5. Review formula workbook coverage against current app model and mark any intentional limitations.
6. Improve validation messaging for impossible or conflicting assumptions.
7. Keep `README.md` and this map updated when major features change.

## 11. How to run the app

Install:

No install step is required.

Run locally:

Open `index.html` directly in a browser, or run a static server:

```bash
python3 -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/index.html
```

Build:

No build step.

Deploy:

Deploy `index.html`, `styles.css`, `app.js`, `background.jpeg`, `README.md`, and any documentation files to a static host such as GitHub Pages. The background photo must be in the same directory as `index.html`.

## 12. AI working instructions

- Read this file first.
- Check `git status --short` before editing.
- Do not rewrite working code unnecessarily.
- Preserve existing UI style and theme system.
- Prefer small, scoped changes.
- Ask before changing exported plan JSON structure, stored state keys, or import compatibility.
- Explain assumptions when modelling pension/tax behaviour.
- Keep app calculations and formula workbook exports aligned when changing projection logic.
- Use `rg` for search.
- Use `apply_patch` for manual file edits.
- Run `node --check app.js` after JavaScript edits.
- For UI changes, smoke test in a browser or clearly state if it was not done.
- Do not revert unrelated local changes.
- Explain key helpers and structure when adding non-trivial logic.
