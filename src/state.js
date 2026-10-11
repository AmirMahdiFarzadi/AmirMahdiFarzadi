export const SETTINGS_UPDATED = "settings-updated";
export const state = {

    esp:{
        connected:false,
        ip:"192.168.4.1"
    },

    sensors:{
        indoorTemp:21,
        humidity:45
    },

    ui:{
        comfortEmoji:"😐",
        comfortLabel:"Warm",
        time:"--:--",
        coolingDelta:"--",

        suggestions: [],
        history: [],
        climateMode: "today",

        modal: null,
        editingEventId: null,
        warnings: []
    },
    runtime: {
        history: []
    },
    climate: {
        history: []
    },
    cooler:{
        power:true,
        status:"off",      // off | startup | running
        pump:false,
        motor:false,
        speed:"low",
        startupRemainingSeconds:13,
        runtimeSeconds:0
    },
    schedule:{
        events:[]
    },
    weather:{
        outdoorTemp:null,
        humidity:null,
        condition:null,
        forecastDelta:null
    },

    settings:{
        theme:"dark",

        tempUnit:"°C",
        shortTempUnit:"°",

        comfortMinTemp:18,
        comfortMaxTemp:32,

        latitude:35.7334,
        longitude:51.9059,

        firstDayOfWeek: 6,   // Saturday
        calendar: "gregorian",

        pumpPower: 60,      // Watt
        motorLowPower: 350, // Watt
        motorHighPower: 500, // Watt
        electricityPrice: 3500
    }

};