import * as api from "../../src/api.js";
import * as EspApi from "../../src/EspApi.js";
import { state } from "../../src/state.js";
import { renderBindings } from "../../src/bindings.js";
import { calculateSuggestions } from "../../src/suggestions.js";
import * as history from "../../src/history.js";
import * as runtime from "../../src/runtime.js";
import * as climate from "../../src/climate.js";
//-----------variables-----------
let led;
let ledtext;
let powertext;
let powerbutton;
let speedtext;
let speedbutton;
let PumpValue;
let MotorValue;
let powerpanel;
let snowContainer;
let snowRunning = false;
let powerpanelMessage;
let runtimeValue;
let comfortGaugeMask;
let comfortEmoji;
let comfortLabel;
let suggestionsContainer;
let activityHistoryCard;

let startupInterval = null;
let runtimeInterval = null;
let clockInterval = null;
//---------------------------------
export async function init() {
    led = document.querySelector(".powerpanel__card-statusLed");
    ledtext = document.querySelector(".powerpanel__card-statusLedText");
    powerpanel = document.querySelector(".powerpanel__card");
    comfortGaugeMask = document.querySelector(".comfortGauge-mask");
    comfortEmoji = document.querySelector('[data-key="ui.comfortEmoji"]');
    comfortLabel = document.querySelector('[data-key="ui.comfortLabel"]');
    activityHistoryCard = document.querySelector(".activity-history-card");
    powertext = document.getElementById("powerbutton-value");
    speedtext = document.getElementById("speedbutton-value");
    PumpValue = document.getElementById("powerpanel__cardstatus-PumpValue");
    MotorValue = document.getElementById("powerpanel__cardstatus-MotorValue");
    powerbutton = document.getElementById("power-btn");
    speedbutton = document.getElementById("speed-btn");
    snowContainer = document.getElementById("snow-container");
    runtimeValue = document.getElementById("runtime-value");
    powerpanelMessage = document.getElementById("powerpanel-message");
    suggestionsContainer = document.getElementById("suggestions-container");

    EspApi.getStatus().then(data=>{
        console.log(
            "ESP STATUS:",
            data
        );
    });

    bindEvents();

    await loadWeather();
    history.loadHistory();
    runtime.loadRuntime();
    setInterval(() => {
        if(history.checkHistoryReset()){
            renderHistory();
        }
        runtime.checkRuntimeDay();
    }, 300000);
    renderUI();
    updateTime();
    clockInterval = setInterval(updateTime, 10000);

    console.log(state.weather);
    // syncFromESP();
    
}

function renderPowerState() {
    renderButtons();
    renderLed();
    renderPump();
    renderMotor();
    renderGradients();
    renderRuntime();
    renderMessage();
}
function renderSensors(){
    renderComfortGauge();
}
export function renderUI(){
    renderPowerState();
    renderSensors();
    renderCoolingEfficiency();
    calculateSuggestions();
    renderBindings();
    renderSuggestions();
    renderHistory();
}
//-----------renders-----------
function renderButtons(){
    powerbutton.classList.toggle("powerbutton__card--on", state.cooler.power);
    speedbutton.classList.toggle("powerbutton__card--on", state.cooler.speed !== "low");
    powertext.textContent = state.cooler.power ? "Power Off" : "Power On";
    speedtext.textContent = state.cooler.speed === "low" ? "High Speed" : "Low Speed";
    speedbutton.disabled = !state.cooler.motor;
}
function renderLed(){
    led.classList.toggle("powerpanel__card-statusLed--on", state.cooler.power);
    ledtext.textContent = state.cooler.power ? "ON" : "STANDBY";
}
function renderPump(){
    PumpValue.classList.toggle("powerpanel__cardstatus-Value--on", state.cooler.pump);
    PumpValue.textContent = state.cooler.pump ? "ON" : "OFF";
}
function renderGradients(){
    powerpanel.classList.toggle("powerpanel__card--on", state.cooler.power);
    document.body.classList.toggle("cooler-on", state.cooler.power);
}
function renderMotor(){
    MotorValue.classList.toggle(
        "powerpanel__cardstatus-Value--on",
        state.cooler.motor
    );
    MotorValue.textContent =
        state.cooler.motor
            ? state.cooler.speed.toUpperCase()
            : "OFF";
}
function renderComfortGauge(){
    const min = state.settings.comfortMinTemp;
    const max = state.settings.comfortMaxTemp;
    const percent =
        ((state.sensors.indoorTemp - min) / (max - min)) * 100;
    const fill = Math.max(0, Math.min(100, percent));
    renderComfortLevel(fill);
    comfortGaugeMask.style.width =
        `${100 - fill}%`;
}
function renderComfortLevel(fill){
    if(fill < 15){
        state.ui.comfortEmoji = "🥶";
        state.ui.comfortLabel = "Too Cold";
    }
    else if(fill < 40){
        state.ui.comfortEmoji = "😀";
        state.ui.comfortLabel = "Excellent";
    }
    else if(fill < 60){
        state.ui.comfortEmoji = "🙂";
        state.ui.comfortLabel = "Comfortable";
    }
    else if(fill < 85){
        state.ui.comfortEmoji = "😐";
        state.ui.comfortLabel = "Warm";
    }
    else{
        state.ui.comfortEmoji = "🥵";
        state.ui.comfortLabel = "Too Hot";
    }
}

