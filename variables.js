/**
 * Weather App — config and DOM references.
 * Load before script.js. Uses var so script.js can access these globals.
 */

/* API config */
var NWS_BASE = 'https://api.weather.gov';
var GEOCODER_URL = 'https://nominatim.openstreetmap.org/search';
var USER_AGENT = 'WeatherApp/1.0 (https://github.com/weather-app)';
var nwsHeaders = { 'User-Agent': USER_AGENT };

/* DOM elements */
var searchForm = document.getElementById('searchForm');
var searchInput = document.getElementById('searchInput');
var searchBtn = document.getElementById('searchBtn');
var message = document.getElementById('message');
var weatherCard = document.getElementById('weatherCard');
var locationEl = document.getElementById('location');
var dateEl = document.getElementById('date');
var tempEl = document.getElementById('temp');
var feelsLikeEl = document.getElementById('feelsLike');
var descriptionEl = document.getElementById('description');
var sunriseEl = document.getElementById('sunrise');
var sunsetEl = document.getElementById('sunset');
var humidityEl = document.getElementById('humidity');
var windEl = document.getElementById('wind');
var btnCelsius = document.getElementById('btnCelsius');
var btnFahrenheit = document.getElementById('btnFahrenheit');
