import { save, load } from "../../src/storage.js";
import { state } from "../../src/state.js";
import * as settingsService from "../../src/settingsService.js";

let minInput = null;
let maxInput = null;
let tempRangeFill = null;
let tabButtons = null;
let activeTab = null;
let track = null;
let saveButton = null;
let latitudeInput = null;
let longitudeInput = null;
let weekdayInputs = null;
let calendarButtons = null;
let pumpPowerInput = null;
let motorLowInput = null;
let motorHighInput = null;
let electricityPriceInput = null;
export function init() {
    minInput = document.querySelector("#settingsMinMaxTemp-minInput");
    maxInput = document.querySelector("#settingsMinMaxTemp-maxInput");
    tempRangeFill = document.querySelector(".settingsTempRangeFill");
    minInput.value = state.settings.comfortMinTemp;
    maxInput.value = state.settings.comfortMaxTemp;
    track = document.querySelector(".settingsTempRangeTrack");
    tabButtons = document.querySelectorAll(".settingsTabButton");
    activeTab = document.querySelector(".settingsActiveTab");
    saveButton = document.querySelector(".SettingsConfirm");
    latitudeInput = document.querySelector("#settings-latitude");
    longitudeInput = document.querySelector("#settings-longitude");
    weekdayInputs = document.querySelectorAll(".settingsWeekdays-radioButton");
    calendarButtons = document.querySelectorAll(".settingsTabButton");
    pumpPowerInput = document.querySelector("#settings-PumpPower");
    motorLowInput = document.querySelector("#settings-MotorLow");
    motorHighInput = document.querySelector("#settings-MotorHigh");
    electricityPriceInput = document.querySelector("#settings-Price");

    latitudeInput.value = state.settings.latitude;
    longitudeInput.value = state.settings.longitude;
    pumpPowerInput.value = state.settings.pumpPower;
    motorLowInput.value = state.settings.motorLowPower;
    motorHighInput.value = state.settings.motorHighPower;
    electricityPriceInput.value = state.settings.electricityPrice;


    weekdayInputs[state.settings.firstDayOfWeek].checked = true;

    saveButton.addEventListener(
        "click",
        saveSettings
    );
    minInput.addEventListener(
        "input",
        updateTempRangeBar
    );
    maxInput.addEventListener(
        "input",
        updateTempRangeBar
    );
    calendarButtonHandler();

    renderCalendarTabs();

    updateTempRangeBar();

}
function getRangePercent(min, max){
    const left = (min / 60) * 100;
    const width = ((max - min) / 60) * 100;
    return {
        left,
        width
    };
}
function updateTempRangeBar(){
    const min = Number(minInput.value);
    const max = Number(maxInput.value);
    const range = getRangePercent(min,max);
    tempRangeFill.style.left = range.left + "%";
    tempRangeFill.style.width = range.width + "%";
}
function saveSettings(){

    settingsService.updateComfort(
        Number(minInput.value),
        Number(maxInput.value)
    );

    settingsService.updateLocation(
        Number(latitudeInput.value),
        Number(longitudeInput.value)
    );

    // بعداً این‌ها هم اضافه می‌شوند
    // settingsService.updateCalendar(...)
    // settingsService.updateCoolerConfig(...)
    settingsService.updateCalendar(
        getSelectedWeekday(),
        state.settings.calendar
    );
    settingsService.updateCoolerConfig(
        Number(pumpPowerInput.value),
        Number(motorLowInput.value),
        Number(motorHighInput.value),
        Number(electricityPriceInput.value)
    );
    settingsService.save();
    window.dispatchEvent(
        new CustomEvent("settings-updated")
    );
}
function getSelectedWeekday(){

    return [...weekdayInputs]
        .findIndex(input => input.checked);

}
function calendarButtonHandler(){

    calendarButtons.forEach((button,index)=>{

        button.onclick = ()=>{

            settingsService.updateCalendar(
                state.settings.firstDayOfWeek,
                button.dataset.calendar
            );

            renderCalendarTabs();

        };

    });

}
function renderCalendarTabs(){

    calendarButtons.forEach(button=>{

        button.classList.toggle(
            "settingsTabButton-active",
            button.dataset.calendar === state.settings.calendar
        );

    });

    const index =
        state.settings.calendar === "jalali"
            ? 0
            : 1;

    activeTab.style.left =
        (index * 50) + "%";
}