function renderSuggestions() {
    suggestionsContainer.innerHTML = "";
    state.ui.suggestions.forEach(suggestion => {
        const card = document.createElement("div");
        card.className = "generalCard-Wmargin";
        card.innerHTML = `
            <div class="smartSuggestionsTitle-container">
                <svg class="suggestionIcon suggestion-${suggestion.icon}" role="img">
                        <use href="files/sprite.svg#${suggestion.icon}"></use>
                </svg>
                <div class="suggestionText-container">
                    <h4 class="suggestionTitle">
                        ${suggestion.title}
                    </h4>
                    <div class="smartSuggestionsMessage-container">
                        <p class="suggestionMessage">
                            ${suggestion.message}
                        </p>
                    </div>
                </div>
            </div>
        `;
        suggestionsContainer.appendChild(card);
    });
}
function renderHistory() {
    activityHistoryCard.innerHTML = "";

    if (state.ui.history.length === 0) {
        activityHistoryCard.innerHTML = `
            <div class="activity-history-item">
                <div class="activity-history-icon-container">
                    <svg class="activityIcon activity-bell" role="img">
                        <use href="files/sprite.svg#bell"></use>
                    </svg>
                </div>
                <span class="activity-history-time">
                    --:--
                </span>
                <span class="activity-history-empty">
                    Today's activity history is empty.
                </span>
            </div>
        `;
        return;
    }
    state.ui.history.forEach(item => {
        const card = document.createElement("div");
        card.className = "activity-history-card";
        card.innerHTML = `
            <div class="activity-history-item">
                <div class="activity-history-icon-container">
                    <svg class="activityIcon activity-${item.icon}" role="img">
                        <use href="files/sprite.svg#${item.icon}"></use>
                    </svg>
                </div>
                <span class="activity-history-time">
                    ${item.time}
                </span>
                <span class="activity-history-name">
                    ${item.title}
                </span>
            </div>
        `;
        activityHistoryCard.appendChild(card);
    });
}
//---------------------------------

