/**
 * Weather App — config and DOM references.
 * Load before script.js.
 */

/* API config */
const NWS_BASE = "https://api.weather.gov";
const GEOCODER_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "WeatherApp/1.0 (https://github.com/weather-app)";
const nwsHeaders = { "User-Agent": USER_AGENT };

/* DOM elements */
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");
const locationEl = document.getElementById("location");
const dateEl = document.getElementById("date");
const tempEl = document.getElementById("temp");
const feelsLikeEl = document.getElementById("feelsLike");
const descriptionEl = document.getElementById("description");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const btnCelsius = document.getElementById("btnCelsius");
const btnFahrenheit = document.getElementById("btnFahrenheit");
