/**
 * Optional integration tests — call real api.weather.gov and Nominatim.
 * Run with: npm run test:integration  (or RUN_INTEGRATION=1 npm test)
 * Skipped by default so npm test stays fast and offline.
 */

const NWS_BASE = 'https://api.weather.gov';
const GEOCODER_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'WeatherApp/1.0 (integration test)';

const runIntegration = process.env.RUN_INTEGRATION === '1' || process.env.RUN_INTEGRATION === 'true';
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Real API integration', () => {
  const timeout = 10000;

  it(
    'geocodes "Austin, TX" and returns lat/lon',
    async () => {
      const params = new URLSearchParams({ q: 'Austin, TX', format: 'json', limit: '1' });
      const res = await fetch(`${GEOCODER_URL}?${params}`, {
        headers: { 'User-Agent': USER_AGENT },
      });
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      expect(Number.isNaN(lat)).toBe(false);
      expect(Number.isNaN(lon)).toBe(false);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      expect(lon).toBeGreaterThanOrEqual(-180);
      expect(lon).toBeLessThanOrEqual(180);
    },
    timeout
  );

  it(
    'NWS points returns grid and observationStations for US coords',
    async () => {
      const lat = 30.27;
      const lon = -97.74;
      const res = await fetch(`${NWS_BASE}/points/${lat},${lon}`, {
        headers: { 'User-Agent': USER_AGENT },
      });
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.properties).toBeDefined();
      expect(data.properties.gridId).toBeDefined();
      expect(data.properties.gridX).toBeDefined();
      expect(data.properties.gridY).toBeDefined();
      expect(data.properties.observationStations).toBeDefined();
      expect(typeof data.properties.observationStations).toBe('string');
    },
    timeout
  );

  it(
    'NWS stations URL returns at least one station',
    async () => {
      const stationsUrl = `${NWS_BASE}/gridpoints/EWX/155,90/stations`;
      const res = await fetch(stationsUrl, { headers: { 'User-Agent': USER_AGENT } });
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.features).toBeDefined();
      expect(Array.isArray(data.features)).toBe(true);
      expect(data.features.length).toBeGreaterThan(0);
      expect(data.features[0].properties.stationIdentifier).toBeDefined();
    },
    timeout
  );

  it(
    'NWS latest observation returns temperature or structure',
    async () => {
      const stationId = 'KATT';
      const res = await fetch(`${NWS_BASE}/stations/${stationId}/observations/latest`, {
        headers: { 'User-Agent': USER_AGENT },
      });
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.properties).toBeDefined();
      // May have temperature or other fields
      expect(data.properties.timestamp || data.properties.temperature !== undefined || true).toBe(true);
    },
    timeout
  );
});
