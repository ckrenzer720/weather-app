# api.weather.gov — Endpoints used by this app

Base URL: **https://api.weather.gov**

**Required header on every request:**
```http
User-Agent: WeatherApp/1.0 (your@email.com)
```
*(Replace with your app name and contact info.)*

---

## Call order for “current weather” flow

### 1. Get point metadata (grid, location name, sunrise/sunset)

```
GET /points/{latitude},{longitude}
```

- **Parameters:** `latitude`, `longitude` (e.g. `39.7456,-97.0892`).
- **Use from response:**
  - `properties.relativeLocation.properties.city`, `.state` — display name
  - `properties.gridId`, `properties.gridX`, `properties.gridY` — for gridpoints and stations
  - `properties.forecastOffice` — office ID (same as gridId for WFO)
  - `properties.astronomicalData` — **sunrise**, **sunset** (ISO 8601)
  - `properties.observationStations` — URL to get station list

### 2. Get observation stations for this grid

```
GET /gridpoints/{wfo}/{x},{y}/stations
```

- **Parameters:** `wfo` = forecast office ID (e.g. from point), `x` = gridX, `y` = gridY.
- **Use from response:** `features[0].properties.stationIdentifier` (or first station) for step 3.

### 3. Get latest observation (current conditions)

```
GET /stations/{stationId}/observations/latest
```

- **Parameters:** `stationId` = station identifier from step 2.
- **Use from response:**
  - `properties.temperature.value` + `unitCode` — current temp (convert to °C/°F as needed)
  - `properties.relativeHumidity.value` — humidity %
  - `properties.windSpeed.value`, `properties.windDirection.value` — wind
  - `properties.textDescription` — short conditions text
  - `properties.heatIndex.value` / `properties.windChill.value` — “feels like” when present

---

## Other endpoints (available, not required for MVP)

- **GET /gridpoints/{wfo}/{x},{y}/forecast** — Text forecast periods (temp, shortForecast).
- **GET /gridpoints/{wfo}/{x},{y}/forecast/hourly** — Hourly forecast.
- **GET /alerts/active** — Active weather alerts (optional).
- **GET /stations** — List all stations (we use grid-specific stations instead).

All endpoints return JSON. See [api.weather.gov OpenAPI spec](https://api.weather.gov/openapi.json) for full schemas.
