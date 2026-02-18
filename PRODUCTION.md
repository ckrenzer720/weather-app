# Weather App — Production Document

**Status:** MVP complete  
**Last updated:** Feb 2025

---

## 1. Project overview

### Goal

Build a weather app where users can look up **current weather for any location in the world**. The app will use the **Fetch API** to get live data, and **HTML/CSS/JavaScript** for structure, styling, and behavior.

### Learning focus

- **Fetch API** — requesting weather data from an external API
- **DOM** — reading and updating the page (forms, buttons, dynamic content)
- **CSS** — layout and styling
- **HTML** — semantic structure and accessibility

---

## 2. Features

### Must-have (MVP)

| Feature               | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Location search**   | User can enter a city name (and optionally country) to get weather.                 |
| **Current weather**   | Show current conditions for that location.                                          |
| **Temperature**       | Display current temperature.                                                        |
| **Temperature units** | Support both **Celsius** and **Fahrenheit** (e.g. toggle or switch).                |
| **Sunrise & sunset**  | Show local sunrise and sunset times for the location.                               |
| **Clear feedback**    | Loading state, success (show data), and error (e.g. city not found, network error). |

### Nice-to-have (later)

- “Feels like” temperature
- Short text description (e.g. “Clear sky”, “Light rain”)
- Humidity and wind
- Weather icon
- Remember last-searched city (e.g. `localStorage`)

---

## 3. Tech stack

| Layer        | Technology                                                          |
| ------------ | ------------------------------------------------------------------- |
| **Markup**   | HTML5 (semantic tags, form, accessibility attributes)               |
| **Styling**  | CSS (no framework; custom styles)                                   |
| **Behavior** | Vanilla JavaScript (no frameworks)                                  |
| **Data**     | **api.weather.gov** (NWS) + **Nominatim** (geocoding) via Fetch API |

---

## 4. Data / API

### Source

