import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import Loader from "../ui/loader/Loader.tsx";

interface MaterialData {
    material_id: number;
    material_name: string;
    unit_name: string;
    total_amount: number;
    total_sum_soum: number;
}

interface MonthData {
    month_number: number;
    month_name: string;
    materials: MaterialData[];
}

interface ApiResponse {
    year: number;
    months: MonthData[];
}

export default function MaterialsChart() {
    const [data, setData] = useState<MaterialData[]>([]);
    const [months, setMonths] = useState<MonthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [showDetails, setShowDetails] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/dashboard/materials-by-year?year=${year}`
            );
            const result: ApiResponse =
                response?.data || response?.result || response;
            setMonths(result.months || []);

            // If "all" is selected, combine all materials from all months
            if (selectedMonth === "all") {
                const allMaterials: MaterialData[] = [];
                result.months?.forEach((month) => {
                    month.materials?.forEach((material) => {
                        const existingMaterial = allMaterials.find(
                            (m) => m.material_id === material.material_id
                        );
                        if (existingMaterial) {
                            existingMaterial.total_amount +=
                                material.total_amount;
                            existingMaterial.total_sum_soum +=
                                material.total_sum_soum;
                        } else {
                            allMaterials.push({ ...material });
                        }
                    });
                });
                // Sort by total_sum_soum and take top 8
                setData(
                    allMaterials
                        .sort((a, b) => b.total_sum_soum - a.total_sum_soum)
                        .slice(0, 8)
                );
            } else {
                const selectedMonthData = result.months?.find(
                    (m) => m.month_number.toString() === selectedMonth
                );
                setData(selectedMonthData?.materials?.slice(0, 8) || []);
            }
        } catch (error) {
            console.error("Error fetching materials data:", error);
            toast.error("Ошибка при загрузке данных о материалах");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [year, selectedMonth]);

    const options: ApexOptions = {
        colors: [
            "#EC4899",
            "#06B6D4",
            "#84CC16",
            "#F97316",
            "#8B5CF6",
            "#EF4444",
            "#10B981",
            "#F59E0B",
        ],
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
            categories: data.map((item) => item.material_name),
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                rotate: -45,
                style: {
                    fontSize: "12px",
                },
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
                text: "Общая сумма (сум)",
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
                const materialName = w.globals.labels[dataPointIndex];
                const totalAmount =
                    w.globals.initialSeries[0].data[dataPointIndex];
                const material = data[dataPointIndex];

                return `
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <div class="text-sm font-semibold text-gray-900 dark:text-white mb-2">${materialName}</div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded" style="background-color: #EC4899;"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-300">Количество:</span>
                                <span class="text-sm font-medium text-gray-900 dark:text-white">${
                                    material?.total_amount || 0
                                } ${material?.unit_name || ""}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded" style="background-color: #06B6D4;"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-300">Общая сумма:</span>
                                <span class="text-sm font-medium text-gray-900 dark:text-white">${totalAmount.toLocaleString()} сум</span>
                            </div>
                        </div>
                    </div>
                `;
            },
        },
    };

    const series = [
        {
            name: "Материалы",
            data: data.map((item) => item.total_sum_soum),
        },
    ];

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Топ 8 материалов по месяцам
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
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="all">Все месяцы</option>
                            {months.map((month) => (
                                <option
                                    key={month.month_number}
                                    value={month.month_number.toString()}
                                >
                                    {month.month_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Loader />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Топ 8 материалов по месяцам
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
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="all">Все месяцы</option>
                        {months.map((month) => (
                            <option
                                key={month.month_number}
                                value={month.month_number.toString()}
                            >
                                {month.month_name}
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

                    {/* Materials table - only show when showDetails is true */}
                    {showDetails && (
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-2">Материал</th>
                                        <th className="px-4 py-2">
                                            Количество
                                        </th>
                                        <th className="px-4 py-2">Единица</th>
                                        <th className="px-4 py-2">
                                            Общая сумма
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((material, index) => (
                                        <tr
                                            key={index}
                                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                        >
                                            <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                {material.material_name}
                                            </td>
                                            <td className="px-4 py-2">
                                                {material.total_amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2">
                                                {material.unit_name}
                                            </td>
                                            <td className="px-4 py-2">
                                                {material.total_sum_soum.toLocaleString()}{" "}
                                                сум
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
