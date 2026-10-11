import * as scheduleRules from "./scheduleRules.js";
import { scheduleMessages } from "./scheduleMessages.js";
function getMinuteKey(date){
    return (
        date.getFullYear()+"-"+
        date.getMonth()+"-"+
        date.getDate()+"-"+
        date.getHours()+"-"+
        date.getMinutes()
    );
}
export function validateSchedule(schedule){
    const rules = [

        validateConflictActions,
        validateStateMachine,
        validateSession

    ];
    let warnings = [];
    const result = {
        valid: true,
        errors: [],
        warnings: []
    };
    const globalRules = [
        validateDuplicatePump,
    ];
    for (const rule of globalRules) {
        const current = rule(schedule);
        result.errors.push(...current.errors);
        result.warnings.push(...current.warnings);
        if (!current.valid) {
            result.valid = false;
            return result;
        }
    }
    console.log(schedule.map(e => ({
        action: e.action,
        time: e.date.toLocaleTimeString()
    })));
    const sessions = buildSessions(schedule);
    for(const session of sessions){
        for(const rule of rules){
            const current = rule(session);
            result.errors.push(...current.errors);
            result.warnings.push(...current.warnings);
            if(!current.valid){
                result.valid = false;
            }
        }
    }
    result.sessions = sessions;
    return result;
}
function validateDuplicatePump(schedule) {
    let pumpOnCount = 0;
    for (const event of schedule) {
        if (event.action === scheduleRules.ACTIONS.PUMP_ON) {
            pumpOnCount++;
            if (pumpOnCount > 1) {
                return {
                    valid: false,
                    errors: [
                        {
                            code: "PUMP_ALREADY_ON"
                        }
                    ],
                    warnings: []
                };
            }
        }
        if (event.action === scheduleRules.ACTIONS.POWER_OFF) {
            pumpOnCount = 0;
        }
    }
    return {
        valid: true,
        errors: [],
        warnings: []
    };
}
function validateSession(session) {
    console.log("validator session BEFORE", session);
    const schedule = session.events;
    if (schedule.length === 0) {
        return {
            valid: true,
            errors: [],
            warnings: []
        };
    }
    if (schedule[0].action !== scheduleRules.ACTIONS.PUMP_ON) {
        session.warnings.push({
            code: "OPEN_SESSION"
        });

        return {
            valid: true,
            errors: [],
            warnings: []
        };
    }
    const last = schedule[schedule.length - 1];
    if (last.action !== scheduleRules.ACTIONS.POWER_OFF) {
        session.warnings.push({
            code: "OPEN_SESSION"
        });
        console.log("validator session AFTER", session);
        return {
            valid: true,
            errors: [],
            warnings: []
        };
    }
    return {
        valid: true,
        errors: [],
        warnings: []
    };
}
function validateConflictActions(session){
    const schedule = session.events;
    for(let i=0;i<schedule.length;i++){
        for(let j=i+1;j<schedule.length;j++){
            const first=schedule[i];
            const second=schedule[j];
            if(getMinuteKey(first.date)!==getMinuteKey(second.date)){
                continue;
            }
            const conflicts=
                scheduleRules.CONFLICT_ACTIONS[first.action]??[];
            if(conflicts.includes(second.action)){
                return{
                    valid:false,
                    errors:[
                        {
                            code:"CONFLICT_ACTION"
                        }
                    ],
                    warnings:[]
                };
            }
        }
    }
    return{
        valid:true,
        errors:[],
        warnings:[]
    };
}
function validateStateMachine(session){
    const schedule = session.events;
    const firstAction = schedule[0]?.action;
    const current = {
        pump: false,
        motor: false,
        speed: null,

        lastPumpOn: null,
        lastLowSpeed: null,

        motorStarted: false
    };

    for(const event of schedule){
        switch(event.action){
            case scheduleRules.ACTIONS.PUMP_ON:
                current.pump = true;
                current.lastPumpOn = event.date;
                break;
            case scheduleRules.ACTIONS.MOTOR_ON: {
                if(!current.pump){
                    return{
                        valid:false,
                        errors:[
                            {
                                code:"MOTOR_WITHOUT_PUMP"
                            }
                        ],
                        warnings:[]
                    };
                }
                if(current.motor){
                    return {
                        valid:false,
                        errors:[
                            {
                                code:"MOTOR_ALREADY_ON"
                            }
                        ],
                        warnings:[]
                    };
                }
                const diffMinutes = (event.date - current.lastPumpOn) / 60000;
                if (diffMinutes < 2) {
                    return {
                        valid: false,
                        errors: [
                            {
                                code: "STARTUP_DELAY"
                            }
                        ],
                        warnings: []
                    };
                }
                current.motor = true;
                current.motorStarted = true;
                current.speed = "LOW_SPEED";
                current.lastLowSpeed = event.date;
                current.lastMotorOn = event.date;
                break;
            }
                case scheduleRules.ACTIONS.LOW_SPEED:
                    if(!current.motor){
                        return{
                            valid:false,
                            errors:[
                                {
                                    code:"LOW_WITHOUT_MOTOR"
                                }
                            ],
                            warnings:[]
                        };
                    }
                if(current.speed === "LOW_SPEED"){
                    break;
                }
                current.speed = "LOW_SPEED";
                current.lastLowSpeed = event.date;

                break;
                case scheduleRules.ACTIONS.HIGH_SPEED:{
                    if(!current.motor){
                        return{
                            valid:false,
                            errors:[
                                {
                                    code:"HIGH_WITHOUT_MOTOR"
                                }
                            ],
                            warnings:[]
                        };
                    }
                if(current.speed === "HIGH_SPEED"){
                    break;
                }
                const diffMinutes = (event.date - current.lastLowSpeed) / 60000;
                if (diffMinutes < 5) {
                    return {
                        valid: false,
                        errors: [
                            {
                                code: "LOW_SPEED_TOO_SHORT"
                            }
                        ],
                        warnings: []
                    };
                }
                current.speed = "HIGH_SPEED";
                break;
            }
            case scheduleRules.ACTIONS.POWER_OFF:
                if(!current.motorStarted){
                    session.warnings.push({
                        code:"MISSING_MOTOR"
                    });
                }
                current.pump = false;
                current.motor = false;
                current.speed = "LOW_SPEED";
                break;
        }
    }
    return {
        valid:true,
        errors:[],
        warnings:[]
    };
}
function buildSessions(schedule) {
    const sessions = [];
        let currentSession = {
            events: [],
            complete: false,
            disabled: true,
            warnings: []
        };
    for (const event of schedule) {
        if (
            currentSession.complete &&
            event.action === scheduleRules.ACTIONS.PUMP_ON
        ) {
            sessions.push(currentSession);
            currentSession = {
                events: [],
                complete: false,
                disabled: true,
                warnings: []
            };
        }
        currentSession.events.push(event);
        if (event.action === scheduleRules.ACTIONS.POWER_OFF) {
            currentSession.complete = true;
            currentSession.disabled = false;
        }
    }
    if (currentSession.events.length) {
        sessions.push(currentSession);
    }

    return sessions;
}