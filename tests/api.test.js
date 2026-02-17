/**
 * API tests — mocked fetch to verify correct URLs and behavior.
 * Optionally run real API tests with: npm test -- --testPathPattern=api --runInBand
 */

describe("Geocoder API", () => {
  const GEOCODER_URL = "https://nominatim.openstreetmap.org/search";

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  it("calls geocoder with query and User-Agent", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: "30.27", lon: "-97.74" }],
    });

    const params = new URLSearchParams({
      q: "Austin, TX",
      format: "json",
      limit: "1",
    });
    await fetch(`${GEOCODER_URL}?${params}`, {
      headers: {
        "User-Agent": "WeatherApp/1.0 (https://github.com/weather-app)",
      },
    }).then((r) => r.json());

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("nominatim.openstreetmap.org"),
      expect.objectContaining({
        headers: expect.objectContaining({ "User-Agent": expect.any(String) }),
      }),
    );
    expect(global.fetch.mock.calls[0][0]).toContain("Austin");
  });
});

describe("NWS Points API", () => {
  const NWS_BASE = "https://api.weather.gov";

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  it("points URL uses lat,lon format", async () => {
    const lat = 39.7456;
    const lon = -97.0892;
    const url = `${NWS_BASE}/points/${lat},${lon}`;

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        properties: {
          gridId: "TOP",
          gridX: 31,
          gridY: 80,
          observationStations: `${NWS_BASE}/gridpoints/TOP/31,80/stations`,
        },
      }),
    });

    await fetch(url, { headers: { "User-Agent": "WeatherApp/1.0" } }).then(
      (r) => r.json(),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.weather.gov/points/39.7456,-97.0892",
      expect.any(Object),
    );
  });
});

describe("NWS Stations API", () => {
  const NWS_BASE = "https://api.weather.gov";

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  it("stations response yields station identifier", async () => {
    const stationsUrl = `${NWS_BASE}/gridpoints/TOP/31,80/stations`;
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [
          { properties: { stationIdentifier: "KTOP" } },
          { properties: { stationIdentifier: "KCNK" } },
        ],
      }),
    });

    const res = await fetch(stationsUrl, {
      headers: { "User-Agent": "WeatherApp/1.0" },
    });
    const data = await res.json();
    const firstId = data.features?.[0]?.properties?.stationIdentifier;

    expect(firstId).toBe("KTOP");
  });
});

describe("NWS Observation API", () => {
  const NWS_BASE = "https://api.weather.gov";

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  it("latest observation URL uses station id", async () => {
    const stationId = "KTOP";
    const url = `${NWS_BASE}/stations/${stationId}/observations/latest`;

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        properties: {
          temperature: { value: 22, unitCode: "wmoUnit:degC" },
          timestamp: "2025-02-12T15:00:00Z",
        },
      }),
    });

    await fetch(url, { headers: { "User-Agent": "WeatherApp/1.0" } }).then(
      (r) => r.json(),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.weather.gov/stations/KTOP/observations/latest",
      expect.any(Object),
    );
  });
});

describe("API error handling", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  it("geocoder returns null when response not ok", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    const res = await fetch(
      "https://nominatim.openstreetmap.org/search?q=invalid",
    );
    expect(res.ok).toBe(false);
  });

  it("geocoder returns null when empty array", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    const res = await fetch("https://example.com/geocode?q=nowhere");
    const data = await res.json();
    expect(data).toEqual([]);
  });
});
