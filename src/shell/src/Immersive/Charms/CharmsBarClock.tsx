import { batch, signal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";

const DayFormat = new Intl.DateTimeFormat('en-gb', { weekday: 'long' })
const DateFormat = new Intl.DateTimeFormat('en-gb', { day: 'numeric', month: 'long' });
const TimeFormat = new Intl.DateTimeFormat('en-gb', { hour: '2-digit', minute: '2-digit', hour12: false,  });

export default function CharmsBarClock(props: {}) {
    const time = signal("");
    const day = signal("");
    const date = signal("");

    useEffect(() => {
        const getTime = () => {
            const now = new Date();

            // feels 
            time.value = TimeFormat.formatToParts(now)
                .filter(s => s.type !== 'literal')
                .map(s => s.value)
                .join('\u2236');

            day.value = DayFormat.format(now);
            date.value = DateFormat.format(now);
        };

        getTime();

        const interval = setInterval(getTime, 1000);
        return () => clearInterval(interval);
    })

    return (
        <div class="charms-clock">
            <h1 class="charms-clock-time">{time}</h1>
            <p class="charms-clock-day">{day}</p>
            <p class="charms-clock-date">{date}</p>
        </div>
    );
}