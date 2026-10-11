import { state } from "./state.js";

function clearSuggestions() {
    state.ui.suggestions.length = 0;
}
function addSuggestion(icon, title, message) {
    state.ui.suggestions.push({
        icon,
        title,
        message
    });
}
export function calculateSuggestions() {

    clearSuggestions();
    idealComfortRule();
    desiredTemperatureRule();
    outdoorCoolerRule();
    outdoorHotterRule();
    pumpOnlyRule();
    standbyRule();
    runtimeTooLongRule();
    startupRule();
    lowCoolingDifferenceRule();
    weatherUnavailableRule();
    ruleOutdoorTempDroppingSoon();
    ruleOutdoorTempRising();
    ruleHighSpeedUnnecessary();
}
function desiredTemperatureRule() {
    if (
        !state.cooler.power ||
        state.sensors.indoorTemp > 24
    ) {
        return;
    }
    addSuggestion(
        "bolt",
        "Desired temperature reached",
        "Turning the cooler off now can save electricity."
    );
}
function outdoorCoolerRule() {
    if (
        state.cooler.power ||
        state.weather.outdoorTemp == null ||
        state.weather.outdoorTemp > state.sensors.indoorTemp - 2
    ) {
        return;
    }
    addSuggestion(
        "wind",
        "Cool outdoor air available",
        "Opening a window may be enough instead of using the cooler."
    );
}

function outdoorHotterRule() {
    if (
        state.cooler.power ||
        state.weather.outdoorTemp == null ||
        state.weather.outdoorTemp <= state.sensors.indoorTemp+7
    ) {
        return;
    }
    addSuggestion(
        "sun",
        "Outdoor temperature is higher",
        "It's better to keep the windows shut to prevent heat."
    );
}

function pumpOnlyRule() {
    if (
        !state.cooler.pump ||
        state.cooler.motor ||
        state.cooler.runtimeSeconds < 15 * 60
    ) {
        return;
    }
    addSuggestion(
        "fan",
        "Pump is running alone",
        "Starting the fan will improve cooling performance."
    );
}
function standbyRule() {
    if (state.cooler.power) {
        return;
    }
    addSuggestion(
        "power",
        "Cooler is on standby",
        "The system is ready to start whenever you need it."
    );
}
function runtimeTooLongRule() {
    if (
        !state.cooler.power ||
        state.cooler.runtimeSeconds < 4 * 60 * 60
    ) {
        return;
    }
    addSuggestion(
        "clock",
        "Long running time",
        "The cooler has been running for several hours. Consider giving it a short break."
    );
}
function startupRule() {
    if (state.cooler.status !== "startup") {
        return;
    }
    addSuggestion(
        "fan",
        "Cooler is starting",
        "The pump is priming the pads. The fan will start automatically."
    );
}
function lowCoolingDifferenceRule() {
    if (
        !state.cooler.power ||
        state.weather.outdoorTemp == null
    ) {
        return;
    }
    const delta =
        state.weather.outdoorTemp -
        state.sensors.indoorTemp;

    if (delta >= 2) {
        return;
    }
    addSuggestion(
        "stats",
        "Limited cooling difference",
        "Indoor and outdoor temperatures are very close, so cooling efficiency may be limited."
    );

}
function idealComfortRule() {
    if (
        state.sensors.indoorTemp < state.settings.comfortMinTemp ||
        state.sensors.indoorTemp > state.settings.comfortMaxTemp
    ) {
        return;
    }
    addSuggestion(
        "home",
        "Comfort level is ideal",
        "The indoor temperature is within your preferred comfort range."
    );
}

function weatherUnavailableRule() {
    if (state.weather.outdoorTemp != null) {
        return;
    }
    addSuggestion(
        "info",
        "Weather unavailable",
        "Outdoor weather data could not be loaded."
    );
}
function ruleOutdoorTempDroppingSoon() {
    if (state.cooler.power) return;
    if (state.weather.forecastDelta <= -.6) {
        addSuggestion(
            "clock",
            "Outdoor temperature will drop soon",
            "Outdoor temperature will drop in about an hour. Consider waiting before turning the cooler on."
        );
    }
}
function ruleOutdoorTempRising() {
    if (state.cooler.power) return;
    if (state.weather.forecastDelta >= .6) {
        addSuggestion(
            "sun",
            "Outdoor temperature is rising",
            "It may become warmer soon. Starting the cooler earlier could improve comfort."
        );
    }
}
function ruleHighSpeedUnnecessary() {
    if (
        !state.cooler.motor ||
        state.cooler.speed !== "high"
    ) {
        return;
    }
    if (
        state.sensors.indoorTemp >
        state.settings.comfortMinTemp + 2
    ) {
        return;
    }
    addSuggestion(
        "fan",
        "High speed unnecessary",
        "Indoor temperature is already close to target. Switching to Low Speed can save energy."
    );
}