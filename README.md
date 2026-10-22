# Vaktbok – shift log for people with many employers

**Live demo:** _(add your GitHub Pages link here)_

## What it is and why
Many people in health, care and child welfare work extra shifts through staffing agencies and for several employers at once. Each employer has its own timesheet, and nobody sees the whole picture. That makes it easy to lose track of hours, to underestimate (or overestimate) next month's pay, and to accidentally book shifts with less than the 11 hours of rest the Norwegian Working Environment Act normally requires.

Vaktbok puts all shifts from all employers in one place.

## Main features
1. **Register shifts across employers** – date, start/end (shifts past midnight are handled), break and a note. A week view draws each shift on a 24-hour strip with the evening/night zone (17–06) shaded.
2. **Automatic hour and pay estimate** – per employer you set hourly rate, evening/night supplement and weekend supplement. The month view shows hours, supplement hours and estimated gross pay per employer.
3. **Rest-time and overlap warnings** – the app flags shifts that start less than 11 hours after the previous one ended, or overlap another shift.

Extras: copy a shift to the next day, export a month to CSV (opens in Excel), copy a plain-text timesheet, demo data, light/dark mode, works on mobile. All data stays in the browser (localStorage) – nothing is sent anywhere, and no personal data is in the repository.

## Tech
Plain HTML, CSS and JavaScript in one file (`index.html`). No build step, no backend. `logic.js` holds the calculation logic (same code is inlined in `index.html`), and `test.js` tests it with Node.

## How I used AI
I used Claude (Anthropic) as my coding partner:
- **Idea:** I described my own everyday problem (shifts for several employers via a staffing agency) and we narrowed it down to the three features above, following the assignment's "pick 2–3 features" advice.
- **Plan:** separated pure logic (time/pay/rest calculations) from the UI, so the logic could be tested on its own.
- **Code:** the AI generated the logic, the UI and the styling from my descriptions in natural language.
- **Test and improve:** we wrote automated tests and fixed issues they and manual testing revealed (see below).

## How I tested and improved it
- **Unit tests (`node test.js`, 17 checks):** day shift with break, evening supplement hours, night shift crossing midnight into Saturday (evening + weekend hours), break longer than the shift (no negative hours), rest-time warning (8 h gap), no false warning with 16 h gap, overlap between two employers, month filtering, CSV escaping.
- **Browser smoke test (jsdom):** loads the page, loads demo data, checks that week bars, shift list, warnings and month totals render without errors.
- **Security:** checked that employer names/notes are HTML-escaped (an `<img onerror>` name is shown as text, not run).
- **Improvements made during testing:** break is now capped so it can't exceed the shift; overlap check compares against the latest-ending previous shift (not only the one right before); a shift that crosses midnight is drawn on both days in the week view; CSV gets a BOM so æøå display correctly in Excel.

## Limitations
Pay is an estimate before tax with simplified supplement rules (one evening/night window, flat weekend supplement). Data is stored per browser, so it does not sync between devices.

## Run locally
Open `index.html` in a browser. Tests: `node test.js`.
