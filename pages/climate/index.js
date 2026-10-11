import * as climate from "../../src/climate.js";
import { state } from "../../src/state.js";

let temperatureChart = null;
let humidityChart = null;
let chartData = null;
let statistics = null;
let tabButtons = null;
let activeTab = null;
export function init() {
    tabButtons = document.querySelectorAll(".tabButton");
    activeTab = document.querySelector(".activeTab");
    
    refreshClimate();


    handleDayWeekTab();
}
function renderTempChart(){
    const canvas =
    document.getElementById(
        "temperatureChart"
    );
    const ctx = canvas.getContext("2d");
    const indoorGradient = ctx.createLinearGradient(0, 0, 0, 250);
    indoorGradient.addColorStop(0, "rgba(0,180,255,.35)");
    indoorGradient.addColorStop(1, "rgba(0,180,255,0)");
    const outdoorGradient = ctx.createLinearGradient(0, 0, 0, 250);

    outdoorGradient.addColorStop(0, "rgba(255,150,0,.35)");
    outdoorGradient.addColorStop(1, "rgba(255,150,0,0)");

    if (temperatureChart) {
        temperatureChart.destroy();
    }
    console.log(canvas.width, canvas.height);
console.log(canvas.clientWidth, canvas.clientHeight);
    temperatureChart =
        new Chart(canvas,{
            type:"line",
            data:{
                labels: chartData.labels,
                datasets:[
                    {
                        label:"Indoor",
                        data: chartData.indoor,
                        borderColor:"#00B4FF",
                        backgroundColor: indoorGradient,
                        fill:true,
                        tension:.45,
                        pointRadius:0,
                        pointHoverRadius:4,
                        borderWidth:3
                    },
                    {
                        label:"Outdoor",
                        data: chartData.outdoor,
                        borderColor:"#FF9800",
                        backgroundColor: outdoorGradient,
                        fill:true,
                        tension:.45,
                        pointRadius:0,
                        pointHoverRadius:4,
                        borderWidth:3
                    }
                ]
            },
            options:{
                    responsive:true,
                    maintainAspectRatio:false,
                    animation:{
                        duration:800
                    },
            plugins:{
                legend:{
                    display:false
                }
            },
            interaction:{
                mode:"index",
                intersect:false
            }
        }
        });
}
function renderHumidityChart(){
    const canvas =
        document.getElementById(
            "humidityChart"
        );
    const ctx = canvas.getContext("2d");
    const humidityGradient = ctx.createLinearGradient(0, 0, 0, 250 );
    humidityGradient.addColorStop(0, "rgba(0,200,120,.35)");

    humidityGradient.addColorStop(1, "rgba(0,200,120,0)");
    if(humidityChart){
        humidityChart.destroy();
    }
    humidityChart =
        new Chart(canvas,{
            type:"line",
            data:{
                labels:
                    chartData.labels,
                datasets:[
                {
                    label:"Humidity",
                    data: chartData.humidity,
                    borderColor:"#00C878",
                    backgroundColor: humidityGradient,
                    fill:true,
                    tension:.45,
                    pointRadius:0,
                    pointHoverRadius:4,
                    borderWidth:3
                }
                ]
            },
            options:{
                responsive:true,
                maintainAspectRatio:false,
                animation:{
                    duration:800
                },
                plugins:{
                    legend:{
                        display:false
                    }
                },
                interaction:{
                    mode:"index",
                    intersect:false
                }
            }
        });
}
function setValue(key,value){

    document.querySelector(
        `[data-key="${key}"]`
    ).textContent = value;

}
function renderStatistics(){
    const statistics =
        climate.getStatistics(
            state.ui.climateMode
        );
    setValue(
        "indoor-min",
        statistics.indoor.min.toFixed(1)
    );
    setValue(
        "indoor-max",
        statistics.indoor.max.toFixed(1)
    );
    setValue(
        "indoor-avg",
        statistics.indoor.avg.toFixed(1)
    );
    setValue(
        "outdoor-min",
        statistics.outdoor.min.toFixed(1)
    );
    setValue(
        "outdoor-max",
        statistics.outdoor.max.toFixed(1)
    );
    setValue(
        "outdoor-avg",
        statistics.outdoor.avg.toFixed(1)
    );
}
function refreshClimate(){
    chartData =
        climate.getChartData(
            state.ui.climateMode
        );
    statistics =
        climate.getStatistics(
            state.ui.climateMode
        );
    renderTempChart();
    renderHumidityChart();
    renderStatistics();
}
function handleDayWeekTab(){
    tabButtons.forEach((button, i)=>{
        button.onclick = ()=>{
            const move = (100 / tabButtons.length) * i;
            activeTab.style.left = move + "%";
            const mode =
                i===0
                ? "today"
                : "week";

            if(mode === state.ui.climateMode){
                return;
            }

            state.ui.climateMode = mode;

            refreshClimate();
        };
    });
}
export function cleanup(){
    if (temperatureChart) {
        temperatureChart.destroy();
        temperatureChart = null;
    }
    if(humidityChart){
        humidityChart.destroy();
        humidityChart = null;
    }
    console.log("climate cleaned");
}