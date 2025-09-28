import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import { BASE_URL, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";

interface ExpenseExcelDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExpenseExcelDownloadModal({
    isOpen,
    onClose,
}: ExpenseExcelDownloadModalProps) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Get today's date and calculate min/max dates
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    // Reset count when modal opens
    useEffect(() => {
        if (isOpen) {
            setCount(0); // Reset count when modal opens
        }
    }, [isOpen]);

    // Fetch count when dates change
    useEffect(() => {
        if (startDate && endDate) {
            fetchCount();
        }
    }, [startDate, endDate]);

    const fetchCount = async () => {
        if (!startDate || !endDate) return;

        setIsLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/excel/kitchenexpenses?start_date=${startDate}&end_date=${endDate}&count=1`
            );
            const countValue =
                response?.total_count || response?.data?.count || 0;
            setCount(countValue);
        } catch (error) {
            console.error("Error fetching count:", error);
            toast.error("Ошибка при получении количества записей");
            setCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!startDate || !endDate) {
            toast.error("Пожалуйста, выберите даты");
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${BASE_URL}api/excel/kitchenexpenses?start_date=${startDate}&end_date=${endDate}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download Excel file");
            }

            const blob = await response.blob();
            const excelBlob = new Blob([blob], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(excelBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Расходы-Кухня_${startDate}_to_${endDate}.xlsx`;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            toast.success("Excel файл успешно скачан");
            onClose();
        } catch (error) {
            console.error("Error downloading Excel file:", error);
            toast.error("Ошибка при скачивании Excel файла");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleClose = () => {
        setStartDate("");
        setEndDate("");
        setCount(0);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <div className="text-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Скачать Excel - Расходы кухни
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Выберите период для скачивания данных о расходах
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <DatePicker
                            id="start_date"
                            label="Дата начала *"
                            placeholder="Выберите дату начала"
                            maxDate={today}
                            onChange={(selectedDates) => {
                                if (selectedDates.length > 0) {
                                    const date = selectedDates[0];
                                    const year = date.getFullYear();
                                    const month = String(
                                        date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                        2,
                                        "0"
                                    );
                                    const dateString = `${day}-${month}-${year}`;
                                    setStartDate(dateString);
                                }
                            }}
                        />
                    </div>

                    <div>
                        <DatePicker
                            id="end_date"
                            label="Дата окончания *"
                            placeholder="Выберите дату окончания"
                            maxDate={today}
                            onChange={(selectedDates) => {
                                if (selectedDates.length > 0) {
                                    const date = selectedDates[0];
                                    const year = date.getFullYear();
                                    const month = String(
                                        date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                        2,
                                        "0"
                                    );
                                    const dateString = `${day}-${month}-${year}`;
                                    setEndDate(dateString);
                                }
                            }}
                        />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Количество записей:
                            </span>
                            <div className="flex items-center space-x-2">
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : !startDate || !endDate ? (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Выберите даты
                                    </span>
                                ) : (
                                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                        {count}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center space-x-3 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isDownloading}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleDownload}
                        disabled={
                            isDownloading ||
                            !startDate ||
                            !endDate ||
                            count === 0
                        }
                        className=" text-white"
                    >
                        {isDownloading ? "Скачивание..." : "Скачать Excel"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
