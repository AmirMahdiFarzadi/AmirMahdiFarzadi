import { state } from "./state.js";
import {
    loadActivityHistory,
    saveActivityHistory,
    checkHistoryReset as storageCheckHistoryReset
} from "./storage.js";
const titles = {
    "power-on": "Power ON",
    "power-off": "Power OFF",
    "speed-high": "High Speed",
    "speed-low": "Low Speed",
    "pump-on": "Pump ON",
    "pump-off": "Pump OFF",
    "motor-on": "Motor ON",
    "motor-off": "Motor OFF"
};
export function loadHistory() {

    state.ui.history =
        loadActivityHistory();

}

export function addHistory(icon, titleKey) {

    const now = new Date();

    state.ui.history.unshift({
        time: now.toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit",
            hour12:false
        }),
        icon,
        title: titles[titleKey] ?? titleKey
    });

    saveActivityHistory(state.ui.history);

}
export function checkHistoryReset(){
    if(!storageCheckHistoryReset()){
        return false;
    }
    state.ui.history = [];
    return true;
}