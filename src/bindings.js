import { state } from "./state.js";

function getValue(path) {
    return path
        .split(".")
        .reduce((obj, key) => obj?.[key], state);
}

export function renderBindings() {
    const elements = document.querySelectorAll("[data-key]");

    elements.forEach(element => {

        let value = getValue(element.dataset.key);

        if (value === undefined || value === null)
            return;

        if (
            typeof value === "number" &&
            (
                element.dataset.key === "weather.outdoorTemp" ||
                element.dataset.key === "sensors.indoorTemp" ||
                element.dataset.key === "ui.coolingDelta"
            )
        ) {
            value = value.toFixed(1);
        }

        element.textContent = value;
    });
}