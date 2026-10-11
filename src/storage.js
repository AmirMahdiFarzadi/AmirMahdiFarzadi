const ACTIVITY_KEY = "activityHistory";
const RUNTIME_HISTORY_KEY = "runtimeHistory";
const ACTIVITY_DATE_KEY = "activityHistoryDate";
const CLIMATE_HISTORY_KEY = "climateHistory";
const STORAGE_MODE = "local";
const SCHEDULE_KEY = "scheduleEvents";
const SETTINGS_KEY = "settings";

export function save(key, value) {
    if (STORAGE_MODE === "local") {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
        return;
    }
    // ESP Version
}
export function load(key, defaultValue = null) {
    if (STORAGE_MODE === "local") {
        const value = localStorage.getItem(key);
        if (value === null) {
            return defaultValue;
        }
        return JSON.parse(value);
    }
    // ESP Version
}
export function remove(key) {
    if (STORAGE_MODE === "local") {
        localStorage.removeItem(key);
        return;
    }
    // ESP Version
}
function getTodayString() {
    return new Date().toISOString().split("T")[0];
}
export function loadActivityHistory() {
    const today = getTodayString();
    const savedDate =
        localStorage.getItem(ACTIVITY_DATE_KEY);
    if(savedDate !== today){
        localStorage.setItem(
            ACTIVITY_DATE_KEY,
            today
        );
        localStorage.setItem(
            ACTIVITY_KEY,
            "[]"
        );
        return [];
    }
    return load(
        ACTIVITY_KEY,
        []
    );

}
export function checkHistoryReset() {
    const today = getTodayString();
    const savedDate =
        localStorage.getItem(ACTIVITY_DATE_KEY);
    if(savedDate === today){
        return false;
    }
    localStorage.setItem(
        ACTIVITY_DATE_KEY,
        today
    );
    saveActivityHistory([]);
    return true;
}
export function saveActivityHistory(history) {
    save(
        ACTIVITY_KEY,
        history
    );
}
export function loadRuntimeHistory() {
    return load(
        RUNTIME_HISTORY_KEY,
        []
    );
}
export function saveRuntimeHistory(history) {
    save(
        RUNTIME_HISTORY_KEY,
        history
    );
}
export function loadClimateHistory() {
    return load(
        CLIMATE_HISTORY_KEY,
        []
    );
}
export function saveClimateHistory(history) {
    save(
        CLIMATE_HISTORY_KEY,
        history
    );
}


export function loadSchedule(){

    const schedule = load(SCHEDULE_KEY, []);

    return schedule.map(event => ({
        ...event,
        date: new Date(event.date)
    }));
}
export function saveSchedule(events) {
    save(SCHEDULE_KEY, events);
}

export function loadSettings() {
    return load(
        SETTINGS_KEY,
        {}
    );
}

export function saveSettings(settings) {
    save(
        SETTINGS_KEY,
        settings
    );
}