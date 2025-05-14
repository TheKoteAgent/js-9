# Практичні завдання з Асинхронного програмування

## Завдання 1: Погодний віджет

**API**: OpenWeatherMap
**Складність**: ⭐⭐

Створіть простий віджет погоди, який показує поточну погоду для вказаного міста.

**Вимоги:**

1. Створіть форму з полем введення назви міста
2. При відправці форми виконайте запит до OpenWeatherMap API
3. Відобразіть:
   - Температуру
   - Опис погоди
   - Іконку погоди
   - Вологість
   - Швидкість вітру
4. Додайте обробку помилок (наприклад, місто не знайдено)

**Бонусні бали:**

- Додайте можливість перемикання між °C і °F
- Збережіть останнє шукане місто в localStorage

# Покрокова інструкція реалізації Weather Widget

## Етап 1: Базова структура та API

### Крок 1.1: Налаштування конфігурації

```javascript
// Базові константи для роботи з API
const API_KEY = "your_api_key";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Отримуємо DOM елементи
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
```

### Крок 1.2: Створення базової функції отримання погоди

```javascript
async function getWeather(city) {
  try {
    let xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = () => {
      if (xhr.status === 200) {
        displayWeather(xhr.response);
      } else {
        console.error("Місто не знайдено");
      }
    };
  } catch (error) {
    console.error(error);
  }
}
```

### Крок 1.3: Базове відображення даних

```javascript
function displayWeather(data) {
  weatherInfo.innerHTML = `
        <h2>${data.name}</h2>
        <p>Температура: ${Math.round(data.main.temp)}°C</p>
        <p>Опис: ${data.weather[0].description}</p>
    `;
  weatherInfo.classList.remove("hidden");
}

// Додаємо обробку події submit
weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  getWeather(city);
});
```

**Що робить цей етап:**

- Встановлює базову конфігурацію API
- Створює просту функцію для отримання погоди
- Показує базову інформацію про погоду

## Етап 2: Покращення інтерфейсу

### Крок 2.1: Додавання лоадера

```javascript
const loader = document.getElementById("loader");

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

// Оновлюємо функцію getWeather
function getWeather(city) {
  try {
    showLoader();
    // ... існуючий код
  } finally {
    hideLoader();
  }
}
```

### Крок 2.2: Покращення відображення даних

```javascript
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

function displayWeather(data) {
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  description.textContent = data.weather[0].description;
  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${data.wind.speed} м/с`;

  showWeatherInfo();
}

function showWeatherInfo() {
  weatherInfo.classList.remove("hidden");
}
```

**Що робить цей етап:**

- Додає індикатор завантаження
- Покращує відображення даних
- Додає іконки погоди

## Етап 3: Додавання конвертації температури

### Крок 3.1: Додавання перемикача

```javascript
const unitToggle = document.querySelectorAll('input[name="unit"]');

unitToggle.forEach((radio) => {
  radio.addEventListener("change", () => {
    const city = cityInput.value.trim();
    if (city) {
      getWeather(city);
    }
  });
});
```

### Крок 3.2: Оновлення функції відображення

```javascript
function displayWeather(data) {
  const selectedUnit = document.querySelector(
    'input[name="unit"]:checked'
  ).value;
  const temp =
    selectedUnit === "celsius" ? data.main.temp : (data.main.temp * 9) / 5 + 32;

  temperature.textContent = `${Math.round(temp)}°${
    selectedUnit === "celsius" ? "C" : "F"
  }`;
  // ... інший код
}
```

**Що робить цей етап:**

- Додає можливість перемикання між °C та °F
- Оновлює відображення температури при зміні одиниць виміру

## Етап 4: Додавання кешування

### Крок 4.1: Налаштування кешування

```javascript
const CACHE_DURATION = 3 * 60 * 1000; // 3 хвилини

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

  data.lastUpdate = {
    timestamp,
    timeElapsed,
  };

  return data;
}

function cacheData(city, data) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  const cacheData = {
    data,
    timestamp: new Date().getTime(),
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheData));
}
```

### Крок 4.2: Інтеграція кешування

```javascript
async function getWeather(city) {
  try {
    showLoader();
    hideWeatherInfo();

    const cachedData = getCachedData(city);
    if (cachedData) {
      displayWeather(cachedData);
      return;
    }

    // ... існуючий код отримання даних
    cacheData(city, data);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
}

function showError(message) {
  weatherInfo.textContent = message;
  weatherInfo.classList.remove("hidden");
}

function hideWeatherInfo() {
  weatherInfo.classList.add("hidden");
}
```

**Що робить цей етап:**

- Додає кешування даних в localStorage
- Перевіряє наявність кешованих даних перед запитом
- Автоматично очищує застарілі дані

## Етап 5: Автоматичне оновлення

### Крок 5.1: Додавання таймера

```javascript
let updateTimer = null;

function scheduleNextUpdate(city, timeLeft) {
  if (updateTimer) {
    clearTimeout(updateTimer);
  }

  updateTimer = setTimeout(() => {
    getWeather(city);
  }, timeLeft);
}
```

### Крок 5.2: Інтеграція автооновлення

```javascript
async function getWeather(city) {
  try {
    // ... існуючий код

    if (cachedData) {
      displayWeather(cachedData);
      const timeLeft = CACHE_DURATION - cachedData.lastUpdate.timeElapsed;
      scheduleNextUpdate(city, timeLeft);
      return;
    }

    // ... код отримання даних
    scheduleNextUpdate(city, CACHE_DURATION);
  } catch (error) {
    showError(error.message);
  }
}
```

**Що робить цей етап:**

- Додає автоматичне оновлення даних
- Встановлює таймер для наступного оновлення
- Скидає таймер при новому запиті

## Етап 6: Покращення користувацького досвіду

### Крок 6.1: Додавання індикатора оновлення

```javascript
function formatTimeElapsed(timeElapsed) {
  const minutes = Math.floor(timeElapsed / 60000);
  const seconds = Math.floor((timeElapsed % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} хв ${seconds} сек тому`;
  }
  return `${seconds} сек тому`;
}

function displayWeather(data, city) {
  // ... існуючий код

  let updateInfo = document.querySelector(".update-info");
  if (!updateInfo) {
    updateInfo = document.createElement("div");
    updateInfo.className = "update-info";
    weatherInfo.appendChild(updateInfo);
  }

  if (data.lastUpdate) {
    const timeLeft = Math.round(
      (CACHE_DURATION - data.lastUpdate.timeElapsed) / 1000
    );
    updateInfo.textContent = `Оновлено: ${formatTimeElapsed(
      data.lastUpdate.timeElapsed
    )}. Наступне оновлення через ${timeLeft} сек`;
  } else {
    updateInfo.textContent = "Щойно оновлено. Наступне оновлення через 3 хв";
  }
}
```

### Крок 6.2: Покращення обробки помилок

```javascript
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  const container = document.querySelector(".container");
  const existingError = container.querySelector(".error-message");

  if (existingError) {
    container.removeChild(existingError);
  }

  container.insertBefore(errorDiv, weatherInfo);

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}
```

**Що робить цей етап:**

- Додає індикатор часу останнього оновлення
- Показує час до наступного оновлення
- Покращує відображення помилок

## Етап 7: Збереження стану

### Крок 7.1: Збереження останнього міста

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeather(lastCity);
  }
});

weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    localStorage.setItem("lastCity", city);
    getWeather(city);
  }
});
```

**Що робить цей етап:**

- Зберігає останнє шукане місто
- Автоматично завантажує погоду для останнього міста
- Покращує користувацький досвід при повторному відвідуванні
