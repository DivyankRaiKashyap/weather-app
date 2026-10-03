// ==========================================
// OM WEATHER APP
// ==========================================

const API_KEY = "709cfbfd79b38ab837a290aa0f2e6f60";


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const errorMessage = document.getElementById("errorMessage");
const loading = document.getElementById("loading");

const currentWeather = document.getElementById("currentWeather");

const cityName = document.getElementById("cityName");
const date = document.getElementById("date");

const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription =
    document.getElementById("weatherDescription");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");

const forecastContainer =
    document.getElementById("forecastContainer");


// ==========================================
// SEARCH BUTTON
// ==========================================

searchButton.addEventListener("click", searchWeather);


// ==========================================
// ENTER KEY
// ==========================================

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        searchWeather();
    }

});


// ==========================================
// SEARCH WEATHER
// ==========================================

async function searchWeather() {

    const city = cityInput.value.trim();


    // Validate input
    if (city === "") {

        showError("Please enter a city name.");

        return;
    }


    if (city.length < 2) {

        showError("Please enter a valid city name.");

        return;
    }


    hideError();
    showLoading();


    try {

        // ======================================
        // CURRENT WEATHER API
        // ======================================

        const currentURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;


        const currentResponse =
            await fetch(currentURL);


        if (!currentResponse.ok) {

            if (currentResponse.status === 401) {
                throw new Error(
                    "Invalid API key. Check your OpenWeatherMap API key."
                );
            }

            if (currentResponse.status === 404) {
                throw new Error(
                    "City not found. Please enter a correct city name."
                );
            }

            throw new Error(
                "Unable to get current weather."
            );
        }


        const currentData =
            await currentResponse.json();


        // ======================================
        // FORECAST API
        // ======================================

        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;


        const forecastResponse =
            await fetch(forecastURL);


        if (!forecastResponse.ok) {

            throw new Error(
                "Unable to get forecast data."
            );
        }


        const forecastData =
            await forecastResponse.json();


        // ======================================
        // DISPLAY DATA
        // ======================================

        displayCurrentWeather(currentData);

        displayForecast(forecastData);


    } catch (error) {

        console.error(error);

        currentWeather.style.display = "none";

        forecastContainer.innerHTML = "";

        showError(error.message);

    } finally {

        hideLoading();

    }

}


// ==========================================
// DISPLAY CURRENT WEATHER
// ==========================================

function displayCurrentWeather(data) {

    currentWeather.style.display = "block";


    // City
    cityName.textContent =
        `${data.name}, ${data.sys.country}`;


    // Date
    const today = new Date();

    date.textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });


    // Temperature
    temperature.textContent =
        Math.round(data.main.temp);


    // Feels like
    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;


    // Humidity
    humidity.textContent =
        `${data.main.humidity}%`;


    // Wind speed
    const wind =
        data.wind.speed * 3.6;

    windSpeed.textContent =
        `${wind.toFixed(1)} km/h`;


    // Description
    weatherDescription.textContent =
        data.weather[0].description;


    // Weather icon
    const icon =
        data.weather[0].icon;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;

}


// ==========================================
// DISPLAY 5-DAY FORECAST
// ==========================================

function displayForecast(data) {

    forecastContainer.innerHTML = "";


    const dailyData = {};


    // Process 3-hour forecast data
    data.list.forEach(function (item) {

        const forecastDate =
            new Date(item.dt * 1000);


        const dateKey =
            forecastDate.toISOString().split("T")[0];


        /*
         * Prefer the forecast around 12:00 PM.
         * Otherwise store the first forecast
         * available for that day.
         */

        const hour =
            forecastDate.getHours();


        if (
            !dailyData[dateKey] ||
            Math.abs(hour - 12) <
            Math.abs(
                new Date(
                    dailyData[dateKey].dt * 1000
                ).getHours() - 12
            )
        ) {

            dailyData[dateKey] = item;

        }

    });


    // Get first 5 days
    const fiveDays =
        Object.values(dailyData).slice(0, 5);


    // Create cards
    fiveDays.forEach(function (item) {

        const forecastDate =
            new Date(item.dt * 1000);


        const day =
            forecastDate.toLocaleDateString(
                "en-IN",
                {
                    weekday: "short"
                }
            );


        const icon =
            item.weather[0].icon;


        const description =
            item.weather[0].description;


        const temp =
            Math.round(item.main.temp);


        const humidityValue =
            item.main.humidity;


        // Create card
        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `
            <h3>${day}</h3>

            <img
                src="https://openweathermap.org/img/wn/${icon}@2x.png"
                alt="${description}"
            >

            <div class="forecast-temp">
                ${temp}°C
            </div>

            <p>${description}</p>

            <small>
                💧 ${humidityValue}%
            </small>
        `;


        forecastContainer.appendChild(card);

    });

}


// ==========================================
// SHOW ERROR
// ==========================================

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";

}


// ==========================================
// HIDE ERROR
// ==========================================

function hideError() {

    errorMessage.style.display =
        "none";

}


// ==========================================
// SHOW LOADING
// ==========================================

function showLoading() {

    loading.style.display =
        "block";

    searchButton.disabled =
        true;

}


// ==========================================
// HIDE LOADING
// ==========================================

function hideLoading() {

    loading.style.display =
        "none";

    searchButton.disabled =
        false;

}


// ==========================================
// DEFAULT CITY
// ==========================================

window.addEventListener("load", function () {

    cityInput.value = "Haridwar";

    searchWeather();

});