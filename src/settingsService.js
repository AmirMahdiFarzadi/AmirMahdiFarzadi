import { state } from "./state.js";
import {loadSettings, saveSettings} from "./storage.js";

export function initSettings() {
    const saved = loadSettings();
    Object.assign(
        state.settings,
        saved
    );
}
export function updateComfort(minTemp, maxTemp){
    state.settings.comfortMinTemp = minTemp;
    state.settings.comfortMaxTemp = maxTemp;
    return state.settings;
}
export function updateLocation(latitude, longitude){
    state.settings.latitude = latitude;
    state.settings.longitude = longitude;
}
export function updateCalendar(firstDayOfWeek, calendar){
    state.settings.firstDayOfWeek = firstDayOfWeek;
    state.settings.calendar = calendar;
}
export function updateCoolerConfig(
    pumpPower,
    motorLowPower,
    motorHighPower,
    electricityPrice
){
    state.settings.pumpPower = pumpPower;
    state.settings.motorLowPower = motorLowPower;
    state.settings.motorHighPower = motorHighPower;
    state.settings.electricityPrice = electricityPrice;
}






export function save(){

    saveSettings(state.settings);

}