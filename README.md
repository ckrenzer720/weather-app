# Weather App

Weather app: current conditions for a location, with temperature in °C/°F, sunrise/sunset, and humidity/wind. Uses **api.weather.gov** (NWS) and **Nominatim** for geocoding.

## Run the app

```bash
npm install
npm start
```

Then open **http://localhost:5000**. Search by city (e.g. "Austin, TX"). NWS data is for US locations.

## Testing

Tests live in **`tests/`** and use **Jest**.

- **Unit tests** — `tests/weatherLogic.test.js` (parsing, formatting, °C/°F, wind cardinal).
- **API tests (mocked)** — `tests/api.test.js` (geocoder and NWS URLs, request shape, error handling).
- **API integration tests (real)** — `tests/api.integration.test.js` (optional; calls live APIs).

### Commands

```bash
npm test              # Run unit + mocked API tests (fast, no network)
npm run test:watch    # Run tests in watch mode
npm run test:integration   # Run integration tests (real geocoder + NWS)
```

Integration tests are **skipped** by default so `npm test` stays fast and works offline. Use `npm run test:integration` when you want to verify the real APIs.

### Structure

- **`lib/weatherLogic.js`** — Pure logic (exported) used by the app and by tests: `cToF`, `formatDate`, `formatTimeISOtoLocal`, `windDegreesToCardinal`, `parseObservation`, `parsePoints`.
- **`script.js`** — UI and fetch flow; imports from `lib/weatherLogic.js`.

## Planning

- **Production document:** [PRODUCTION.md](./PRODUCTION.md) — goals, features, API, scaffolding.
- **API reference:** [API-REFERENCE.md](./API-REFERENCE.md) — api.weather.gov endpoints used.
