import { state } from "./state.js";

function url(path) {
    return `http://${state.esp.ip}${path}`;
}

export async function getWeather() {
    const { latitude, longitude } = state.settings;
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m`
    );
    const weather = await response.json();
    const now = new Date(weather.current.time);
    const hourKey =
        `${now.getUTCFullYear()}-${
            String(now.getUTCMonth() + 1).padStart(2, "0")
        }-${
            String(now.getUTCDate()).padStart(2, "0")
        }T${
            String(now.getUTCHours()).padStart(2, "0")
        }:00`;
    const currentIndex =
        weather.hourly.time.indexOf(hourKey);
    let forecastDelta = null;
    if (
        currentIndex !== -1 &&
        weather.hourly.temperature_2m[currentIndex + 1] != null
    ) {
        const currentTemp =
            weather.hourly.temperature_2m[currentIndex];
        const nextHourTemp =
            weather.hourly.temperature_2m[currentIndex + 1];
        forecastDelta = +(nextHourTemp - currentTemp).toFixed(1);
    }
    return {
        outdoorTemp:
            weather.current.temperature_2m,
        humidity:
            weather.current.relative_humidity_2m,
        condition:
            weather.current.weather_code,
        forecastDelta
    };
}


// export async function getStatus() {

//     const response = await fetch(url("/status"));

//     return await response.json();

// }

// export async function setTemperature(temp) {
//     await fetch(url("/temperature"), {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             temperature: temp
//         })
//     });
// }