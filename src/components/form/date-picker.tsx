import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
    id: string;
    mode?: "single" | "multiple" | "range" | "time";
    onChange?: Hook | Hook[];
    defaultDate?: DateOption;
    label?: string;
    placeholder?: string;
    maxDate?: Date;
};

export default function DatePicker({
    id,
    mode,
    onChange,
    label,
    defaultDate,
    placeholder,
    maxDate,
}: PropsType) {
    useEffect(() => {
        const flatPickr = flatpickr(`#${id}`, {
            mode: mode || "single",
            static: true,
            monthSelectorType: "static",
            dateFormat: "Y-m-d",
            defaultDate,
            maxDate,
            onChange,
            // @ts-ignore
            onReady: function (selectedDates, dateStr, instance) {
                // Add custom styling for disabled dates
                const today = new Date();
                today.setHours(23, 59, 59, 999); // End of today

                // Style future dates as disabled
                const futureDates =
                    instance.calendarContainer.querySelectorAll(
                        ".flatpickr-day"
                    );
                futureDates.forEach((day: any) => {
                    const date = new Date(day.dateObj);
                    if (date > today) {
                        day.style.opacity = "0.3";
                        day.style.color = "#9CA3AF";
                        day.style.cursor = "not-allowed";
                        day.style.backgroundColor = "#F3F4F6";
                    }
                });
            },
            // @ts-ignore
            onMonthChange: function (selectedDates, dateStr, instance) {
                // Reapply styling when month changes
                const today = new Date();
                today.setHours(23, 59, 59, 999);

                const futureDates =
                    instance.calendarContainer.querySelectorAll(
                        ".flatpickr-day"
                    );
                futureDates.forEach((day: any) => {
                    const date = new Date(day.dateObj);
                    if (date > today) {
                        day.style.opacity = "0.3";
                        day.style.color = "#9CA3AF";
                        day.style.cursor = "not-allowed";
                        day.style.backgroundColor = "#F3F4F6";
                    }
                });
            },
        });

        return () => {
            if (!Array.isArray(flatPickr)) {
                flatPickr.destroy();
            }
        };
    }, [mode, onChange, id, defaultDate, maxDate]);

    return (
        <div>
            {label && <Label htmlFor={id}>{label}</Label>}

            <div className="relative">
                <input
                    id={id}
                    placeholder={placeholder}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
                />

                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <CalenderIcon className="size-6" />
                </span>
            </div>
        </div>
    );
}