//-----------countdown message-----------
function getStatusMessage(){
    switch(state.cooler.status){
        case "off":
            return "Cooler is turned off.";
        case "startup":
            return `Starting pump... ${state.cooler.startupRemainingSeconds}s`;
        case "running":
            return "Cooler is running normally.";
    }
}
function renderMessage(){
    powerpanelMessage.textContent = getStatusMessage();
}
//---------------------------------
function stopStartupCountdown(){
    clearInterval(startupInterval);
    startupInterval = null;
    state.cooler.startupRemainingSeconds = 13;
}
function startCooler(){
    history.addHistory(
        "droplet",
        "pump-on"
    );
    Object.assign(state.cooler,{
        power:true,
        status:"startup",
        pump:true,
        motor:false,
        speed:"low",
        runtimeSeconds:0,
        startupRemainingSeconds:13
    });
    startRuntime();
    startStartupCountdown();
    startSnow();
    renderUI();
}
function stopCooler(){
    history.addHistory(
        "droplet",
        "pump-off"
    );
    history.addHistory(
        "fan",
        "motor-off"
    );
    history.addHistory(
        "power",
        "power-off"
    );
    Object.assign(state.cooler,{
        power:false,
        status:"off",
        pump:false,
        speed:"low",
        motor:false
    });

    snowRunning = false;

    stopRuntimeTimer();
    resetRuntime();
    stopStartupCountdown();
    renderUI();
}
function setPower(isOn){
    if(state.cooler.power === isOn){
        return;
    }
    if(isOn){
        startCooler();
    }else{
        stopCooler();
    }
}
//-----------timer-----------
function formatTime(seconds){
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [
        h.toString().padStart(2,"0"),
        m.toString().padStart(2,"0"),
        s.toString().padStart(2,"0")
    ].join(":");
}
function startRuntime(){
    if(runtimeInterval){
        return;
    }
    renderRuntime();
    runtimeInterval = setInterval(() => {
        state.cooler.runtimeSeconds++;
        runtime.tickRuntime();
        renderRuntime();
    },1000);
}
function stopRuntimeTimer(){
    clearInterval(runtimeInterval);
    runtimeInterval = null;
}
function resetRuntime(){
    state.cooler.runtimeSeconds = 0;
    renderRuntime();
}
function renderRuntime(){
    runtimeValue.classList.toggle(
        "powerpanel__cardstatus-Value--on",
        state.cooler.power
    );
    runtimeValue.textContent =
        state.cooler.power
            ? formatTime(state.cooler.runtimeSeconds)
            : "--:--:--";
}
function startStartupCountdown(){
    clearInterval(startupInterval);
    startupInterval = null;
    startupInterval = setInterval(()=>{
        state.cooler.startupRemainingSeconds--;
        if(state.cooler.startupRemainingSeconds <= 0){
            clearInterval(startupInterval);
            startupInterval = null;
            state.cooler.status = "running";
            state.cooler.motor = true;
            history.addHistory(
                "fan",
                "motor-on"
            );
            renderUI();
            return;
        }
        renderMessage();
    },1000);
}
//---------------------------------

//-----------snow-----------
function startSnow(){
    if(snowRunning){
        return;
    }
    snowRunning = true;
    for(let i=0;i<25;i++){
        const snow = document.createElement("div");
        snow.className = "snowflake";
        snow.innerHTML =
        `<svg width="16" height="16">
            <use href="files/sprite.svg#snowflake"></use>
        </svg>`;
        snow.style.left = Math.random()*100 + "vw";
        snow.style.animationDuration =
            4 + Math.random()*3 + "s";
        snow.style.animationDelay =
            Math.random()*1 + "s";
        snow.style.setProperty(
            "--drift",
            (Math.random()*120-60)+"px"
        );
        snowContainer.appendChild(snow);
        snow.addEventListener("animationend",()=>{
            snow.remove();
        });
    }
}
//---------------------------------

//-----------Misc-----------
function bindEvents(){
    powerbutton.onclick = handlePowerClick;
    speedbutton.onclick = handleSpeedClick;
}
async function loadWeather(){
    try{
        const weather = await api.getWeather();
        state.weather.outdoorTemp = weather.outdoorTemp;
        state.weather.humidity = weather.humidity;
        state.weather.condition = weather.condition;
        state.weather.forecastDelta = weather.forecastDelta;

        climate.updateLastSample();
    }
    catch(err){
        console.warn(err);
    }
}
function updateTime() {
    const now = new Date();
    state.ui.time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
    renderBindings();
}
function renderCoolingEfficiency(){
    state.ui.coolingDelta =
        state.weather.outdoorTemp == null
            ? null
            : state.weather.outdoorTemp -
            state.sensors.indoorTemp;
}
//---------------------------------

//-----------Buttons-----------
function handlePowerClick(){
    setPower(!state.cooler.power);
}
function handleSpeedClick(){
    if(!state.cooler.motor){
        return;
    }
    setSpeed(
        state.cooler.speed === "low"
            ? "high"
            : "low"
    );
}
function setSpeed(speed) {
    if (state.cooler.speed === speed) {
        return;
    }
    state.cooler.speed = speed;
    history.addHistory(
        "bolt",
        speed === "high"
            ? "speed-high"
            : "speed-low"
    );
    renderUI();
}
//---------------------------------

//-----------connections-----------

async function syncFromESP() {

    try {

        const status = await api.getStatus();

        Object.assign(state.cooler, status.cooler);
        Object.assign(state.sensors, status.sensors);

        renderUI();
    } catch (err) {

        console.warn("ESP32 unavailable");

    }

}
export function cleanup(){
    stopRuntimeTimer();
    stopStartupCountdown();
}
//---------------------------------
