import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import Loader from "../ui/loader/Loader.tsx";

interface ArrivalPaymentData {
    month_number: number;
    month_name: string;
    arrival_total_sum: number;
    arrival_usd: number;
    arrival_sum: number;
    payment_total_sum: number;
    payment_usd: number;
    payment_sum: number;
}

interface ApiResponse {
    year: number;
    months: ArrivalPaymentData[];
}

export default function ArrivalPaymentsChart() {
    const [data, setData] = useState<ArrivalPaymentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [showDetails, setShowDetails] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/dashboard/arrival-payments-by-year?year=${year}`
            );
            const result: ApiResponse =
                response?.data || response?.result || response;
            setData(result.months || []);
        } catch (error) {
            console.error("Error fetching arrival payments data:", error);
            toast.error("Ошибка при загрузке данных о приходах");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [year]);

    const options: ApexOptions = {
        colors: ["#10B981", "#3B82F6"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 350,
            toolbar: {
                show: true,
            },
            events: {
                mouseMove: function () {
                    // Enable hover effects on the entire chart area
                },
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "55%",
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
        },
        xaxis: {
            categories: data.map((item) => item.month_name),
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
        },
        yaxis: {
            title: {
                text: "Сумма (сум)",
            },
        },
        grid: {
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            enabled: true,
            shared: true,
            intersect: false,
            followCursor: true,
            custom: function ({ dataPointIndex, w }) {
                const monthName = w.globals.labels[dataPointIndex];
                const arrivalValue =
                    w.globals.initialSeries[0].data[dataPointIndex];
                const paymentValue =
                    w.globals.initialSeries[1].data[dataPointIndex];

                return `
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <div class="text-sm font-semibold text-gray-900 dark:text-white mb-2">${monthName}</div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded" style="background-color: #10B981;"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-300">Приходы:</span>
                                <span class="text-sm font-medium text-gray-900 dark:text-white">${arrivalValue.toLocaleString()} сум</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded" style="background-color: #3B82F6;"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-300">Оплаты:</span>
                                <span class="text-sm font-medium text-gray-900 dark:text-white">${paymentValue.toLocaleString()} сум</span>
                            </div>
                        </div>
                    </div>
                `;
            },
        },
    };

    const series = [
        {
            name: "Приходы",
            data: data.map((item) => item.arrival_total_sum),
        },
        {
            name: "Оплаты",
            data: data.map((item) => item.payment_total_sum),
        },
    ];

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Приходы - Оплата по месяцам
                    </h3>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        {Array.from(
                            { length: 5 },
                            (_, i) => new Date().getFullYear() - i
                        ).map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
                <Loader />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Приходы - Оплата по месяцам
                </h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                        {showDetails ? "Скрыть детали" : "Подробнее"}
                    </button>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        {Array.from(
                            { length: 5 },
                            (_, i) => new Date().getFullYear() - i
                        ).map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {data.length > 0 ? (
                <div>
                    <Chart
                        options={options}
                        series={series}
                        type="bar"
                        height={350}
                    />

                    {/* Summary table - only show when showDetails is true */}
                    {showDetails && (
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-2">Месяц</th>
                                        <th className="px-4 py-2">
                                            Приходы (сум)
                                        </th>
                                        <th className="px-4 py-2">
                                            Приходы (USD)
                                        </th>
                                        <th className="px-4 py-2">
                                            Оплаты (сум)
                                        </th>
                                        <th className="px-4 py-2">
                                            Оплаты (USD)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                        >
                                            <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                {item.month_name}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.arrival_sum.toLocaleString()}{" "}
                                                сум
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.arrival_usd.toLocaleString()}{" "}
                                                USD
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.payment_sum.toLocaleString()}{" "}
                                                сум
                                            </td>
                                            <td className="px-4 py-2">
                                                {item.payment_usd.toLocaleString()}{" "}
                                                USD
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <p>Нет данных за выбранный год</p>
                </div>
            )}
        </div>
    );
}
