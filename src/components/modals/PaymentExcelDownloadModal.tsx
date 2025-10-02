import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import DatePicker from "../form/date-picker";
import Select from "../form/Select";

interface Supplier {
    supplier_id: string;
    supplier_name: string;
}

interface PaymentExcelDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
    isLoading: boolean;
    suppliers: Supplier[];
    onFiltersChange: (filters: any) => void;
    totalCount: number;
    onSupplierSearch?: (query: string) => void;
    isSearchingSuppliers?: boolean;
}

export default function PaymentExcelDownloadModal({
    isOpen,
    onClose,
    onDownload,
    isLoading,
    suppliers,
    onFiltersChange,
    totalCount,
    onSupplierSearch,
    isSearchingSuppliers = false,
}: PaymentExcelDownloadModalProps) {
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        supplier_id: "",
    });
    const [datePickerKey, setDatePickerKey] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // Reset filters when modal opens
            setFilters({
                start_date: "",
                end_date: "",
                supplier_id: "",
            });
            // Force re-render DatePicker components
            setDatePickerKey((prev) => prev + 1);
        }
    }, [isOpen]);

    const handleFilterChange = (field: string, value: string) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleDownload = () => {
        onDownload();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
                    <svg
                        className="w-6 h-6 text-green-600"
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

                <h3 className="mb-2 text-lg font-medium text-center text-gray-900 dark:text-white">
                    Скачать Excel - Платежи
                </h3>

                <p className="mb-6 text-sm text-center text-gray-500 dark:text-gray-400">
                    Выберите период и поставщика для скачивания платежей в
                    формате Excel
                </p>

                <div className="space-y-4">
                    {/* Start Date */}
                    <div>
                        <DatePicker
                            key={`start_date_${datePickerKey}`}
                            id={`start_date_${datePickerKey}`}
                            label="Дата начала"
                            placeholder="Выберите дату начала"
                            defaultDate={undefined}
                            maxDate={new Date()}
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

                    {/* End Date */}
                    <div>
                        <DatePicker
                            key={`end_date_${datePickerKey}`}
                            id={`end_date_${datePickerKey}`}
                            label="Дата окончания"
                            placeholder="Выберите дату окончания"
                            defaultDate={undefined}
                            maxDate={new Date()}
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

                    {/* Supplier */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Поставщик (необязательно)
                        </label>
                        <Select
                            defaultValue={filters.supplier_id}
                            onChange={(value) =>
                                handleFilterChange("supplier_id", value)
                            }
                            onSearch={onSupplierSearch}
                            searching={isSearchingSuppliers}
                            searchable={true}
                            options={[
                                { value: 0, label: "Все поставщики" },
                                ...suppliers.map((supplier) => ({
                                    value: parseInt(supplier.supplier_id),
                                    label: supplier.supplier_name,
                                })),
                            ]}
                        />
                    </div>

                    {/* Total Count Display */}
                    {totalCount > 0 ? (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Найдено записей: <strong>{totalCount}</strong>
                            </p>
                        </div>
                    ) : totalCount === 0 &&
                      filters.start_date &&
                      filters.end_date ? (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Результат не найден
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={
                            isLoading ||
                            !filters.start_date ||
                            !filters.end_date ||
                            totalCount === 0
                        }
                    >
                        {isLoading ? "Скачивание..." : "Скачать Excel"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
