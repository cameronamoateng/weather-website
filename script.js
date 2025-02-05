// 🔑 OpenWeatherMap API Key 
const API_KEY = "f23ee9deb4e1a7450f3157c44ed020e1"; 

// 🎯 Event Listener for "Get Weather" Button
document.getElementById("fetch-weather").addEventListener("click", () => {
    const city = document.getElementById("location-input").value.trim(); // Get city name from input field

    if (city) {
        fetchWeather(city); // If input is valid, fetch weather data
    } else {
        showError("Please enter a city name."); // Show error if input is empty
    }
});

// 🎤 Event Listener for Voice Recognition Button
document.getElementById("mic-button").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)(); // Initialize Speech API
    recognition.lang = "en-US"; // Set recognition language to English

    recognition.onstart = () => {
        document.getElementById("location-input").placeholder = "Listening..."; // Update placeholder while listening
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript; // Capture spoken text
        document.getElementById("location-input").value = spokenText; // Fill input field with recognized text
        fetchWeather(spokenText); // Fetch weather for the recognized city name
    };

    recognition.onerror = () => {
        showError("Voice recognition failed. Try again."); // Handle errors
    };

    recognition.start(); // Start listening
});

// 🌍 Function to Fetch Weather Data Based on City Name
const fetchWeather = async (city) => {
    try {
        // 1️⃣ Get the latitude and longitude from OpenWeatherMap Geocoding API
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl); // Fetch location data
        const geoData = await geoResponse.json(); // Convert response to JSON
        console.log(geoData)
        if (geoData.length === 0) { 
            showError("City not found. Try another name."); // Handle invalid city names
            return;
        }

        const { lat, lon, name } = geoData[0]; // Extract latitude, longitude, and city name

        // 2️⃣ Fetch Current Weather Data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl); // Fetch weather data
        const weatherData = await weatherResponse.json(); // Convert response to JSON
        console.log(weatherData)
        // 3️⃣ Fetch 5-Day Weather Forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl); // Fetch forecast data
        const forecastData = await forecastResponse.json(); // Convert response to JSON
        console.log(forecastData); 
        // ✅ Display Weather Data
        displayWeather(weatherData, name);
        displayForecast(forecastData);

    } catch (error) {
        showError("Failed to fetch weather data. Please try again later."); // Handle network or API errors
    }
};

// ☀️ Function to Display Current Weather Data
const displayWeather = (data, cityName) => {
    document.getElementById("location-name").textContent = cityName; // Update city name in UI
    document.getElementById("temperature").textContent = `${data.main.temp}°C`; // Display temperature
    document.getElementById("weather-description").textContent = data.weather[0].description; // Show weather condition
    updateBackground(data.weather[0].description.toLowerCase());
    document.getElementById("error-message").classList.add("d-none"); // Hide error message (if any)
};

     const updateBackground = (weatherCondition) => {
      let backgroundUrl;


    // Define a mapping of weather conditions to background images
    switch (weatherCondition) {
        case "clear sky":
            backgroundUrl = "url('images/sunny-day.jpg')";
            break;
        case "few clouds":
        case "scattered clouds":
        case "broken clouds":
            backgroundUrl = "url('images/cloudy-day.jpg')";
            break;
        case "rain":
        case "moderate rain":
        case "heavy rain":
            backgroundUrl = "url('images/rainy-day.jpg')";
            break;
        case "snow":
            backgroundUrl = "url('images/snowy-day.jpg')";
            break;
        case "thunderstorm":
            backgroundUrl = "url('images/thunderstorm-day.jpg')";
            break;
        default:
            backgroundUrl = "url('images/default-day.jpg')"; // Default background if no condition matches
            break;
    }

    // Apply the background image to the body or any container you want
    document.body.style.backgroundImage = backgroundUrl;
    document.body.style.backgroundSize = "cover";  // Ensures the image covers the entire screen
    document.body.style.backgroundPosition = "center";  // Center the image
};


// 📆 Function to Display 5-Day Weather Forecast
const displayForecast = (data) => {
    const forecastContainer = document.getElementById("forecast-display");
    forecastContainer.innerHTML = ""; // Clear previous forecast data

    const dailyData = {}; // Object to store first weather entry of each day

    // Loop through forecast data (list contains multiple entries per day)
    data.list.forEach((entry) => {
        const date = entry.dt_txt.split(" ")[0]; // Extract date (YYYY-MM-DD)
        if (!dailyData[date]) {
            dailyData[date] = entry; // Store the first weather record for each day
        }
    });

    // Loop through stored daily data (only first 5 days)
    Object.values(dailyData).slice(0, 5).forEach((day) => {
        const date = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "long" }); // Convert date to readable format
        const temp = day.main.temp; // Get temperature
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`; // Weather icon URL
        const description = day.weather[0].description; // Weather condition

        // 📌 Create Forecast Card (HTML)
        const forecastCard = `
            <div class="col-md-2 text-center">
                <h6>${date}</h5>
                <img src="${icon}" alt="${description}">
                <p class="mb-0">${temp}°C</p>
                <p class="text-muted">${description}</p>
            </div>
        `;
        forecastContainer.innerHTML += forecastCard; // Add forecast to UI
    });
};

// ❌ Function to Show Error Messages
const showError = (message) => {
    const errorBox = document.getElementById("error-message"); // Get error message container
    errorBox.textContent = message; // Update error text
    errorBox.classList.remove("d-none"); // Show error message
};