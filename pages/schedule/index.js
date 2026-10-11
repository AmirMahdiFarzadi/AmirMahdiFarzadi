
import { scheduleMessages } from "../../src/scheduleMessages.js";
import { ACTION_LABELS } from "../../src/scheduleRules.js";
import { ACTION_ICON_CLASSES } from "../../src/scheduleRules.js";
import { state } from "../../src/state.js";
import * as scheduleService from "../../src/scheduleService.js";

const pickers = {};
const VISIBLE_ITEMS = 3;
const HOUR_BASE = 24;
const MIN_BASE = 60;

const schedule = state.schedule.events;
let confirmButton;
let modalOverlay;
let modalMessage;
let modalButton;
let scheduleList;
export function init() {
    confirmButton = document.querySelector(".scheduleTimerConfirm");
    modalOverlay = document.querySelector(".modalOverlay");
    modalMessage = document.querySelector(".modalMessage");
    modalButton = document.querySelector(".modalButton");
    scheduleList = document.querySelector(".scheduleList");
    const cancelButton = document.querySelector(".scheduleTimerCancel");
    const saveButton = document.querySelector(".scheduleTimerEdit");
    saveButton.addEventListener("click", saveEditedTime);
    cancelButton.addEventListener("click", closeEditModal);
    modalButton.addEventListener("click",()=>{
        state.ui.modal=null;
        updateModal();
    });

    for (const key in pickers) {
        delete pickers[key];
    }
    const elements = document.querySelectorAll(".timePicker");
    elements.forEach(element => {
        const picker = createTimePicker(element);
        pickers[element.dataset.id] = picker;
    });

    const result = scheduleService.refresh();

    state.schedule.sessions = result.sessions;
    state.ui.warnings = result.warnings;

    renderSchedule();
    confirmButtonHandler();
}
function confirmButtonHandler(){
    confirmButton.addEventListener("click", addTimer);
}
function getSelectedAction() {
    const radio = document.querySelector(".timeRadioButton:checked");
    console.log(radio);
    if (!radio) return null;
    console.log(radio.dataset.action);
    return radio.dataset.action;
}
function addTimer() {
    const action = getSelectedAction();
    console.log(action);
    if (!action)
        return;
    const result = scheduleService.addEvent({
        action,
        date: pickers.timePicker.getDate()
    });

    if (!result.valid) {
        state.ui.modal = result.errors[0].code;
        updateModal();
        return;
    }

    state.schedule.sessions = result.sessions;
    state.ui.warnings = result.warnings;

    renderSchedule();
}
function updateModal(){
    console.log("updateModal");
    if(!state.ui.modal){
        modalOverlay.classList.add("hidden");
        document.body.classList.remove("modal-open", state.ui.modal);
        return;
    }
    modalOverlay.classList.remove("hidden");
    modalMessage.textContent =
        scheduleMessages[state.ui.modal];
    document.body.classList.add("modal-open", state.ui.modal);
}
function createId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
}
function renderSchedule(){
    scheduleList.innerHTML = "";
    const sessions = state.schedule.sessions;
    console.log(
        sessions.map(s =>
            s.events.map(e => e.action)
        )
    );
    for(const session of sessions){
    const sessionContainer = document.createElement("div");
    sessionContainer.className = "scheduleSession";
    console.log("render session", session);
    if(session.disabled){
        sessionContainer.classList.add("scheduleSession-disabled");
    }
    for (const warning of session.warnings) {
        sessionContainer.appendChild(
            createWarning(warning.code)
        );
    }
    for(const event of session.events){
        const item = createScheduleItem(event);
        sessionContainer.appendChild(item);
    }
    scheduleList.appendChild(sessionContainer);
}

}
function createScheduleItem(event){
    const session = state.schedule.sessions.find(s =>
        s.events.some(e => e.id === event.id)
    );
    const canDelete =
    !(
        session?.complete &&
        (
            event.action === "PUMP_ON" ||
            event.action === "MOTOR_ON"
        )
    );
    const item = document.createElement("div");
    item.className = "scheduleList-item";
    const iconContainer = document.createElement("span");
    iconContainer.className = "scheduleList-iconContainer";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("scheduleList-icon");
    svg.classList.add("scheduleList-icon", ACTION_ICON_CLASSES[event.action]);
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `files/sprite.svg#${getActionIcon(event.action)}`);
    svg.appendChild(use);
    iconContainer.appendChild(svg);
    item.appendChild(iconContainer);
    const valueContainer = document.createElement("div");
    valueContainer.className = "scheduleList-valueContainer";
    const value = document.createElement("div");
    value.className = "scheduleList-value";
    value.textContent = ACTION_LABELS[event.action];
    const time = document.createElement("div");
    time.className = "scheduleList-time";
    time.textContent = event.date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }
        );
    valueContainer.appendChild(value);
    valueContainer.appendChild(time);
    item.appendChild(valueContainer);
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "scheduleList-buttonContainer";
    const editButton = document.createElement("button");
    editButton.className = "scheduleEdit";
    const editSvg =
    document.createElementNS("http://www.w3.org/2000/svg", "svg");
    editSvg.classList.add("scheduleButton-icon", "scheduleButton-Edit");
    const editUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    editUse.setAttribute("href", "files/sprite.svg#pencil");
    editSvg.appendChild(editUse);
    editButton.appendChild(editSvg);
    editButton.addEventListener("click", () => {
        state.ui.editingEventId = event.id;
        pickers.timePickerEditor.setTime(
            event.date.getHours(),
            event.date.getMinutes()
        );
        openEditModal();
    });
    const deleteButton = document.createElement("button");
    deleteButton.className = "scheduleDelete";
    const deleteSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    deleteSvg.classList.add("scheduleButton-icon", "scheduleButton-Delete");
    const deleteUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    deleteUse.setAttribute("href", "files/sprite.svg#trash");
    deleteSvg.appendChild(deleteUse);
    deleteButton.appendChild(deleteSvg);
    deleteButton.addEventListener("click", () => {
    const index = schedule.findIndex(
            e => e.id === event.id
        );
        const session = state.schedule.sessions.find(s =>
            s.events.some(e => e.id === event.id)
        );
        if (!canDelete) {
        return;
        }
        if (!session) return;
        if (index === -1) return;
        const result = scheduleService.deleteEvent(event.id);

        if (!result.valid) {
            state.ui.modal = result.errors[0].code;
            updateModal();
            return;
        }

        state.schedule.sessions = result.sessions;
        state.ui.warnings = result.warnings;

        renderSchedule();
        state.schedule.sessions = result.sessions;
        if (!result.valid) {
            // state.ui.modal = result.errors[0].code;
            // state.ui.warnings = result.warnings;
            state.ui.warnings = [
                ...result.errors,
                ...result.warnings
            ];
            updateModal();
            renderSchedule();

            return;
        }
        state.schedule.sessions = result.sessions;
        state.ui.warnings = result.warnings;
        renderSchedule();
        });
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    item.appendChild(buttonContainer);
    if (!canDelete) {
        deleteButton.disabled = true;
        deleteButton.classList.add("scheduleButton-disabled");
    }

    return item;
}
function getActionIcon(action){

    switch(action){
        case "PUMP_ON":
            return "droplet";
        case "MOTOR_ON":
            return "fan";
        case "LOW_SPEED":
            return "wind";
        case "HIGH_SPEED":
            return "bolt";
        case "POWER_OFF":
            return "power";
        default:
            return "clock";
    }
}
function createWarning(code){
    const container = document.createElement("div");
    container.className = "scheduleWarning-container";
    const iconContainer = document.createElement("div");
    iconContainer.className = "scheduleWarning-iconContainer";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("scheduleWarning-icon", "scheduleWarning-alert-triangle");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "files/sprite.svg#alert-triangle");
    svg.appendChild(use);
    iconContainer.appendChild(svg);
    const message = document.createElement("div");
    message.className = "scheduleWarning-message";
    message.textContent = scheduleMessages[code];
    container.appendChild(iconContainer);
    container.appendChild(message);
    return container;
}
function openEditModal() {
    document
        .querySelector(".timeModalOverlay")
        .classList.remove("hidden");
}
function closeEditModal() {
    document
        .querySelector(".timeModalOverlay")
        .classList.add("hidden");

    state.ui.editingEventId = null;
}
function saveEditedTime(){
    const event = schedule.find(
        e => e.id === state.ui.editingEventId
    );
    if(!event){
        closeEditModal();
        return;
    }
    const oldDate = event.date;
    const newDate =
        pickers.timePickerEditor.getDate();
    const result =
        scheduleService.editEvent(
            event.id,
            newDate
        );

    if (!result.valid) {
        state.ui.modal = result.errors[0].code;
        updateModal();
        return;
    }

    state.schedule.sessions = result.sessions;
    state.ui.warnings = result.warnings;

    closeEditModal();
    renderSchedule();
}








