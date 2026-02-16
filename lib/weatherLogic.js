/**
 * Weather App — pure logic for parsing and formatting.
 * Used by script.js and by tests.
 */

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

function windDegreesToCardinal(deg) {
  if (deg == null || Number.isNaN(deg)) return null;
  const cards = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const i = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return cards[i];
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
  const windDirRaw = props.windDirection?.value;
  const windDir = windDegreesToCardinal(windDirRaw) ?? (windDirRaw != null ? String(windDirRaw) : null);
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

export { cToF, formatDate, formatTimeISOtoLocal, windDegreesToCardinal, parseObservation, parsePoints };
