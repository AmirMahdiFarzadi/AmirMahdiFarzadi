import { state } from "./state.js";

const jalaliFormatter =
    new Intl.DateTimeFormat(
        "fa-IR-u-ca-persian",
        {
            year:"numeric",
            month:"numeric",
            day:"numeric"
        }
    );
function toEnglishDigits(value){

    return value.replace(
        /[۰-۹]/g,
        digit => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
    );

}
function getJalaliParts(date){
    const parts =
        jalaliFormatter.formatToParts(date);
    return {
        year:Number(
            toEnglishDigits(
                parts.find(
                    p=>p.type==="year"
                ).value
            )
        ),
        month:Number(
            toEnglishDigits(
                parts.find(
                    p=>p.type==="month"
                ).value
            )
        ),
        day:Number(
            toEnglishDigits(
                parts.find(
                    p=>p.type==="day"
                ).value
            )
        )
    };

}
export function isSameWeek(date1, date2){

    const start1 =
        getWeekStart(date1);

    const start2 =
        getWeekStart(date2);

    if(state.settings.calendar === "gregorian"){

        return (
            start1.getFullYear() === start2.getFullYear() &&
            start1.getMonth() === start2.getMonth() &&
            start1.getDate() === start2.getDate()
        );

    }

    const j1 =
        getJalaliParts(start1);

    const j2 =
        getJalaliParts(start2);

    return (
        j1.year === j2.year &&
        j1.month === j2.month &&
        j1.day === j2.day
    );

}

export function isSameMonth(date1, date2) {
    if (state.settings.calendar === "gregorian") {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth()
        );
    }
    const j1 =
    getJalaliParts(date1);
    const j2 =
        getJalaliParts(date2);
    return (
        j1.year === j2.year &&
        j1.month === j2.month
    );
}
export function isToday(date1){

    const d1 = new Date(date1);
    const d2 = new Date();

    return formatDate(d1) === formatDate(d2);

}
export function formatDate(date){

    const y =
        date.getFullYear();

    const m =
        String(
            date.getMonth()+1
        ).padStart(2,"0");

    const d =
        String(
            date.getDate()
        ).padStart(2,"0");

    return `${y}-${m}-${d}`;

}
function getWeekStart(date){

    const start = new Date(date);

    const diff =
        (start.getDay() -
        state.settings.firstDayOfWeek + 7) % 7;

    start.setDate(
        start.getDate() - diff
    );

    start.setHours(0,0,0,0);

    return start;

}