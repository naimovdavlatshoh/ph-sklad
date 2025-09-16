import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";

interface ArrivalExcelDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
    isLoading?: boolean;
    suppliers: any[];
    onFiltersChange: (filters: any) => void;
    totalCount: number;
    onSupplierSearch?: (query: string) => void;
    isSearchingSuppliers?: boolean;
}

export default function ArrivalExcelDownloadModal({
    isOpen,
    onClose,
    onDownload,
    isLoading = false,
    suppliers,
    onFiltersChange,
    totalCount,
    onSupplierSearch,
    isSearchingSuppliers = false,
}: ArrivalExcelDownloadModalProps) {
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        supplier_id: "",
    });
    const [datePickerKey, setDatePickerKey] = useState(0);

    // Reset filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setFilters({
                start_date: "",
                end_date: "",
                supplier_id: "",
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
                        Скачать Excel - Приходы
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Выберите период и поставщика для скачивания приходов
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <DatePicker
                            key={`start_date_${datePickerKey}`}
                            id={`start_date_${datePickerKey}`}
                            label="Дата начала"
                            placeholder="Выберите дату начала"
                            defaultDate={undefined}
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
                                    const dateString = `${year}-${month}-${day}`;
                                    console.log(
                                        "Start date change:",
                                        dateString
                                    );
                                    handleFilterChange(
                                        "start_date",
                                        dateString
                                    );
                                }
                            }}
                        />
                    </div>

                    <div>
                        <DatePicker
                            key={`end_date_${datePickerKey}`}
                            id={`end_date_${datePickerKey}`}
                            label="Дата окончания"
                            placeholder="Выберите дату окончания"
                            defaultDate={undefined}
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
                                    const dateString = `${year}-${month}-${day}`;
                                    console.log("End date change:", dateString);
                                    handleFilterChange("end_date", dateString);
                                }
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Поставщик (необязательно)
                        </label>
                        <Select
                            options={[
                                { value: "", label: "Все поставщики" },
                                ...suppliers.map((supplier) => ({
                                    value: supplier.supplier_id.toString(),
                                    label: supplier.supplier_name,
                                })),
                            ]}
                            placeholder="Выберите поставщика"
                            onChange={(value) =>
                                handleFilterChange("supplier_id", value)
                            }
                            onSearch={onSupplierSearch}
                            searching={isSearchingSuppliers}
                            searchable={true}
                            defaultValue={filters.supplier_id}
                        />
                    </div>

                    {totalCount > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Найдено записей:{" "}
                                <span className="font-semibold">
                                    {totalCount}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center space-x-3 mt-6">
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
                        variant="primary"
                        onClick={handleDownload}
                        disabled={isLoading || !isFormValid}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isLoading ? "Скачивание..." : "Скачать Excel"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
