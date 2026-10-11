import { state } from "./state.js";
import * as calendar from "./calendar.js";
import {
    loadRuntimeHistory,
    saveRuntimeHistory
} from "./storage.js";

export function loadRuntime() {
    state.runtime.history =
        loadRuntimeHistory();
}
export function saveRuntime() {
    saveRuntimeHistory(
        state.runtime.history
    );
}
export function getTodayRuntime() {
    const today =
        calendar.formatDate(new Date());
    let record =
        state.runtime.history.find(
            x => x.date === today
        );
    if (record) {
        return record;
    }
    record = {
        date: today,
        pumpSeconds: 0,
        motorSeconds: 0,
        lowSeconds: 0,
        highSeconds: 0
    };
    state.runtime.history.push(record);
    trimRuntimeHistory();
    saveRuntime();
    return record;
}
export function tickRuntime() {
    const today = getTodayRuntime();
    if (state.cooler.pump) {
        today.pumpSeconds++;
    }
    if (state.cooler.motor) {
        today.motorSeconds++;
    }
    if (state.cooler.motor && state.cooler.speed === "low") {
        today.lowSeconds++;
    }
    if (state.cooler.motor && state.cooler.speed === "high") {
        today.highSeconds++;
    }
    saveRuntime();
}
export function checkRuntimeDay() {
    getTodayRuntime();
}
function trimRuntimeHistory() {
    state.runtime.history.sort(
        (a, b) => a.date.localeCompare(b.date)
    );
    while (state.runtime.history.length > 31) {
        state.runtime.history.shift();
    }
}
export function getTodaySummary() {
    const today = getTodayRuntime();
    return {
        pumpSeconds: today.pumpSeconds,
        motorSeconds: today.motorSeconds,
        lowSeconds: today.lowSeconds,
        highSeconds: today.highSeconds
    };
}
export function getWeekSummary() {
    const summary = {
        pumpSeconds: 0,
        motorSeconds: 0,
        lowSeconds: 0,
        highSeconds: 0
    };

    state.runtime.history.forEach(record => {
        const date = new Date(record.date);
        if (
            !calendar.isSameWeek(
                date,
                new Date()
            )
        ) {
            return;
        }
        summary.pumpSeconds += record.pumpSeconds;
        summary.motorSeconds += record.motorSeconds;
        summary.lowSeconds += record.lowSeconds;
        summary.highSeconds += record.highSeconds;
    });
    return summary;
}
export function getMonthSummary() {
    const summary = {
        pumpSeconds: 0,
        motorSeconds: 0,
        lowSeconds: 0,
        highSeconds: 0
    };
    state.runtime.history.forEach(record => {
        const date = new Date(record.date);
        if (
            !calendar.isSameMonth(
                date,
                new Date()
            )
        ) {
            return;
        }
        summary.pumpSeconds += record.pumpSeconds;
        summary.motorSeconds += record.motorSeconds;
        summary.lowSeconds += record.lowSeconds;
        summary.highSeconds += record.highSeconds;

    });
    return summary;
}
export function calculateEnergy(summary) {
    const pumpWh =
        (summary.pumpSeconds / 3600) *
        state.settings.pumpPower;
    const lowWh =
        (summary.lowSeconds / 3600) *
        state.settings.motorLowPower;
    const highWh =
        (summary.highSeconds / 3600) *
        state.settings.motorHighPower;
    const wattHours =
        pumpWh +
        lowWh +
        highWh;
    return {
        wattHours,
        kiloWattHours:
            wattHours / 1000
    };
}
export function calculateCost(energy) {
    const cost =
        energy.kiloWattHours *
        state.settings.electricityPrice;
    return {
        price: cost,
        roundedPrice:
            Math.round(cost)
    };
}