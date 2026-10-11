import * as runtime from "../../src/runtime.js";
import * as api from "../../src/api.js";
import { state } from "../../src/state.js";

let circleDay;
let circleWeek;
let circleMonth;
let todaySummary;
let weekSummary;
let monthSummary;
let todayEnergy;
let weekEnergy;
let monthEnergy;
let todayCost;
let weekCost;
let monthCost;

const circleValues = new WeakMap();
const CIRCLE_LENGTH = 264;


export function init(){
    circleDay = document.querySelector(".runtimeStat-progressDay");
    circleWeek = document.querySelector(".runtimeStat-progressWeek");
    circleMonth = document.querySelector(".runtimeStat-progressMonth");
    

    todaySummary = runtime.getTodaySummary();
    weekSummary = runtime.getWeekSummary();
    monthSummary = runtime.getMonthSummary();

    todayEnergy = runtime.calculateEnergy(todaySummary);
    weekEnergy = runtime.calculateEnergy(weekSummary);
    monthEnergy = runtime.calculateEnergy(monthSummary);

    todayCost = runtime.calculateCost(todayEnergy);
    weekCost = runtime.calculateCost(weekEnergy);
    monthCost = runtime.calculateCost(monthEnergy);

    renderStatistics();
    state.settings.calendar = "jalali";

    console.log(
        runtime.getMonthSummary()
    );
}
function setValue(key, value){
    document
        .querySelectorAll(`[data-key="${key}"]`)
        .forEach(el=>{
            el.textContent = value;
        });
}

function animateCircle(circle, percent){
    percent = Math.max(0, Math.min(100, percent));
    const startPercent =
        circleValues.get(circle) ?? 0;
    const duration = 700;
    const startTime = performance.now();
    function animate(now){
        const progress =
            Math.min(
                (now - startTime) / duration,
                1
            );
        const currentPercent =
            startPercent +
            (percent - startPercent) * progress;
        const offset =
            CIRCLE_LENGTH *
            (1 - currentPercent / 100);
        circle.style.strokeDashoffset = offset;
        if(progress < 1){
            requestAnimationFrame(animate);
        }else{
            circleValues.set(
                circle,
                percent
            );
        }
    }
    requestAnimationFrame(animate);
}
function setPowerGauge(gauge, percent){

    percent = Math.max(0, Math.min(100, percent));

    gauge.querySelector(".powerGauge-mask").style.width =
        `${100 - percent}%`;

}
function renderPowerGauge(){
    setPowerGauge(
        document.querySelector(".powerGauge-day"),
        25
    );
    setPowerGauge(
        document.querySelector(".powerGauge-week"),
        60
    );
    setPowerGauge(
        document.querySelector(".powerGauge-month"),
        85
    );
}
function renderStatistics(){
    const today =
        runtime.getTodaySummary();
    const week =
        runtime.getWeekSummary();
    const month =
        runtime.getMonthSummary();
    const todayEnergy =
        runtime.calculateEnergy(today);
    const weekEnergy =
        runtime.calculateEnergy(week);
    const monthEnergy =
        runtime.calculateEnergy(month);
    const todayCost =
        runtime.calculateCost(todayEnergy);
    const weekCost =
        runtime.calculateCost(weekEnergy);
    const monthCost =
        runtime.calculateCost(monthEnergy);
    const todayHours =
        Math.floor(today.motorSeconds / 3600);
    const todayMinutes =
        Math.floor(
            (today.motorSeconds % 3600) / 60
        );
    const weekHours =
        Math.floor(week.motorSeconds / 3600);
    const monthHours =
        Math.floor(month.motorSeconds / 3600);
    const maxKwh = Math.max(
        todayEnergy.kiloWattHours,
        weekEnergy.kiloWattHours,
        monthEnergy.kiloWattHours,
        1
    );
    const maxRuntimeHours = Math.max(
        todayHours,
        weekHours,
        monthHours,
        1
    );
    const todayRuntimePercent =
        (todayHours / maxRuntimeHours) * 100;

    const weekRuntimePercent =
        (weekHours / maxRuntimeHours) * 100;

    const monthRuntimePercent =
        (monthHours / maxRuntimeHours) * 100;
    setValue(
        "today-kwh",
        todayEnergy.kiloWattHours.toFixed(2)
    );
    setValue(
        "today-hour",
        todayHours
    );
    setValue(
        "today-minute",
        todayMinutes
    );
    setValue(
        "day-cost",
        todayCost.roundedPrice
    );
    setValue(
        "week-runtime",
        weekHours
    );
    setValue(
        "month-runtime",
        monthHours
    );
    setValue(
        "week-cost",
        weekCost.roundedPrice
    );
    setValue(
        "month-cost",
        monthCost.roundedPrice
    );
    const todayPercent =
        todayEnergy.kiloWattHours /
        maxKwh * 100;
    const weekPercent =
        weekEnergy.kiloWattHours /
        maxKwh * 100;
    const monthPercent =
        monthEnergy.kiloWattHours /
        maxKwh * 100;
    setPowerGauge(
        document.querySelector(".powerGauge-day"),
        todayPercent
    );
    setPowerGauge(
        document.querySelector(".powerGauge-week"),
        weekPercent
    );
    setPowerGauge(
        document.querySelector(".powerGauge-month"),
        monthPercent
    );
    animateCircle(
        circleDay,
        todayRuntimePercent
    );

    animateCircle(
        circleWeek,
        weekRuntimePercent
    );

    animateCircle(
        circleMonth,
        monthRuntimePercent
    );
}


export function cleanup(){
    console.log("Stats cleaned");
}