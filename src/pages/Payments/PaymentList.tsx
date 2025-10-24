import { useState, useEffect } from "react";
import { useSearch } from "../../context/SearchContext";
import {
    SearchPayments,
    GetDataSimple,
    DeleteDataCustom,
} from "../../service/data";

import Button from "../../components/ui/button/Button";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index";
import { AddPaymentModal } from "./AddPaymentModal";
import { PaymentTable } from "./PaymentTable";
import PaymentExcelDownloadModal from "../../components/modals/PaymentExcelDownloadModal";
import { BASE_URL } from "../../service/data";
import { formatCurrency } from "../../utils/numberFormat";
import Select from "../../components/form/Select.tsx";
import DatePicker from "../../components/form/date-picker";
import { IoMdCloseCircle } from "react-icons/io";

export interface Payment {
    invoice_number: string;
    payment_id: string;
    user_id: string;
    user_name: string;
    arrival_id: string;
    supplier_id: string;
    supplier_name: string;
    payment_dollar_rate_that_time: string;
    arrival_dollar_rate_that_time: string;
    payment_amount: string;
    payment_amount_formatted: string;
    payment_method: string;
    payment_method_text: string;
    cash_type_text: string;
    dollar_rate: string;
    comments: string;
    created_at: string;
}

export default function PaymentList() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<Payment[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentbalance, setCurrenbBalance] = useState(0);
    const [paymentToDelete, setPaymentToDelete] = useState<{
        id: string;
        supplierName: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletedComments, setDeletedComments] = useState("");

    // Excel download states
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [suppliers, setSuppliers] = useState<
        { supplier_id: string; supplier_name: string }[]
    >([]);
    const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);
    const [excelFilters, setExcelFilters] = useState({
        start_date: "",
        end_date: "",
        supplier_id: "",
    });
    const [totalCount, setTotalCount] = useState(0);
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [isSearchingSuppliersFilter, setIsSearchingSuppliersFilter] =
        useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { searchQuery } = useSearch();

    // Fetch suppliers for Excel download
    const fetchSuppliers = async () => {
        try {
            const response: any = await GetDataSimple(
                "api/supplier/list?page=1&limit=100"
            );
            const suppliersData =
                response?.result || response?.data?.result || [];
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    // Search suppliers function
    const handleSupplierSearch = async (query: string) => {
        if (!query.trim()) {
            fetchSuppliers();
            return;
        }

        // Only search if query has at least 3 characters
        if (query.trim().length < 3) {
            return;
        }

        try {
            setIsSearchingSuppliers(true);
            const response = await fetch(
                `${BASE_URL}api/supplier/search?keyword=${encodeURIComponent(
                    query
                )}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: localStorage.getItem("token")
                            ? `Bearer ${localStorage.getItem("token")}`
                            : "",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSuppliers(data.result || data.data || []);
            }
        } catch (error) {
            console.error("Error searching suppliers:", error);
        } finally {
            setIsSearchingSuppliers(false);
        }
    };

    // Search suppliers for filter dropdown
    const handleSupplierSearchFilter = async (query: string) => {
        if (!query.trim()) {
            fetchSuppliers();
            return;
        }

        // Only search if query has at least 3 characters
        if (query.trim().length < 3) {
            return;
        }

        try {
            setIsSearchingSuppliersFilter(true);
            const response = await fetch(
                `${BASE_URL}api/supplier/search?keyword=${encodeURIComponent(
                    query
                )}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: localStorage.getItem("token")
                            ? `Bearer ${localStorage.getItem("token")}`
                            : "",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSuppliers(data.result || data.data || []);
            }
        } catch (error) {
            console.error("Error searching suppliers:", error);
        } finally {
            setIsSearchingSuppliersFilter(false);
        }
    };

    // Handle supplier filter change
    const handleSupplierFilterChange = (supplierId: string) => {
        setSelectedSupplierId(supplierId);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Clear supplier filter
    const clearSupplierFilter = () => {
        setSelectedSupplierId("");
        setCurrentPage(1);
    };

    // Handle date filter change
    const handleDateFilterChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Clear date filter
    const clearDateFilter = () => {
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
    };

    // Format date from YYYY-MM-DD to dd-mm-yyyy
    const formatDateToDDMMYYYY = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const loadPayments = async (page: number = 1) => {
        try {
            setLoading(true);
            let url = `api/payments/list?page=${page}&limit=30`;
            if (selectedSupplierId) {
                url += `&supplier_id=${selectedSupplierId}`;
            }
            if (startDate) {
                url += `&start_date=${startDate}`;
            }
            if (endDate) {
                url += `&end_date=${endDate}`;
            }

            const response = await GetDataSimple(url);
            setPayments(response?.result || []);
            setTotalPages(response.pages || 1);
            setCurrentPage(page);
        } catch (error) {
            toast.error("Ошибка при загрузке платежей");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setIsSearching(false);
            setSearchResults([]);
            loadPayments(1);
            return;
        }

        // 3 tadan kam harf yozilsa, zapros ketmasin
        if (query.trim().length < 3) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const response = await SearchPayments(query);
            setSearchResults(response.result || []);
        } catch (error) {
            toast.error("Ошибка при поиске платежей");
        }
    };

    const handleDeleteClick = (paymentId: string, supplierName: string) => {
        setPaymentToDelete({ id: paymentId, supplierName });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!paymentToDelete) return;

        try {
            setIsDeleting(true);
            const deleteData = {
                deleted_comments: deletedComments.trim(),
            };

            await DeleteDataCustom(
                `api/payments/delete/${paymentToDelete.id}`,
                deleteData
            );
            toast.success("Платеж успешно удален");
            loadPayments(currentPage);
            setIsDeleteModalOpen(false);
            setPaymentToDelete(null);
            setDeletedComments(""); // Clear comments after successful delete
        } catch (error: any) {
            setIsDeleteModalOpen(false);
            toast.error(error.response.data.error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setPaymentToDelete(null);
        setDeletedComments("");
    };

    const handleAddPayment = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
    };

    const handlePaymentAdded = () => {
        loadPayments(currentPage);
        setIsAddModalOpen(false);
    };

    // Excel download functions
    const handleExcelDownload = async () => {
        // Check that both dates are present before downloading
        if (
            !excelFilters.start_date ||
            !excelFilters.end_date ||
            excelFilters.start_date.trim() === "" ||
            excelFilters.end_date.trim() === ""
        ) {
            toast.error("Пожалуйста, выберите дату начала и дату окончания");
            return;
        }

        try {
            setIsDownloading(true);

            const formattedStartDate = formatDateToDDMMYYYY(
                excelFilters.start_date
            );
            const formattedEndDate = formatDateToDDMMYYYY(
                excelFilters.end_date
            );

            const params = new URLSearchParams({
                start_date: formattedStartDate,
                end_date: formattedEndDate,
            });

            if (excelFilters.supplier_id) {
                params.append("supplier_id", excelFilters.supplier_id);
            }

            const response = await fetch(
                `${BASE_URL}api/excel/payments?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
                        Authorization: localStorage.getItem("token")
                            ? `Bearer ${localStorage.getItem("token")}`
                            : "",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download Excel file");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(
                new Blob([blob], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = `Платежи_${formatDateToDDMMYYYY(
                excelFilters.start_date
            )}_${formatDateToDDMMYYYY(excelFilters.end_date)}.xlsx`;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            toast.success("Excel файл успешно скачан");
            setIsExcelModalOpen(false);
        } catch (error) {
            console.error("Error downloading Excel file:", error);
            toast.error("Ошибка при скачивании Excel файла");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFiltersChange = (newFilters: any) => {
        console.log("Filters changed:", newFilters);
        setExcelFilters(newFilters);
        // Only call API if both dates are present
        if (
            newFilters.start_date &&
            newFilters.end_date &&
            newFilters.start_date.trim() !== "" &&
            newFilters.end_date.trim() !== ""
        ) {
            console.log(
                "Both dates present, calling getTotalCount with new filters"
            );
            // Call getTotalCount with the new filters directly
            getTotalCountWithFilters(newFilters);
        } else {
            console.log("Missing dates, not calling API");
            setTotalCount(0);
        }
    };

    const getTotalCountWithFilters = async (filters: any) => {
        // Double check that both dates are present
        if (
            !filters.start_date ||
            !filters.end_date ||
            filters.start_date.trim() === "" ||
            filters.end_date.trim() === ""
        ) {
            console.log(
                "Missing dates in getTotalCountWithFilters, skipping API call"
            );
            setTotalCount(0);
            return;
        }

        try {
            const formattedStartDate = formatDateToDDMMYYYY(filters.start_date);
            const formattedEndDate = formatDateToDDMMYYYY(filters.end_date);

            console.log("Getting total count with dates:", {
                start_date: filters.start_date,
                end_date: filters.end_date,
                formattedStartDate,
                formattedEndDate,
            });

            const params = new URLSearchParams({
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                count: "1",
            });

            if (filters.supplier_id) {
                params.append("supplier_id", filters.supplier_id);
            }

            const response = await fetch(
                `${BASE_URL}api/excel/payments?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: localStorage.getItem("token")
                            ? `Bearer ${localStorage.getItem("token")}`
                            : "",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setTotalCount(data.total_count || 0);
            }
        } catch (error) {
            console.error("Error getting total count:", error);
            setTotalCount(0);
        }
    };

    const balance = () => {
        GetDataSimple(`api/balance/available`).then((res) => {
            setCurrenbBalance(res.available_balance);
        });
    };

    useEffect(() => {
        loadPayments(1);
        fetchSuppliers();
        balance();
    }, [selectedSupplierId, startDate, endDate]);

    useEffect(() => {
        if (searchQuery) {
            handleSearch(searchQuery);
        } else {
            setIsSearching(false);
            setSearchResults([]);
            loadPayments(1);
        }
    }, [searchQuery]);

    const displayPayments = isSearching ? searchResults : payments;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Касса-Склад
                </h1>
                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <p>
                            Баланс :{" "}
                            <span className="text-green-500 font-medium">
                                {formatCurrency(currentbalance)} сум
                            </span>
                        </p>
                    </div>

                    {/* Supplier Filter */}
                    <div className="flex items-center gap-2">
                        <div className="min-w-[200px]">
                            <Select
                                options={[
                                    { value: 0, label: "Все поставщики" },
                                    ...suppliers.map((supplier) => ({
                                        value: parseInt(supplier.supplier_id),
                                        label: supplier.supplier_name,
                                    })),
                                ]}
                                placeholder="Выберите поставщика"
                                onChange={(value) =>
                                    handleSupplierFilterChange(value)
                                }
                                onSearch={handleSupplierSearchFilter}
                                searching={isSearchingSuppliersFilter}
                                searchable={true}
                                defaultValue={selectedSupplierId}
                            />
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <DatePicker
                                id="start-date-filter"
                                defaultDate={startDate || undefined}
                                onChange={(_selectedDates, dateStr) => {
                                    if (dateStr) {
                                        handleDateFilterChange(
                                            dateStr,
                                            endDate
                                        );
                                    }
                                }}
                                placeholder="Начальная дата"
                            />
                            <span className="text-gray-500 dark:text-gray-400">
                                -
                            </span>
                            <DatePicker
                                id="end-date-filter"
                                defaultDate={endDate || undefined}
                                onChange={(_selectedDates, dateStr) => {
                                    if (dateStr) {
                                        handleDateFilterChange(
                                            startDate,
                                            dateStr
                                        );
                                    }
                                }}
                                placeholder="Конечная дата"
                            />
                        </div>
                    </div>

                    {/* Clear All Filters Button */}
                    {(selectedSupplierId || startDate || endDate) && (
                        <button
                            onClick={() => {
                                clearSupplierFilter();
                                clearDateFilter();
                            }}
                            className="text-red-600 hover:text-red-800 bg-red-100 p-3 rounded-md text-sm font-medium"
                        >
                            <IoMdCloseCircle size={20} />
                        </button>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExcelModalOpen(true)}
                        startIcon={
                            <svg
                                className="w-4 h-4"
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
                        }
                    >
                        Скачать Excel
                    </Button>
                    <Button size="sm" onClick={handleAddPayment}>
                        Добавить платеж
                    </Button>
                </div>
            </div>

            <PaymentTable
                payments={displayPayments}
                loading={loading}
                onDelete={handleDeleteClick}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={loadPayments}
                isSearching={isSearching}
            />

            {/* Add Payment Modal */}
            {isAddModalOpen && (
                <AddPaymentModal
                    isOpen={isAddModalOpen}
                    onClose={handleCloseModal}
                    onPaymentAdded={handlePaymentAdded}
                />
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                className="max-w-md"
            >
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900">
                        <svg
                            className="w-6 h-6 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        Удалить платеж
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                        Вы уверены, что хотите удалить платеж от "
                        {paymentToDelete?.supplierName}
                        "?
                        <br />
                        Это действие нельзя отменить.
                    </p>

                    {/* Comment Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Комментарий к удалению (необязательно)
                        </label>
                        <input
                            type="text"
                            value={deletedComments}
                            onChange={(e) => setDeletedComments(e.target.value)}
                            placeholder="Укажите причину удаления..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:text-white"
                            disabled={isDeleting}
                        />
                    </div>

                    <div className="flex justify-center space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDeleteCancel}
                            disabled={isDeleting}
                            className="px-6 py-2.5"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="px-6 py-2.5"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Excel Download Modal */}
            <PaymentExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onDownload={handleExcelDownload}
                isLoading={isDownloading}
                suppliers={suppliers}
                onFiltersChange={handleFiltersChange}
                totalCount={totalCount}
                onSupplierSearch={handleSupplierSearch}
                isSearchingSuppliers={isSearchingSuppliers}
            />
        </div>
    );
}