- **[api.weather.gov](https://api.weather.gov)** (National Weather Service) — free, no API key. Requires a **User-Agent** header identifying the app.
- **Geocoding:** NWS uses latitude/longitude. We need a separate geocoder to turn “city name” into lat/lon (e.g. [Census Geocoder](https://geocoding.geo.census.gov/geocoder/) for US, or accept lat/lon input).

### Endpoints we use (in order)

| Step | Endpoint                                          | Purpose                                                                                                                                      |
| ---- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **GET /points/{latitude},{longitude}**            | Get grid (wfo, gridX, gridY), location name (`relativeLocation`), **sunrise/sunset** (`astronomicalData`), and link to observation stations. |
| 2    | **GET /gridpoints/{wfo}/{x},{y}/stations**        | List observation stations for this grid. We pick the first (or closest) station.                                                             |
| 3    | **GET /stations/{stationId}/observations/latest** | **Current conditions:** temperature, humidity, wind, text description (“feels like” when available).                                         |

**Optional (if we want forecast text instead of or in addition to station observation):**

- **GET /gridpoints/{wfo}/{x},{y}/forecast** — Text forecast periods (temperature, shortForecast). First period can represent “current” conditions.

### What we get from the API

- **From /points:** Location name (city, state), sunrise, sunset.
- **From /stations/…/observations/latest:** Current temp (°C or °F via unitCode), humidity, wind speed/direction, textDescription; heatIndex/windChill for “feels like” when present.

### Security

- No API key. Send **User-Agent** on every request (e.g. `WeatherApp/1.0 (your@email.com)`).

---

## 5. User flows

1. **Open app** → User sees title, tagline, and a search input.
2. **Enter location** → User types a city (e.g. “Tokyo” or “London, UK”) and submits (button or Enter).
3. **Loading** → App shows a loading state (e.g. “Loading…” or spinner).
4. **Success** → App shows:
   - Location name
   - Current temperature (with °C / °F control)
   - Sunrise and sunset times
   - Any extra info we include (description, feels like, etc.)
5. **Error** → App shows a clear message (e.g. “City not found” or “Network error. Try again.”).
6. **Change units** → User can switch between °C and °F; displayed temperature and “feels like” (if shown) update without a new API call.

---

## 6. Project structure (current)

```
weather-app/
├── index.html          # Single-page app (header, search form, weather card, footer)
├── styles.css          # Layout, typography, components, responsive
├── variables.js        # Config (NWS_BASE, GEOCODER_URL, User-Agent) + DOM refs
├── script.js           # Entry (type="module"): fetch flow, DOM updates, °C/°F toggle
├── lib/
│   └── weatherLogic.js # Pure logic: cToF, parsePoints, parseObservation, formatDate, etc.
├── tests/
│   ├── weatherLogic.test.js   # Unit tests for lib
│   ├── api.test.js            # Mocked API tests
│   └── api.integration.test.js # Optional real API tests
├── package.json        # serve, jest, babel-jest, cross-env
├── README.md           # Run app, run tests, project overview
├── API-REFERENCE.md    # api.weather.gov endpoints used
└── PRODUCTION.md       # This document
```

### File roles

| File                    | Purpose                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **index.html**          | Structure; loads variables.js then script.js (module).                                                                            |
| **styles.css**          | All styling; message/card/button/disabled states.                                                                                 |
| **variables.js**        | Globals: API config + getElementById refs. Loaded before script.js.                                                               |
| **script.js**           | Form submit → geocode → points → stations → observation → render; unit toggle; AbortController. Imports from lib/weatherLogic.js. |
| **lib/weatherLogic.js** | Exported pure functions for parsing and formatting; used by app and tests.                                                        |
| **tests/**              | Jest: unit (weatherLogic), mocked API (api), optional integration (api.integration).                                              |

### Out of scope for initial build

- Backend or database
- User accounts or history (beyond optional `localStorage` later)
- Multi-page routing
- Build step or bundler (plain HTML/CSS/JS only)

---

## 7. Dependencies

**Do not install anything yet.** This list is for planning only. Everything we need to have or use for the project:

### Package dependencies (npm / etc.)

| Dependency | Version | Purpose                                            | Install?                                              |
| ---------- | ------- | -------------------------------------------------- | ----------------------------------------------------- |
| _(none)_   | —       | Vanilla HTML/CSS/JS; no build step, no frameworks. | **No** — no `package.json` or `node_modules` planned. |

### External services (no install)

| Service                                                             | Purpose                                        | What you need                                                                                |
| ------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Weather API** (e.g. [OpenWeatherMap](https://openweathermap.org)) | Current weather, temp, sunrise/sunset by city. | Free account + API key. Key will be added later via env or gitignored config; not committed. |

### Browser APIs (built-in; no install)

| API           | Use in project                                                                                |
| ------------- | --------------------------------------------------------------------------------------------- |
| **Fetch API** | `fetch()` to call the weather API and get JSON.                                               |
| **DOM API**   | Query elements, update text/content, show/hide sections, form submit, button click for °C/°F. |

### Optional dev / tooling (do not install yet)

| Tool                                                                                                      | Purpose                                                                          | When / if to use                                                                                  |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Live reload server** (e.g. VS Code “Live Server” extension, or `npx serve`, or `python -m http.server`) | Avoid `file://` CORS issues when calling the weather API from a local HTML file. | Only if opening `index.html` directly causes API errors; then run the app through a local server. |
| **Linter / formatter** (e.g. ESLint, Prettier, stylelint)                                                 | Consistent style and catch simple errors.                                        | Optional; add later if desired.                                                                   |

### Other (no install)

| Item                    | Notes                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Web font** (optional) | If we use something like Google Fonts, it’s a `<link>` in HTML — no package.           |
| **Icons** (optional)    | Weather icons can be emoji, Unicode, or a small SVG/CSS set; no icon library required. |

---

## 8. MVP checklist (done)

- [x] Scaffold — index.html, styles.css, script.js, variables.js
- [x] Markup — Structure and IDs/classes finalized
- [x] API — api.weather.gov + Nominatim; no key needed; User-Agent sent
- [x] DOM — Form submit → geocode → points → stations → observation → fill card
- [x] Units — °C/°F toggle with conversion
- [x] Styles — Layout, card, button, disabled state, responsive
- [x] Errors — Location not found, no station, network error, AbortController
- [x] README — Run app (npm start), run tests (npm test / test:integration)
- [x] Tests — Unit (weatherLogic), mocked API, optional integration

---

## 9. What to do next (suggestions)

**Polish**

- **Remember last search** — Save last query in `localStorage` and prefill or show “Last: Austin, TX” link.
- **Favicon** — Add a small favicon (e.g. sun/cloud) so the tab looks finished.
- **Non-US message** — When NWS returns no data (e.g. city outside US), show: “Weather data is only available for US locations.”

**Deploy**

- **Put it online** — Deploy to GitHub Pages, Netlify, or Vercel (static site; no backend). Update README with the live URL.

**Quality**

- **Lighthouse** — Run Lighthouse in Chrome (Performance, Accessibility, Best Practices) and fix any quick wins.
- **ESLint** — Add `eslint` and a basic config so the codebase stays consistent.

**Nice-to-have (from §2)**

- **Weather icon** — NWS forecast response can include icon URLs; or map `textDescription` to an emoji (e.g. “Clear” → ☀️).
- **More details** — Already have humidity/wind/feels like; could add pressure or “last updated” time from observation.

- ** Remember last search — Save last query in localStorage and prefill the input or show “Last: City, ST.”
  Non-US message — When there’s no NWS data, show: “Weather data is only available for US locations.”
  Favicon — Add a small tab icon (e.g. sun/cloud).
  Deploy
  Put it online — Deploy to GitHub Pages, Netlify, or Vercel (static site), then add the live URL to the README.
  Quality
  Lighthouse — Run in Chrome (DevTools → Lighthouse) and fix easy Performance/Accessibility issues.
  ESLint — Add a basic config and fix reported issues.
  Optional
  Weather icon — Use NWS icon URLs or map description to an emoji (e.g. “Clear” → ☀️).
  “Last updated” — Show the observation time so users know how fresh the data is. **
