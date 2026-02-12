/**
 * Weather App — api.weather.gov + Nominatim geocoder
 * Flow: geocode (city → lat,lon) → points → stations → observation → display.
 * Unit toggle: store data in °C, display °C or °F.
 * Note: NWS has data for US only; non-US searches will geocode but may get no weather.
 * Config and DOM refs: variables.js
 */

let currentData = null; // { locationName, date, tempC, feelsLikeC, description, sunrise, sunset, humidity, windText }

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

function cToF(c) {
  if (c == null) return null;
  return (c * 9) / 5 + 32;
}

function formatTimeISOtoLocal(isoString, timeZone) {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString(timeZone || undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function formatDate(isoString, timeZone) {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(timeZone || undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
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

async function geocodeAddress(address) {
  const params = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    limit: '1',
  });
  const res = await fetch(`${GEOCODER_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
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

async function fetchPoints(lat, lon) {
  const url = `${NWS_BASE}/points/${lat},${lon}`;
  const res = await fetch(url, { headers: nwsHeaders });
  if (!res.ok) return null;
  return res.json();
}

async function fetchStations(stationsUrl) {
  const res = await fetch(stationsUrl, { headers: nwsHeaders });
  if (!res.ok) return null;
  const data = await res.json();
  const ids = data.features?.map((f) => f.properties?.stationIdentifier).filter(Boolean);
  return ids && ids.length ? ids[0] : null;
}

async function fetchLatestObservation(stationId) {
  const url = `${NWS_BASE}/stations/${stationId}/observations/latest`;
  const res = await fetch(url, { headers: nwsHeaders });
  if (!res.ok) return null;
  return res.json();
}

function parseObservation(obs, timeZone) {
  const props = obs.properties || obs;
  const temp = props.temperature?.value;
  const unitCode = (props.temperature?.unitCode || '').toLowerCase();
  const tempC = temp != null && unitCode.includes('f') ? ((temp - 32) * 5) / 9 : temp;

  let feelsLikeC = props.heatIndex?.value ?? props.windChill?.value ?? null;
  if (feelsLikeC != null && (props.heatIndex?.unitCode || props.windChill?.unitCode || '').toLowerCase().includes('f')) {
    feelsLikeC = ((feelsLikeC - 32) * 5) / 9;
  }

  const humidity = props.relativeHumidity?.value ?? null;
  const windSpeed = props.windSpeed?.value;
  const windDir = props.windDirection?.value;
  let windText = '—';
  if (windSpeed != null) {
    const speed = Math.round(windSpeed);
    windText = windDir != null ? `${windDir} ${speed} mph` : `${speed} mph`;
  }

  const timestamp = props.timestamp;
  const date = formatDate(timestamp, timeZone);

  return {
    tempC: tempC != null ? Number(tempC) : null,
    feelsLikeC: feelsLikeC != null ? Number(feelsLikeC) : null,
    description: props.textDescription || null,
    humidity,
    windText,
    date,
  };
}

function parsePoints(pointData) {
  const props = pointData.properties || {};
  const rel = props.relativeLocation?.properties || {};
  const city = rel.city || '';
  const state = rel.state || '';
  const locationName = [city, state].filter(Boolean).join(', ') || 'Unknown';

  const timeZone = props.timeZone || undefined;
  let sunrise = '—';
  let sunset = '—';
  const astro = props.astronomicalData;
  if (astro) {
    sunrise = formatTimeISOtoLocal(astro.sunrise, timeZone);
    sunset = formatTimeISOtoLocal(astro.sunset, timeZone);
  }

  return {
    locationName,
    timeZone,
    sunrise,
    sunset,
    observationStations: props.observationStations,
  };
}

async function handleSubmit(event) {
  event.preventDefault();
  const query = searchInput?.value?.trim();
  if (!query) return;

  setMessage('Loading…');
  setLoading(true);
  showWeatherCard(false);

  try {
    const coords = await geocodeAddress(query);
    if (!coords) {
      setMessage('Location not found. Try "City" or "City, State" (e.g. Austin, TX).');
      return;
    }

    const pointData = await fetchPoints(coords.lat, coords.lon);
    if (!pointData) {
      setMessage('Could not get weather for this location.');
      return;
    }

    const point = parsePoints(pointData);
    const stationId = await fetchStations(point.observationStations);
    if (!stationId) {
      setMessage('No weather station data for this location.');
      return;
    }

    const obsData = await fetchLatestObservation(stationId);
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
