# Weather App — Production Document

**Status:** Planning  
**Last updated:** Feb 6, 2025

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

| Layer        | Technology                                                   |
| ------------ | ------------------------------------------------------------ |
| **Markup**   | HTML5 (semantic tags, form, accessibility attributes)        |
| **Styling**  | CSS (no framework; custom styles)                            |
| **Behavior** | Vanilla JavaScript (no frameworks)                           |
| **Data**     | External weather API (e.g. OpenWeatherMap) via **Fetch API** |

---

## 4. Data / API

### Source

- Use a **free weather API** that provides:
  - Current temperature
  - Sunrise and sunset (Unix timestamps)
  - Optional: description, “feels like”, humidity, wind
- **Example:** [OpenWeatherMap](https://openweathermap.org) “Current Weather” API (free tier).
- **Alternative:** Other providers can be swapped in if needed; we’ll isolate API calls in one place in code.

### What we need from the API (minimum)

- Current temperature (in a standard unit we can convert to °C / °F)
- Sunrise time
- Sunset time
- Location name (for display)

### Security

- API key will **not** be committed to the repo. Use environment variable or a small config file that is gitignored; production doc will note “add API key here” when we implement.

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

## 6. Scaffolding (file and folder structure)

Planned structure with **no implementation yet** — only files and their roles:

```
weather-app/
├── index.html      # Single-page app: structure only (header, search form, weather display area, footer)
├── styles.css      # All styles (layout, typography, components, responsive)
├── script.js       # All behavior (fetch, DOM updates, form submit, °C/°F toggle)
├── README.md       # How to run the app and how to add an API key (no key in repo)
└── PRODUCTION.md   # This document (planning, features, scaffolding)
```

### File roles

| File              | Purpose                                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **index.html**    | One page. Contains: app container, header (title/tagline), search form (input + submit), area for messages (loading/error), main weather card (location, temp, units, sunrise, sunset, optional details), footer. No logic; IDs/classes for JS and CSS. |
| **styles.css**    | Linked from `index.html`. Styles for layout, search form, weather card, unit toggle, and responsive behavior.                                                                                                                                           |
| **script.js**     | Linked from `index.html`. Handles: form submit, Fetch call to weather API, parsing response, updating DOM (temp, sunrise, sunset, units), °C/°F toggle, loading and error states.                                                                       |
| **README.md**     | Short instructions: open `index.html` or use a local server; where to get and how to add API key (e.g. env or config); no API key in repo.                                                                                                              |
| **PRODUCTION.md** | Planning only: goals, features, tech stack, API, user flows, and this scaffolding.                                                                                                                                                                      |

### Out of scope for initial build

- Backend or database
- User accounts or history (beyond optional `localStorage` later)
- Multi-page routing
- Build step or bundler (plain HTML/CSS/JS only)

---

## 7. Next steps (when moving from planning to code)

1. **Scaffold** — Ensure `index.html`, `styles.css`, and `script.js` exist with minimal/empty content where needed.
2. **Markup** — Finalize `index.html` structure and IDs/classes; no styling or logic yet.
3. **API** — Sign up for chosen provider; document where the key will go; implement one Fetch call and log response.
4. **DOM** — Wire form submit and fill the weather card from API data (temp, sunrise, sunset).
5. **Units** — Add °C/°F toggle and conversion.
6. **Styles** — Implement `styles.css` for layout and polish.
7. **Errors** — Handle not found and network errors with clear messages.
8. **README** — Update with run instructions and API key setup.

---

_This document is the single source of truth for the planning stage. No code should be written until this and the scaffolding are reviewed and approved._
