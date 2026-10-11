export const ACTIONS={
    PUMP_ON:"PUMP_ON",
    MOTOR_ON:"MOTOR_ON",
    LOW_SPEED:"LOW_SPEED",
    HIGH_SPEED:"HIGH_SPEED",
    POWER_OFF:"POWER_OFF"
}
export const CONFLICT_ACTIONS = {
    LOW_SPEED: ["HIGH_SPEED"],
    HIGH_SPEED: ["LOW_SPEED"],
    PUMP_ON: ["POWER_OFF"],
    MOTOR_ON: ["POWER_OFF"],
    POWER_OFF: ["PUMP_ON","MOTOR_ON"]
};
export const ACTION_LABELS = {
    PUMP_ON: "Pump On",
    MOTOR_ON: "Motor On",
    LOW_SPEED: "Low Speed",
    HIGH_SPEED: "High Speed",
    POWER_OFF: "Power Off"
};
export const ACTION_ICONS = {
    PUMP_ON: "droplet",
    MOTOR_ON: "fan",
    LOW_SPEED: "wind",
    HIGH_SPEED: "bolt",
    POWER_OFF: "power"
};
export const ACTION_ICON_CLASSES = {
    PUMP_ON: "scheduleHeader-droplet",
    MOTOR_ON: "scheduleHeader-fan",
    LOW_SPEED: "scheduleHeader-fan",
    HIGH_SPEED: "scheduleHeader-bolt",
    POWER_OFF: "scheduleHeader-power"
};