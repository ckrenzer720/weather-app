/**
 * Weather App — Scaffold
 * Form submit → fetch weather → update DOM; °C/°F toggle; loading/error states.
 */

// DOM references (to be used in later steps)
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const message = document.getElementById('message');
const weatherCard = document.getElementById('weatherCard');
const locationEl = document.getElementById('location');
const dateEl = document.getElementById('date');
const tempEl = document.getElementById('temp');
const feelsLikeEl = document.getElementById('feelsLike');
const descriptionEl = document.getElementById('description');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const btnCelsius = document.getElementById('btnCelsius');
const btnFahrenheit = document.getElementById('btnFahrenheit');

// Form submit — will call API and update DOM (step 4)
function handleSubmit(event) {
  event.preventDefault();
  // TODO: get search value, fetch weather, update DOM
}

// Unit toggle — will convert and re-render temp (step 5)
function setUnitCelsius() {}
function setUnitFahrenheit() {}

// Attach listeners (scaffold only; logic in later steps)
if (searchForm) searchForm.addEventListener('submit', handleSubmit);
if (btnCelsius) btnCelsius.addEventListener('click', setUnitCelsius);
if (btnFahrenheit) btnFahrenheit.addEventListener('click', setUnitFahrenheit);
