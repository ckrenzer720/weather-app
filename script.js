/**
 * Weather App — minimal run
 * Form submit → (later: fetch, DOM update). Unit toggle → (later: convert, re-render).
 */

const searchForm = document.getElementById('searchForm');
const btnCelsius = document.getElementById('btnCelsius');
const btnFahrenheit = document.getElementById('btnFahrenheit');

function handleSubmit(event) {
  event.preventDefault();
}

function setUnitCelsius() {}
function setUnitFahrenheit() {}

if (searchForm) searchForm.addEventListener('submit', handleSubmit);
if (btnCelsius) btnCelsius.addEventListener('click', setUnitCelsius);
if (btnFahrenheit) btnFahrenheit.addEventListener('click', setUnitFahrenheit);