function createTimePicker(root, onChange) {
    const hourWheel = {
        base: 24,
        value: new Date().getHours(),
        offset: 0,
        track: root.querySelector(".hourTrack"),
        viewport: root.querySelector(".hourViewport")
    };
    const minuteWheel = {
        base: 60,
        value: new Date().getMinutes(),
        offset: 0,
        track: root.querySelector(".minuteTrack"),
        viewport: root.querySelector(".minuteViewport")
    };

    const ITEM_HEIGHT = parseFloat(getComputedStyle(root).getPropertyValue("--item-height"));
    let startY = 0;
    let activeWheel = null;
    let momentumRAF = null;
    let lastMoveTime = 0;
    let lastMoveY = 0;
    let velocity = 0;
    let lastFrameTime = 0;
    const CENTER_OFFSET = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;
    const pickerId = root.dataset.id;
    const hrUp =
        root.querySelector(".scheduleHr-down");
    const hrDown =
        root.querySelector(".scheduleHr-up");
    const minUp =
        root.querySelector(".scheduleMin-down");
    const minDown =
        root.querySelector(".scheduleMin-up");
    const hourViewport =
        root.querySelector(".scheduleHour");
    const minuteViewport =
        root.querySelector(".scheduleMinute");
    const picker = root;
    const pickerPointerHandler = e => {
        if (e.target.closest(".schedule-iconContainer")) return;

        const rect = picker.getBoundingClientRect();
        const x = e.clientX - rect.left;

        startDrag(e, x < rect.width / 2 ? "hour" : "minute");
    };
    picker.addEventListener("pointerdown", pickerPointerHandler);

    function emitTimeChanged() {
        syncValues();

    const data = {
        id: pickerId,
        hour: hourWheel.value,
        minute: minuteWheel.value,
        date: getDate()
    };
    onChange?.(data);
    }
    function buildWheel(wheel){
        for(let repeat = 0; repeat < 3; repeat++){
            for(let i = 0; i < wheel.base; i++){

                const item = document.createElement("div");

                item.className = "wheelItem";
                item.dataset.value = i;
                item.textContent =
                    String(i).padStart(2,"0");

                wheel.track.appendChild(item);
            }
        }
    }
    function renderWheel(wheel){
        wheel.track.style.transform =
            `translateY(${wheel.offset}px)`;
    }
    function setTime(){
    hourWheel.offset = CENTER_OFFSET - ((hourWheel.value + HOUR_BASE) * ITEM_HEIGHT);
    minuteWheel.offset = CENTER_OFFSET - ((minuteWheel.value + MIN_BASE) * ITEM_HEIGHT);
    renderWheel(hourWheel);
    renderWheel(minuteWheel);
    updateActiveTrack(hourWheel);
    updateActiveTrack(minuteWheel);
    }
    function updateActiveTrack(wheel){
        const centered = getCenteredIndex(wheel.offset);
        const items = wheel.track.querySelectorAll(".wheelItem");
        items.forEach(item=>
            item.classList.remove("active")
        );
        if(items[centered]){
            items[centered]
                .classList.add("active");
        }
    }
    function hour_Up(){
        console.log("hour up");
        hourWheel.value++;
        if(hourWheel.value >= hourWheel.base){
            hourWheel.value = 0;
        }
        setTime();
        emitTimeChanged();
    }
    function hour_Down(){
        hourWheel.value--;
        if(hourWheel.value < 0){
            hourWheel.value = hourWheel.base - 1;
        }
        setTime();
        emitTimeChanged();
    }
    function minute_Up(){
        minuteWheel.value++;
        if(minuteWheel.value >= minuteWheel.base){
            minuteWheel.value = 0;
            hourWheel.value++;
            if(hourWheel.value >= hourWheel.base){
                hourWheel.value = 0;
            }
        }
        setTime();
        emitTimeChanged();
    }
    function minute_Down(){
        minuteWheel.value--;
        if(minuteWheel.value < 0){
            minuteWheel.value = minuteWheel.base - 1;
            hourWheel.value--;
            if(hourWheel.value < 0){
                hourWheel.value = hourWheel.base - 1;
            }
        }
        setTime();
        emitTimeChanged();
    }
    function getDate(){
        const now = new Date();
        const selected =
            new Date();
        selected.setHours(hourWheel.value);
        selected.setMinutes(minuteWheel.value);
        selected.setSeconds(0);
        if(selected <= now){
            selected.setDate(
                selected.getDate()+1
            );
        }
        return selected;
    }
    function syncValues() {
        hourWheel.value = getWheelValue(hourWheel.offset, hourWheel.base);
        minuteWheel.value = getWheelValue(minuteWheel.offset, minuteWheel.base);
    }
    function startDrag(e, type) {
        e.preventDefault();
        if (activeWheel) {
            velocity = 0;
            lastFrameTime = 0;
            if (momentumRAF !== null) {
                cancelAnimationFrame(momentumRAF);
                momentumRAF = null;
            }
            snapWheel(activeWheel);
        }
        startY = e.clientY;
        lastMoveY = e.clientY;
        lastMoveTime = performance.now();
        velocity = 0;
        activeWheel =
            type === "hour"
                ? hourWheel
                : minuteWheel;
        activeWheel.track.style.transition = "none";
        window.addEventListener("pointermove", onDrag);
        window.addEventListener("pointerup", stopDrag);
    }
    function onDrag(e){
        e.preventDefault();
        const now = performance.now();
        const dt = now - lastMoveTime;
        if(dt > 0){
            const v = (e.clientY - lastMoveY) / dt;
            velocity = Math.max(
                -1.2,
                Math.min(1.2, v)
            );
        }
        lastMoveY = e.clientY;
        lastMoveTime = now;
        const delta = e.clientY - startY;
        startY = e.clientY;
        activeWheel.offset += delta;
        normalizeOffset();
        renderWheel(activeWheel);
        syncValues();
        updateActiveTrack(activeWheel);
    }
    function stopDrag(){
        activeWheel.track.style.transition = "none";
        if(Math.abs(velocity) > 0.05){
            momentumRAF = requestAnimationFrame(animateMomentum);
        }else{
            snapToNearest();
        }
        window.removeEventListener(
            "pointermove",
            onDrag
        );
        window.removeEventListener(
            "pointerup",
            stopDrag
        );
    }
    function animateMomentum(now){
        if(!lastFrameTime){
            lastFrameTime = now;
        }
        const dt = (now - lastFrameTime) / 16.666;
        lastFrameTime = now;
        if(Math.abs(velocity) < 0.02){
            lastFrameTime = 0;
            momentumRAF = null;
            snapToNearest();
            return;
        }
        activeWheel.offset += velocity * dt * 16;
        normalizeOffset();
        renderWheel(activeWheel);
        updateActiveTrack(activeWheel);
        velocity *= Math.pow(
            0.94,
            dt
        );
        momentumRAF = requestAnimationFrame(animateMomentum);
    }
    function getWheelValue(offset, base){
        const index =
            getCenteredIndex(offset);
        return ((index % base) + base) % base;
    }
    function getCenteredIndex(offset){
        return Math.round(
            (CENTER_OFFSET - offset) /
            ITEM_HEIGHT
        );
    }
    function normalizeOffset(){
        if(!activeWheel) return;
        const index = getCenteredIndex(activeWheel.offset);
        if(index < activeWheel.base){
            activeWheel.offset -= activeWheel.base * ITEM_HEIGHT;
        }
        else if(index >= activeWheel.base * 2){
            activeWheel.offset += activeWheel.base * ITEM_HEIGHT;
        }
    }
    function snapWheel(wheel) {
        const index = Math.round(
            (CENTER_OFFSET - wheel.offset) / ITEM_HEIGHT
        );
        wheel.offset =
            CENTER_OFFSET - index * ITEM_HEIGHT;
        wheel.track.style.transition =
            "transform .18s ease-out";
        renderWheel(wheel);
        wheel.value =
            ((index % wheel.base) + wheel.base) %
            wheel.base;
        updateActiveTrack(wheel);
        setTimeout(() => {
            wheel.track.style.transition = "none";
        }, 180);
    }
    function snapToNearest() {
        snapWheel(activeWheel);
        emitTimeChanged();
    }
    function destroy(){
        hrUp.removeEventListener("click", hour_Up);
        hrDown.removeEventListener("click", hour_Down);
        minUp.removeEventListener("click", minute_Up);
        minDown.removeEventListener("click", minute_Down);
        picker.removeEventListener("pointerdown", pickerPointerHandler);
    }
    hrUp.addEventListener('click', hour_Up);
    hrDown.addEventListener('click', hour_Down);
    minUp.addEventListener('click', minute_Up);
    minDown.addEventListener('click', minute_Down);

    console.log(hrUp, hrDown);
    hrUp.addEventListener("pointerdown", () => {
        console.log("hour pointer");
    });

    hrUp.addEventListener("click", () => {
        console.log("hour click");
    });

    buildWheel(hourWheel);
    buildWheel(minuteWheel);

    setTime();

    return {
    getTime(){
        return {
            hour: hourWheel.value,
            minute: minuteWheel.value
        };},
    getDate(){
        return getDate();
    },
    setTime(hourValue,minuteValue){
        hourWheel.value = hourValue;
        minuteWheel.value = minuteValue;
        setTime();
    },
    destroy
};
}
export function cleanup() {

    console.log(pickers);

    Object.entries(pickers).forEach(([key, picker]) => {
        console.log(key, picker);
        console.log(typeof picker);
        console.log(picker?.destroy);

        if (typeof picker?.destroy === "function") {
            picker.destroy();
        }
    });

    for (const key in pickers) {
        delete pickers[key];
    }
}