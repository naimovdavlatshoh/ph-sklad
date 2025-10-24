import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";

interface MaterialsIssuesExcelDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
    isLoading?: boolean;
    foremen: any[];
    onFiltersChange: (filters: any) => void;
    totalCount: number;
    onForemanSearch?: (query: string) => void;
    isSearchingForemen?: boolean;
}

export default function MaterialsIssuesExcelDownloadModal({
    isOpen,
    onClose,
    onDownload,
    isLoading = false,
    foremen,
    onFiltersChange,
    totalCount,
    onForemanSearch,
    isSearchingForemen = false,
}: MaterialsIssuesExcelDownloadModalProps) {
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        foreman_id: "",
    });
    const [datePickerKey, setDatePickerKey] = useState(0);

    // Reset filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setFilters({
                start_date: "",
                end_date: "",
                foreman_id: "",
            });
            // Force re-render DatePicker components
            setDatePickerKey((prev) => prev + 1);
        }
    }, [isOpen]);

    const handleFilterChange = (key: string, value: string) => {
        console.log("Filter change:", key, value);
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleDownload = () => {
        onDownload();
    };

    const isFormValid = filters.start_date && filters.end_date;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Скачать Excel - Выдача материалов
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Выберите период и прораба для скачивания выданных
                        материалов
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Date Range Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Дата начала
                            </label>
                            <DatePicker
                                key={`start-${datePickerKey}`}
                                id={`start-date-${datePickerKey}`}
                                defaultDate={filters.start_date || undefined}
                                onChange={(selectedDates, dateStr) => {
                                    if (
                                        selectedDates &&
                                        selectedDates.length > 0
                                    ) {
                                        handleFilterChange(
                                            "start_date",
                                            dateStr
                                        );
                                    }
                                }}
                                placeholder="Выберите дату начала"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Дата окончания
                            </label>
                            <DatePicker
                                key={`end-${datePickerKey}`}
                                id={`end-date-${datePickerKey}`}
                                defaultDate={filters.end_date || undefined}
                                onChange={(selectedDates, dateStr) => {
                                    if (
                                        selectedDates &&
                                        selectedDates.length > 0
                                    ) {
                                        handleFilterChange("end_date", dateStr);
                                    }
                                }}
                                placeholder="Выберите дату окончания"
                            />
                        </div>
                    </div>

                    {/* Foreman Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Прораб (необязательно)
                        </label>
                        <Select
                            defaultValue={filters.foreman_id}
                            onChange={(value) =>
                                handleFilterChange("foreman_id", value)
                            }
                            options={[
                                { value: 0, label: "Все прорабы" },
                                ...foremen.map((foreman) => ({
                                    value: foreman.foreman_id,
                                    label: foreman.foreman_name,
                                })),
                            ]}
                            placeholder="Выберите прораба"
                            onSearch={onForemanSearch}
                            searching={isSearchingForemen}
                            searchable
                        />
                    </div>

                    {/* Total Count Display */}
                    {totalCount > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-sm text-blue-800 dark:text-blue-200">
                                    Найдено записей:{" "}
                                    <strong>{totalCount}</strong>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDownload}
                            disabled={!isFormValid || isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Скачивание...
                                </div>
                            ) : (
                                "Скачать Excel"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
