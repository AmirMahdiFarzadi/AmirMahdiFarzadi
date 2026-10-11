import { state } from "./state.js";

let timer = null;

export function startScheduler() {

    if (timer)
        return;

    timer = setInterval(
        tick,
        1000
    );

}

export function stopScheduler() {

    clearInterval(timer);

    timer = null;

}

function tick() {

    const now = new Date();

    for (const event of state.schedule.events) {

        if (event.executed)
            continue;

        if (event.cancelled)
            continue;

        if (event.date > now)
            continue;

        executeEvent(event);

    }

}

function executeEvent(event) {

    event.executed = true;

    console.log(
        "Execute:",
        event.action,
        event.date
    );

}