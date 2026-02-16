/**
 * Weather App — api.weather.gov + Nominatim geocoder
 * Flow: geocode (city → lat,lon) → points → stations → observation → display.
 * Config and DOM refs: variables.js. Pure logic: lib/weatherLogic.js
 */

import { cToF, formatDate, formatTimeISOtoLocal, windDegreesToCardinal, parseObservation, parsePoints } from './lib/weatherLogic.js';

let currentData = null; // { locationName, date, tempC, feelsLikeC, description, sunrise, sunset, humidity, windText }
let searchAbortController = null;

function setMessage(text) {
  if (!message) return;
  message.textContent = text;
}

function setLoading(loading) {
  if (searchBtn) searchBtn.disabled = loading;
  if (searchInput) searchInput.disabled = loading;
}

function showWeatherCard(show) {
  if (!weatherCard) return;
  if (show) weatherCard.removeAttribute('hidden');
  else weatherCard.setAttribute('hidden', '');
}

function renderTemp() {
  if (!tempEl || !currentData) return;
  const useF = btnFahrenheit && btnFahrenheit.classList.contains('active');
  const temp = useF ? cToF(currentData.tempC) : currentData.tempC;
  const unit = useF ? '°F' : '°C';
  tempEl.textContent = temp != null ? `${Math.round(temp)}${unit}` : '—';
}

function renderFeelsLike() {
  if (!feelsLikeEl || !currentData) return;
  const useF = btnFahrenheit && btnFahrenheit.classList.contains('active');
  const feels = useF ? cToF(currentData.feelsLikeC) : currentData.feelsLikeC;
  feelsLikeEl.textContent = feels != null ? `Feels like ${Math.round(feels)}${useF ? '°F' : '°C'}` : 'Feels like —';
}

function renderWeather() {
  if (!currentData) return;
  if (locationEl) locationEl.textContent = currentData.locationName || '—';
  if (dateEl) dateEl.textContent = currentData.date || '—';
  renderTemp();
  renderFeelsLike();
  if (descriptionEl) descriptionEl.textContent = currentData.description || '—';
  if (sunriseEl) sunriseEl.textContent = currentData.sunrise ?? '—';
  if (sunsetEl) sunsetEl.textContent = currentData.sunset ?? '—';
  if (humidityEl) humidityEl.textContent = currentData.humidity != null ? `${Math.round(currentData.humidity)}%` : '—';
  if (windEl) windEl.textContent = currentData.windText || '—';
}

async function geocodeAddress(address, signal) {
  const params = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    limit: '1',
  });
  const res = await fetch(`${GEOCODER_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
    signal,
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  const lat = parseFloat(first.lat);
  const lon = parseFloat(first.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

async function fetchPoints(lat, lon, signal) {
  const url = `${NWS_BASE}/points/${lat},${lon}`;
  const res = await fetch(url, { headers: nwsHeaders, signal });
  if (!res.ok) return null;
  return res.json();
}

async function fetchStations(stationsUrl, signal) {
  const res = await fetch(stationsUrl, { headers: nwsHeaders, signal });
  if (!res.ok) return null;
  const data = await res.json();
  const ids = data.features?.map((f) => f.properties?.stationIdentifier).filter(Boolean);
  return ids && ids.length ? ids[0] : null;
}

async function fetchLatestObservation(stationId, signal) {
  const url = `${NWS_BASE}/stations/${stationId}/observations/latest`;
  const res = await fetch(url, { headers: nwsHeaders, signal });
  if (!res.ok) return null;
  return res.json();
}

async function handleSubmit(event) {
  event.preventDefault();
  const query = searchInput?.value?.trim();
  if (!query) return;

  setMessage('Loading…');
  setLoading(true);
  showWeatherCard(false);

  if (searchAbortController) searchAbortController.abort();
  searchAbortController = new AbortController();
  const signal = searchAbortController.signal;

  try {
    const coords = await geocodeAddress(query, signal);
    if (!coords) {
      setMessage('Location not found. Try "City" or "City, State" (e.g. Austin, TX).');
      return;
    }

    const pointData = await fetchPoints(coords.lat, coords.lon, signal);
    if (!pointData) {
      setMessage('Could not get weather for this location.');
      return;
    }

    const point = parsePoints(pointData);
    if (!point.observationStations) {
      setMessage('No weather station data for this location.');
      return;
    }
    const stationId = await fetchStations(point.observationStations, signal);
    if (!stationId) {
      setMessage('No weather station data for this location.');
      return;
    }

    const obsData = await fetchLatestObservation(stationId, signal);
    if (!obsData) {
      setMessage('Could not load current conditions.');
      return;
    }

    const obs = parseObservation(obsData, point.timeZone);
    currentData = {
      locationName: point.locationName,
      date: obs.date,
      tempC: obs.tempC,
      feelsLikeC: obs.feelsLikeC,
      description: obs.description,
      sunrise: point.sunrise,
      sunset: point.sunset,
      humidity: obs.humidity,
      windText: obs.windText,
    };

    setMessage('');
    showWeatherCard(true);
    renderWeather();
  } catch (err) {
    if (err.name === 'AbortError') return;
    setMessage('Something went wrong. Check your connection and try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
}

function setUnitCelsius() {
  if (!btnCelsius || !btnFahrenheit) return;
  btnCelsius.classList.add('active');
  btnCelsius.setAttribute('aria-pressed', 'true');
  btnFahrenheit.classList.remove('active');
  btnFahrenheit.setAttribute('aria-pressed', 'false');
  renderTemp();
  renderFeelsLike();
}

function setUnitFahrenheit() {
  if (!btnCelsius || !btnFahrenheit) return;
  btnFahrenheit.classList.add('active');
  btnFahrenheit.setAttribute('aria-pressed', 'true');
  btnCelsius.classList.remove('active');
  btnCelsius.setAttribute('aria-pressed', 'false');
  renderTemp();
  renderFeelsLike();
}

if (searchForm) searchForm.addEventListener('submit', handleSubmit);
if (btnCelsius) btnCelsius.addEventListener('click', setUnitCelsius);
if (btnFahrenheit) btnFahrenheit.addEventListener('click', setUnitFahrenheit);
