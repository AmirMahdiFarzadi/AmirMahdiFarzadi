export const scheduleMessages = {

    OPEN_SESSION:
        "This session is not complete and will not be executed.",

    SESSION_NOT_CLOSED:
        "Session must end with Power Off.",

    DUPLICATE_ACTION:
        "Duplicate actions are not allowed.",

    CONFLICT_ACTION:
        "Conflicting actions cannot happen at the same time.",

    MOTOR_WITHOUT_PUMP:
        "Motor cannot start before Pump.",

    HIGH_SPEED_BEFORE_LOW:
        "High Speed requires Low Speed first.",

    PUMP_ALREADY_ON:
        "Pump is already ON.",

    MOTOR_ALREADY_ON:
        "Motor is already ON.",

    LOW_ALREADY_ACTIVE:
        "Low Speed is already active.",

    HIGH_ALREADY_ACTIVE:
        "High Speed is already active.",

    MOTOR_WITHOUT_PUMP:
        "Pump must be ON before Motor.",

    LOW_WITHOUT_MOTOR:
        "Motor must be ON before selecting Low Speed.",

    HIGH_WITHOUT_MOTOR:
        "Motor must be ON before selecting High Speed.",

    STARTUP_DELAY:
        "Motor must start at least 2 minutes after Pump.",
        
    LOW_SPEED_TOO_SHORT:
        "High Speed requires at least 5 minutes of Low Speed first.",
    MISSING_MOTOR:
        "Motor never started.",
    CANNOT_DELETE_CORE_EVENTS:
        "You cant delete the root."
};