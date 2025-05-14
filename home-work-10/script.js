const API_KEY = "your_api_key";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const loader = document.getElementById("loader");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const unitToggle = document.querySelectorAll('input[name="unit"]');

const CACHE_DURATION = 3 * 60 * 1000;

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showWeatherInfo() {
  weatherInfo.classList.remove("hidden");
}

function hideWeatherInfo() {
  weatherInfo.classList.add("hidden");
}

function showError(message) {
  weatherInfo.textContent = message;
  weatherInfo.classList.remove("hidden");
}

function displayWeather(data) {
  const selectedUnit = document.querySelector(
    'input[name="unit"]:checked'
  ).value;
  const temp =
    selectedUnit === "celsius" ? data.main.temp : (data.main.temp * 9) / 5 + 32;

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  temperature.textContent = `${Math.round(temp)}°${
    selectedUnit === "celsius" ? "C" : "F"
  }`;
  description.textContent = data.weather[0].description;
  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${data.wind.speed} м/с`;

  showWeatherInfo();
}

function getCachedData(city) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (!cachedData) return null;

  const { data, timestamp } = JSON.parse(cachedData);
  const now = new Date().getTime();
  const timeElapsed = now - timestamp;

  if (timeElapsed > CACHE_DURATION) {
    localStorage.removeItem(cacheKey);
    return null;
  }

  data.lastUpdate = { timestamp, timeElapsed };
  return data;
}

function cacheData(city, data) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  const cacheData = { data, timestamp: new Date().getTime() };
  localStorage.setItem(cacheKey, JSON.stringify(cacheData));
}

async function getWeather(city) {
  try {
    showLoader();
    hideWeatherInfo();

    const cachedData = getCachedData(city);
    if (cachedData) {
      displayWeather(cachedData);
      return;
    }

    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    if (response.ok) {
      cacheData(city, data);
      displayWeather(data);
    } else {
      showError("Місто не знайдено");
    }
  } catch (error) {
    showError("Щось пішло не так!");
  } finally {
    hideLoader();
  }
}

weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    localStorage.setItem("lastCity", city);
    getWeather(city);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeather(lastCity);
  }
});

unitToggle.forEach((radio) => {
  radio.addEventListener("change", () => {
    const city = cityInput.value.trim();
    if (city) {
      getWeather(city);
    }
  });
});
