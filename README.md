# Pension Forecaster

A standalone HTML/CSS/JS retirement forecaster based on the workbook `Cashflow - 2026d.xlsx`.

## Open it

Open `index.html` directly in a browser.

## What it does

- Lets you edit core personal details such as pension pot, current age, and retirement age.
- Recalculates the projection instantly as assumptions change.
- Supports import and export of personal details as CSV, with legacy JSON import support.
- Shows summary cards, a trend chart, and summarised, detailed, or granular year-by-year projection tables.
- Uses friendly percentage inputs while keeping stored rates as decimals.
- Adds a tax optimisation mode for drawdown planning that prioritises staying within the basic-rate band, using TFLS and then savings before higher-rate drawdown where possible.
- Exports the visible projection table to Excel, exports a separate formula workbook, and supports browser PDF export.

## Notes

This version mirrors the main spreadsheet logic around growth, inflation, partner income, state pension timing, and drawdown planning. It is a browser-friendly rebuild rather than a cell-for-cell Excel clone, so a few spreadsheet-specific details are simplified.
