/**
 * Unit tests for lib/weatherLogic.js
 */

import {
  cToF,
  formatDate,
  formatTimeISOtoLocal,
  windDegreesToCardinal,
  parseObservation,
  parsePoints,
} from '../lib/weatherLogic.js';

describe('cToF', () => {
  it('converts 0°C to 32°F', () => {
    expect(cToF(0)).toBe(32);
  });

  it('converts 100°C to 212°F', () => {
    expect(cToF(100)).toBe(212);
  });

  it('converts negative Celsius', () => {
    expect(cToF(-40)).toBe(-40);
  });

  it('returns null for null', () => {
    expect(cToF(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(cToF(undefined)).toBeNull();
  });
});

describe('windDegreesToCardinal', () => {
  it('returns N for 0', () => {
    expect(windDegreesToCardinal(0)).toBe('N');
  });

  it('returns N for 360', () => {
    expect(windDegreesToCardinal(360)).toBe('N');
  });

  it('returns E for 90', () => {
    expect(windDegreesToCardinal(90)).toBe('E');
  });

  it('returns S for 180', () => {
    expect(windDegreesToCardinal(180)).toBe('S');
  });

  it('returns W for 270', () => {
    expect(windDegreesToCardinal(270)).toBe('W');
  });

  it('returns NE for 45', () => {
    expect(windDegreesToCardinal(45)).toBe('NE');
  });

  it('returns null for null', () => {
    expect(windDegreesToCardinal(null)).toBeNull();
  });

  it('returns null for NaN', () => {
    expect(windDegreesToCardinal(Number.NaN)).toBeNull();
  });
});

describe('formatDate', () => {
  it('returns — for empty string', () => {
    expect(formatDate('')).toBe('—');
  });

  it('returns — for null/undefined', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('formats valid ISO date string', () => {
    const result = formatDate('2025-02-12T15:30:00Z');
    expect(result).not.toBe('—');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatTimeISOtoLocal', () => {
  it('returns — for empty string', () => {
    expect(formatTimeISOtoLocal('')).toBe('—');
  });

  it('returns — for null', () => {
    expect(formatTimeISOtoLocal(null)).toBe('—');
  });

  it('formats valid ISO time string', () => {
    const result = formatTimeISOtoLocal('2025-02-12T12:30:00Z');
    expect(result).not.toBe('—');
    expect(typeof result).toBe('string');
  });
});

describe('parsePoints', () => {
  it('extracts location name from relativeLocation', () => {
    const pointData = {
      properties: {
        relativeLocation: {
          properties: { city: 'Austin', state: 'TX' },
        },
        timeZone: 'America/Chicago',
        observationStations: 'https://api.weather.gov/gridpoints/EWX/1,2/stations',
      },
    };
    const result = parsePoints(pointData);
    expect(result.locationName).toBe('Austin, TX');
    expect(result.timeZone).toBe('America/Chicago');
    expect(result.observationStations).toBe('https://api.weather.gov/gridpoints/EWX/1,2/stations');
  });

  it('returns Unknown when no city/state', () => {
    const pointData = { properties: {} };
    const result = parsePoints(pointData);
    expect(result.locationName).toBe('Unknown');
  });

  it('includes sunrise/sunset when astronomicalData present', () => {
    const pointData = {
      properties: {
        relativeLocation: { properties: {} },
        timeZone: 'America/Chicago',
        astronomicalData: {
          sunrise: '2025-02-12T12:00:00-06:00',
          sunset: '2025-02-12T18:00:00-06:00',
        },
      },
    };
    const result = parsePoints(pointData);
    expect(typeof result.sunrise).toBe('string');
    expect(typeof result.sunset).toBe('string');
    // Formatted time or fallback; in some envs toLocaleTimeString may differ
    expect(result.sunrise.length).toBeGreaterThan(0);
    expect(result.sunset.length).toBeGreaterThan(0);
  });

  it('returns — for sunrise/sunset when no astronomicalData', () => {
    const pointData = {
      properties: {
        relativeLocation: { properties: {} },
        observationStations: 'https://example.com/stations',
      },
    };
    const result = parsePoints(pointData);
    expect(result.sunrise).toBe('—');
    expect(result.sunset).toBe('—');
  });
});

describe('parseObservation', () => {
  it('parses temperature in Celsius', () => {
    const obs = {
      properties: {
        temperature: { value: 22, unitCode: 'wmoUnit:degC' },
        timestamp: '2025-02-12T15:00:00Z',
      },
    };
    const result = parseObservation(obs, 'America/Chicago');
    expect(result.tempC).toBe(22);
  });

  it('converts Fahrenheit to Celsius', () => {
    const obs = {
      properties: {
        temperature: { value: 72, unitCode: 'wmoUnit:degF' },
        timestamp: '2025-02-12T15:00:00Z',
      },
    };
    const result = parseObservation(obs);
    expect(result.tempC).toBeCloseTo(22.22, 1);
  });

  it('parses humidity and wind', () => {
    const obs = {
      properties: {
        temperature: { value: 20, unitCode: 'wmoUnit:degC' },
        relativeHumidity: { value: 65 },
        windSpeed: { value: 10 },
        windDirection: { value: 270 },
        timestamp: '2025-02-12T15:00:00Z',
      },
    };
    const result = parseObservation(obs);
    expect(result.humidity).toBe(65);
    expect(result.windText).toContain('W');
    expect(result.windText).toContain('10 mph');
  });

  it('parses textDescription', () => {
    const obs = {
      properties: {
        temperature: { value: 15, unitCode: 'wmoUnit:degC' },
        textDescription: 'Partly Cloudy',
        timestamp: '2025-02-12T15:00:00Z',
      },
    };
    const result = parseObservation(obs);
    expect(result.description).toBe('Partly Cloudy');
  });

  it('handles observation with properties at top level (non-GeoJSON)', () => {
    const obs = {
      temperature: { value: 18, unitCode: 'wmoUnit:degC' },
      timestamp: '2025-02-12T15:00:00Z',
    };
    const result = parseObservation(obs);
    expect(result.tempC).toBe(18);
  });
});
