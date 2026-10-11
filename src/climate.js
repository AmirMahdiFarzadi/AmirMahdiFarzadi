import { state } from "./state.js";
import * as calendar from "./calendar.js";
import {loadClimateHistory, saveClimateHistory} from "./storage.js";

let sampleInterval = null;

export function startSampling() {
    if (sampleInterval) {
        return;
    }
    addSample();
    sampleInterval = setInterval(() => {
        addSample();
    }, 10 * 60 * 1000);
}
export function stopSampling() {
    clearInterval(sampleInterval);
    sampleInterval = null;
}
export function loadClimate() {
    state.climate.history =
        loadClimateHistory();
}
export function saveClimate() {
    saveClimateHistory(
        state.climate.history
    );
}
export function getTodayClimate() {
    const today =
        calendar.formatDate(
            new Date()
        );
    let record =
        state.climate.history.find(
            x => x.date === today
        );
    if(record){
        return record;
    }
    record = {
        date: today,
        samples: []
    };
    state.climate.history.push(record);
    trimClimateHistory();
    saveClimate();
    return record;
}
function trimClimateHistory(){
    state.climate.history.sort(
        (a,b)=>
            a.date.localeCompare(b.date)
    );
    while(
        state.climate.history.length > 7
    ){
        state.climate.history.shift();
    }
}
export function addSample() {
    const today =
        getTodayClimate();
    const timestamp =
        Date.now();
    const last =
        today.samples.at(-1);
    const TEN_MINUTES =
        10 * 60 * 1000;
    if(
        last &&
        timestamp - last.timestamp < TEN_MINUTES
    ){
        return;
    }
    console.log(
    state.weather.outdoorTemp
);
    today.samples.push({

        timestamp,
        indoorTemp:
            state.sensors.indoorTemp,
        outdoorTemp:
            state.weather.outdoorTemp,
        humidity:
            state.sensors.humidity
    });
    saveClimate();
    console.log(
    state.climate.history
    );
}
export function updateLastSample(){

    const today =
        getTodayClimate();

    const last =
        today.samples.at(-1);

    if(!last){
        return;
    }

    last.indoorTemp =
        state.sensors.indoorTemp;

    last.outdoorTemp =
        state.weather.outdoorTemp;

    last.humidity =
        state.sensors.humidity;

    saveClimate();

}
export function getTodaySamples(){

    return getTodayClimate().samples;

}
export function getWeekSamples(){

    const samples = [];

    state.climate.history.forEach(day=>{
        const date =
            new Date(day.date);
        if(
            !calendar.isSameWeek(
                date,
                new Date()
            )
        ){
            return;
        }
        day.samples.forEach(sample=>{
            samples.push(sample);
        });
    });
    return samples;
}
function calculateStatistics(samples){
    if(samples.length === 0){
        return {
            indoor:{
                min:0,
                max:0,
                avg:0
            },
            outdoor:{
                min:0,
                max:0,
                avg:0
            },
            humidity:{
                min:0,
                max:0,
                avg:0
            }
        };
    }
    const indoor =
        samples
            .map(x => x.indoorTemp)
            .filter(x => x != null);

    const outdoor =
        samples
            .map(x => x.outdoorTemp)
            .filter(x => x != null);

    const humidity =
        samples
            .map(x => x.humidity)
            .filter(x => x != null);
    if(
        indoor.length === 0 ||
        outdoor.length === 0 ||
        humidity.length === 0
    ){
        return {
            indoor:{min:0,max:0,avg:0},
            outdoor:{min:0,max:0,avg:0},
            humidity:{min:0,max:0,avg:0}
        };
    }
    return {
        indoor:{
            min: Math.min(...indoor),
            max: Math.max(...indoor),
            avg:
                indoor.reduce(
                    (a,b)=>a+b,
                    0
                ) / indoor.length
        },
        outdoor:{
            min: Math.min(...outdoor),
            max: Math.max(...outdoor),
            avg:
                outdoor.reduce(
                    (a,b)=>a+b,
                    0
                ) / outdoor.length
        },
        humidity:{
            min: Math.min(...humidity),
            max: Math.max(...humidity),
            avg:
                humidity.reduce(
                    (a,b)=>a+b,
                    0
                ) / humidity.length
        }
    };
}
export function getTodayStatistics(){
    return calculateStatistics(
        getTodaySamples()
    );
}
function average(array){

    if(array.length===0){
        return 0;
    }

    return array.reduce(
        (a,b)=>a+b,
        0
    ) / array.length;

}
export function getWeekStatistics(){
    return calculateStatistics(
        getWeekSamples()
    );
}
function buildChartData(samples){
    samples = samples.filter(
        sample =>
            sample.indoorTemp != null &&
            sample.outdoorTemp != null &&
            sample.humidity != null
    );
    return {
    labels:
        samples.map(sample => {

            const d = new Date(sample.timestamp);

            return `${d.getHours()}:${String(
                d.getMinutes()
            ).padStart(2,"0")}`;

        }),
        indoor:
            samples.map(sample =>
                sample.indoorTemp
            ),
        outdoor:
            samples.map(sample =>
                sample.outdoorTemp
            ),
        humidity:
            samples.map(sample =>
                sample.humidity
            )
    };
}
function buildWeekChartData(){

    const labels = [];
    const indoor = [];
    const outdoor = [];
    const humidity = [];

    state.climate.history.forEach(day=>{

        const date = new Date(day.date);

        if(
            !calendar.isSameWeek(
                date,
                new Date()
            )
        ){
            return;
        }

        labels.push(
            date.toLocaleDateString(
                "en-US",
                {
                    weekday:"short"
                }
            )
        );

        indoor.push(
            average(
                day.samples
                    .map(x=>x.indoorTemp)
                    .filter(x=>x!=null)
            )
        );

        outdoor.push(
            average(
                day.samples
                    .map(x=>x.outdoorTemp)
                    .filter(x=>x!=null)
            )
        );

        humidity.push(
            average(
                day.samples
                    .map(x=>x.humidity)
                    .filter(x=>x!=null)
            )
        );

    });

    return {
        labels,
        indoor,
        outdoor,
        humidity
    };

}
export function getTodayChartData(){

    return buildChartData(

        getTodaySamples()

    );

}
export function getWeekChartData(){

    return buildWeekChartData();

}
export function getStatistics(mode){

    return calculateStatistics(
        getSamples(mode)
    );

}
export function getChartData(mode){

    return mode === "today"
        ? getTodayChartData()
        : getWeekChartData();

}
export function getSamples(mode){

    if(mode === "today"){
        return getTodaySamples();
    }

    return getWeekSamples();

}