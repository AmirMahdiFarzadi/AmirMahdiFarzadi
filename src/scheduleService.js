import { validateSchedule } from "./scheduleValidator.js";
import { state } from "./state.js";
import {loadSchedule, saveSchedule} from "./storage.js";

const saved = loadSchedule();

state.schedule.events.length = 0;
state.schedule.events.push(...saved);

const schedule = state.schedule.events;

function createId() {
    if (crypto?.randomUUID) return crypto.randomUUID();

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
}

export function addEvent({ action, date }) {

    const candidate = [...schedule];

    candidate.push({
        id: createId(),
        action,
        date,
        source: "user",
        executed: false,
        cancelled: false
    });

    candidate.sort((a, b) => a.date - b.date);

    const result = validateSchedule(candidate);

    if (!result.valid)
        return result;

    schedule.length = 0;
    schedule.push(...candidate);
    saveSchedule(schedule);
    return validateSchedule(schedule);
}

export function editEvent(id, newDate) {

    const event = schedule.find(e => e.id === id);

    if (!event)
        return {
            valid: false,
            errors: [{ code: "EVENT_NOT_FOUND" }],
            warnings: []
        };

    const oldDate = event.date;

    event.date = newDate;

    schedule.sort((a, b) => a.date - b.date);

    const result = validateSchedule(schedule);

    if (!result.valid) {
        event.date = oldDate;
        schedule.sort((a, b) => a.date - b.date);
        return result;
    }
    saveSchedule(schedule);
    return validateSchedule(schedule);
}

export function deleteEvent(id) {

    const index = schedule.findIndex(e => e.id === id);

    if (index === -1)
        return {
            valid: false,
            errors: [{ code: "EVENT_NOT_FOUND" }],
            warnings: []
        };

    schedule.splice(index, 1);
    saveSchedule(schedule);
    return validateSchedule(schedule);
}
export function refresh() {
    return validateSchedule(schedule);
}