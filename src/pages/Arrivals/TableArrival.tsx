import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";
import PaymentModal from "../../components/modals/PaymentModal";
import { formatDateTime } from "../../utils/numberFormat";
import { BASE_URL } from "../../service/data.ts";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import AddArrival from "./AddArrival.tsx";
import ArrivalExcelDownloadModal from "../../components/modals/ArrivalExcelDownloadModal.tsx";
import Select from "../../components/form/Select.tsx";
import { IoMdCloseCircle } from "react-icons/io";

// Comment icon SVG
const CommentIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
    </svg>
);

// Credit card icon SVG
const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
    </svg>
);

// Eye icon SVG
const EyeIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
    </svg>
);

// Free delivery icon SVG
const FreeDeliveryIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4"
        />
    </svg>
);

interface PaymentHistory {
    payment_id: string;
    user_id: string;
    user_name: string;
    arrival_id: string;
    payment_amount: string;
    payment_method: string;
    payment_method_text: string;
    cash_type: string;
    cash_type_text: string;
    payment_dollar_rate: string;
    created_at: string;
}

interface ArrivalItem {
    arrival_item_id: string;
    arrival_id: string;
    material_id: string;
    material_name: string;
    amount: string;
    price: string;
    created_at: string;
    short_name: string;
}

interface Arrival {
    arrival_id: string;
    invoice_number: string;
    user_name: string;
    supplier_id: string;
    supplier_name: string;
    payment_status: string;
    payment_status_text: string;
    total_price: string;
    delivery_price: string;
    arrival_dollar_rate: string;
    comments: string;
    created_at: string;
    total_payments: string;
    payment_history: PaymentHistory[];
    items?: ArrivalItem[];
    cash_type_text: string;
    cash_type: string;
}

interface TableArrivalProps {
    arrivals: Arrival[];
    changeStatus: () => void;
    suppliers: any[];
    selectedSupplierId: string;
    onSupplierFilterChange: (supplierId: string) => void;
    onClearSupplierFilter: () => void;
    onSupplierSearch: (query: string) => void;
    isSearchingSuppliers: boolean;
}

export default function TableArrival({
    arrivals,
    changeStatus,
    suppliers,
    selectedSupplierId,
    onSupplierFilterChange,
    onClearSupplierFilter,
    onSupplierSearch,
    isSearchingSuppliers,
}: TableArrivalProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedArrival, setSelectedArrival] = useState<Arrival | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPaymentArrival, setSelectedPaymentArrival] =
        useState<Arrival | null>(null);
    const [itemsModalOpen, setItemsModalOpen] = useState(false);
    const [selectedItemsArrival, setSelectedItemsArrival] =
        useState<Arrival | null>(null);
    const [arrivalItems, setArrivalItems] = useState<ArrivalItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [activeTab, setActiveTab] = useState<"items" | "payments">("items");
    const [addArrivalModalOpen, setAddArrivalModalOpen] = useState(false);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [excelFilters, setExcelFilters] = useState({
        start_date: "",
        end_date: "",
        supplier_id: "",
    });

    const handleDelete = async () => {
        if (!selectedArrival) return;

        setIsDeleting(true);
        try {
            await DeleteData(
                `api/arrival/delete/${selectedArrival.arrival_id}`
            );
            toast.success("Приход успешно удален");
            changeStatus();
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error("Ошибка при удалении прихода");
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePaymentClick = (arrival: Arrival) => {
        setSelectedPaymentArrival(arrival);
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        changeStatus(); // Refresh the arrivals list
    };

    const handleItemsClick = async (arrival: Arrival) => {
        setSelectedItemsArrival(arrival);
        setItemsModalOpen(true);
        setLoadingItems(true);
        setActiveTab("items"); // Reset to items tab

        try {
            // Use items from arrival data if available, otherwise fetch from backend
            if (arrival.items && arrival.items.length > 0) {
                setArrivalItems(arrival.items);
                setLoadingItems(false);
            } else {
                // Fetch items data from backend
                const response = await fetch(
                    `/api/arrival/items/${arrival.arrival_id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setArrivalItems(data.items || []);
                } else {
                    toast.error("Ошибка при загрузке товаров");
                    setArrivalItems([]);
                }
            }
        } catch (error) {
            toast.error("Ошибка при загрузке товаров");
            setArrivalItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    // Removed formatDate and formatTime functions - using formatDateTime from utils

    // Generate random color for supplier badge
    const getSupplierBadgeColor = (supplierName: string) => {
        const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-indigo-500",
            "bg-yellow-500",
            "bg-red-500",
            "bg-teal-500",
        ];
        const hash = supplierName.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    };

    // Get first letter of supplier name
    const getSupplierInitial = (supplierName: string) => {
        return supplierName.charAt(0).toUpperCase();
    };

    // calculateTotal function is no longer needed as total_price comes from backend

    // Date formatting function
    const formatDateToDDMMYYYY = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Excel download functions

    const handleExcelDownload = async () => {
        // Check that both dates are present before downloading
        if (!excelFilters.start_date || !excelFilters.end_date) {
            toast.error("Пожалуйста, выберите даты");
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem("token");

            const params = new URLSearchParams({
                start_date: formatDateToDDMMYYYY(excelFilters.start_date),
                end_date: formatDateToDDMMYYYY(excelFilters.end_date),
            });

            if (excelFilters.supplier_id) {
                params.append("supplier_id", excelFilters.supplier_id);
            }

            const response = await fetch(
                `${BASE_URL}api/excel/arrival?${params.toString()}`,
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
            link.download = `Приходы_${formatDateToDDMMYYYY(
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
            toast.error("Ошибка при скачивании файла");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFiltersChange = (filters: any) => {
        console.log("Filters changed:", filters);
        setExcelFilters(filters);
        // Only call API if both dates are present
        if (
            filters.start_date &&
            filters.end_date &&
            filters.start_date.trim() !== "" &&
            filters.end_date.trim() !== ""
        ) {
            console.log(
                "Both dates present, calling getTotalCount with new filters"
            );
            // Call getTotalCount with the new filters directly
            getTotalCountWithFilters(filters);
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
                `${BASE_URL}api/excel/arrival?${params.toString()}`,
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

    // Note: totalCount is now set by API calls in getTotalCountWithFilters
    // instead of being based on arrivals.length

    return (
        <>
            <ComponentCard
                title="Склад"
                desc={
                    <div className="flex gap-3 items-center">
                        {/* Supplier Filter */}
                        <div className="flex items-center gap-2">
                            <div className="min-w-[200px]">
                                <Select
                                    options={[
                                        { value: 0, label: "Все поставщики" },
                                        ...suppliers.map((supplier) => ({
                                            value: parseInt(
                                                supplier.supplier_id
                                            ),
                                            label: supplier.supplier_name,
                                        })),
                                    ]}
                                    placeholder="Выберите поставщика"
                                    onChange={(value) =>
                                        onSupplierFilterChange(value)
                                    }
                                    onSearch={onSupplierSearch}
                                    searching={isSearchingSuppliers}
                                    searchable={true}
                                    defaultValue={selectedSupplierId}
                                />
                            </div>
                            {selectedSupplierId && (
                                <button
                                    onClick={onClearSupplierFilter}
                                    className="text-red-600 hover:text-red-800 bg-red-100 p-3 rounded-md text-sm font-medium"
                                >
                                    <IoMdCloseCircle size={20} />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
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
                            <button
                                onClick={() => setAddArrivalModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Добавить приход
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                                <tr>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        #
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Инвойс номер
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Поставщик
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Пользователь
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Общая сумма
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Цена доставки
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Валюта
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                                        Комментарии
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Дата
                                    </th>
                                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {arrivals.length === 0 ? (
                                    <tr>
                                        <td
                                            className="text-center py-8 text-gray-500 dark:text-gray-400"
                                            colSpan={7}
                                        >
                                            Приходы не найдены
                                        </td>
                                    </tr>
                                ) : (
                                    arrivals.map((arrival, index) => (
                                        <tr
                                            key={arrival.arrival_id}
                                            className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                        >
                                            <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                {index + 1}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                {arrival.invoice_number || "—"}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-8 h-8 rounded-full ${getSupplierBadgeColor(
                                                            arrival.supplier_name
                                                        )} flex items-center justify-center text-white text-sm font-medium mr-3`}
                                                    >
                                                        {getSupplierInitial(
                                                            arrival.supplier_name
                                                        )}
                                                    </div>
                                                    <span className="font-medium">
                                                        {arrival.supplier_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                {arrival.user_name}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                <div className="space-y-2">
                                                    <div className="font-medium">
                                                        {parseFloat(
                                                            arrival.total_payments ||
                                                                "0"
                                                        ) > 0 &&
                                                        parseFloat(
                                                            arrival.total_payments ||
                                                                "0"
                                                        ) <
                                                            parseFloat(
                                                                arrival.total_price
                                                            ) ? (
                                                            // Qisman to'langan holatda
                                                            <>
                                                                <span className="text-green-600 dark:text-green-400">
                                                                    {parseFloat(
                                                                        arrival.total_payments ||
                                                                            "0"
                                                                    )
                                                                        .toLocaleString()
                                                                        .replace(
                                                                            /,/g,
                                                                            " "
                                                                        )}
                                                                </span>
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    {" "}
                                                                    /{" "}
                                                                </span>
                                                                <span className="text-red-600 dark:text-red-400">
                                                                    {parseFloat(
                                                                        arrival.total_price
                                                                    )
                                                                        .toLocaleString()
                                                                        .replace(
                                                                            /,/g,
                                                                            " "
                                                                        )}{" "}
                                                                    {
                                                                        arrival.cash_type_text
                                                                    }
                                                                </span>
                                                                {/* <span className="text-gray-500 dark:text-gray-400">

                                                                </span> */}
                                                            </>
                                                        ) : parseFloat(
                                                              arrival.total_payments ||
                                                                  "0"
                                                          ) >=
                                                          parseFloat(
                                                              arrival.total_price
                                                          ) ? (
                                                            // 100% to'langan holatda
                                                            <span className="text-green-600 dark:text-green-400">
                                                                {parseFloat(
                                                                    arrival.total_price
                                                                )
                                                                    .toLocaleString()
                                                                    .replace(
                                                                        /,/g,
                                                                        " "
                                                                    )}{" "}
                                                                {
                                                                    arrival.cash_type_text
                                                                }
                                                            </span>
                                                        ) : (
                                                            // 0% to'lanmagan holatda
                                                            <span className="text-red-600 dark:text-red-400">
                                                                {parseFloat(
                                                                    arrival.total_price
                                                                )
                                                                    .toLocaleString()
                                                                    .replace(
                                                                        /,/g,
                                                                        " "
                                                                    )}{" "}
                                                                {
                                                                    arrival.cash_type_text
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 relative overflow-hidden">
                                                        {/* To'langan qism - 100% bo'lsa yashil, aks holda sariq */}
                                                        <div
                                                            className={`h-2 absolute left-0 top-0 ${
                                                                parseFloat(
                                                                    arrival.total_payments ||
                                                                        "0"
                                                                ) >=
                                                                parseFloat(
                                                                    arrival.total_price
                                                                )
                                                                    ? "bg-green-500 rounded-full"
                                                                    : "bg-yellow-500 rounded-l-full"
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(
                                                                    (parseFloat(
                                                                        arrival.total_payments ||
                                                                            "0"
                                                                    ) /
                                                                        parseFloat(
                                                                            arrival.total_price
                                                                        )) *
                                                                        100,
                                                                    100
                                                                )}%`,
                                                            }}
                                                        ></div>
                                                        {/* To'lanmagan qism - faqat 100% bo'lmagan holatda ko'rsatiladi */}
                                                        {parseFloat(
                                                            arrival.total_payments ||
                                                                "0"
                                                        ) <
                                                            parseFloat(
                                                                arrival.total_price
                                                            ) && (
                                                            <div
                                                                className="h-2 rounded-r-full bg-red-500 absolute left-0 top-0"
                                                                style={{
                                                                    width: `${
                                                                        100 -
                                                                        Math.min(
                                                                            (parseFloat(
                                                                                arrival.total_payments ||
                                                                                    "0"
                                                                            ) /
                                                                                parseFloat(
                                                                                    arrival.total_price
                                                                                )) *
                                                                                100,
                                                                            100
                                                                        )
                                                                    }%`,
                                                                    left: `${Math.min(
                                                                        (parseFloat(
                                                                            arrival.total_payments ||
                                                                                "0"
                                                                        ) /
                                                                            parseFloat(
                                                                                arrival.total_price
                                                                            )) *
                                                                            100,
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                {arrival.delivery_price ===
                                                "0" ? (
                                                    <div className="flex items-center text-green-600 dark:text-green-400">
                                                        <FreeDeliveryIcon className="w-4 h-4 mr-1" />
                                                        <span className="text-xs font-medium">
                                                            Free
                                                        </span>
                                                    </div>
                                                ) : arrival.delivery_price ? (
                                                    parseFloat(
                                                        arrival.delivery_price
                                                    )
                                                        .toLocaleString()
                                                        .replace(/,/g, " ")
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                {arrival.cash_type_text}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-center">
                                                {arrival.comments &&
                                                arrival.comments.trim() !==
                                                    "" ? (
                                                    <div className="relative group">
                                                        <CommentIcon className="w-5 h-5 text-green-500 mx-auto cursor-pointer hover:text-green-600 transition-colors" />
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                            {arrival.comments}
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <CommentIcon className="w-5 h-5 text-gray-300 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                <div>
                                                    <div className="font-medium">
                                                        {formatDateTime(
                                                            arrival.created_at
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        onClick={() =>
                                                            handleItemsClick(
                                                                arrival
                                                            )
                                                        }
                                                        size="xs"
                                                        variant="outline"
                                                        startIcon={
                                                            <EyeIcon className="w-4 h-4" />
                                                        }
                                                    >
                                                        {""}
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            handlePaymentClick(
                                                                arrival
                                                            )
                                                        }
                                                        size="xs"
                                                        variant="primary"
                                                        startIcon={
                                                            <CreditCardIcon className="w-4 h-4" />
                                                        }
                                                    >
                                                        {""}
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setDeleteModalOpen(
                                                                true
                                                            );
                                                            setSelectedArrival(
                                                                arrival
                                                            );
                                                        }}
                                                        size="xs"
                                                        variant="danger"
                                                        startIcon={
                                                            <TrashBinIcon className="size-4" />
                                                        }
                                                    >
                                                        {""}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ComponentCard>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                className="max-w-md"
            >
                <div className="p-6 text-center">
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

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Удалить приход
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить приход от "
                        {selectedArrival?.supplier_name}
                        "?
                        <br />
                        Это действие нельзя отменить.
                    </p>

                    <div className="flex justify-center space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="px-6 py-2.5"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-6 py-2.5"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal */}
            {selectedPaymentArrival && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => {
                        setPaymentModalOpen(false);
                        setSelectedPaymentArrival(null);
                    }}
                    arrivalId={selectedPaymentArrival.arrival_id}
                    arrivalSupplier={selectedPaymentArrival.supplier_name}
                    paymentHistory={selectedPaymentArrival.payment_history}
                    totalPrice={selectedPaymentArrival.total_price}
                    totalPayments={selectedPaymentArrival.total_payments}
                    arrivalDollarRate={
                        selectedPaymentArrival.arrival_dollar_rate
                    }
                    cashTypeText={selectedPaymentArrival.cash_type_text}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}

            {/* Items Modal */}
            <Modal
                isOpen={itemsModalOpen}
                onClose={() => {
                    setItemsModalOpen(false);
                    setSelectedItemsArrival(null);
                    setArrivalItems([]);
                    setActiveTab("items");
                }}
                className="max-w-4xl"
            >
                <div className="p-6">
                    <div className=" mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Детали прихода{" "}
                        </h3>
                        <span className="text-gray-500">
                            {selectedItemsArrival?.invoice_number && (
                                <span>
                                    Инвойс:{" "}
                                    {selectedItemsArrival.invoice_number}
                                </span>
                            )}
                        </span>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("items")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "items"
                                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                }`}
                            >
                                Товары
                            </button>
                            <button
                                onClick={() => setActiveTab("payments")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "payments"
                                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                }`}
                            >
                                История платежей
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "items" ? (
                        loadingItems ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">
                                    Загрузка...
                                </span>
                            </div>
                        ) : arrivalItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Товары не найдены
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    #
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Материал
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Количество
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Цена за единицу
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Общая стоимость
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                            {arrivalItems.map((item, index) => (
                                                <tr
                                                    key={item.arrival_item_id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                        <div className="font-medium">
                                                            {item.material_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            ID:{" "}
                                                            {item.material_id}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {parseFloat(item.amount)
                                                            .toLocaleString()
                                                            .replace(
                                                                /,/g,
                                                                " "
                                                            )}{" "}
                                                        {item.short_name}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {parseFloat(item.price)
                                                            .toLocaleString()
                                                            .replace(
                                                                /,/g,
                                                                " "
                                                            )}{" "}
                                                        {selectedItemsArrival?.cash_type_text ||
                                                            "сум"}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {(
                                                            parseFloat(
                                                                item.amount
                                                            ) *
                                                            parseFloat(
                                                                item.price
                                                            )
                                                        )
                                                            .toLocaleString()
                                                            .replace(
                                                                /,/g,
                                                                " "
                                                            )}{" "}
                                                        {selectedItemsArrival?.cash_type_text ||
                                                            "сум"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Общее количество товаров:
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {arrivalItems.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Общая стоимость:
                                        </span>
                                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {arrivalItems
                                                .reduce(
                                                    (total, item) =>
                                                        total +
                                                        parseFloat(
                                                            item.amount
                                                        ) *
                                                            parseFloat(
                                                                item.price
                                                            ),
                                                    0
                                                )
                                                .toLocaleString()
                                                .replace(/,/g, " ")}{" "}
                                            {selectedItemsArrival?.cash_type_text ||
                                                "сум"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : // Payments Tab
                    selectedItemsArrival?.payment_history &&
                      selectedItemsArrival.payment_history.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Пользователь
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Сумма
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Способ оплаты
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Тип валюты
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Дата
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedItemsArrival.payment_history.map(
                                        (payment, index) => (
                                            <tr
                                                key={payment.payment_id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                    <div className="font-medium">
                                                        {payment.user_name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <div className="font-medium text-green-600 dark:text-green-400">
                                                        {parseFloat(
                                                            payment.payment_amount
                                                        )
                                                            .toLocaleString()
                                                            .replace(
                                                                /,/g,
                                                                " "
                                                            )}{" "}
                                                        {payment.cash_type_text}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {
                                                        payment.payment_method_text
                                                    }
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {payment.cash_type_text}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <div className="text-sm">
                                                        {formatDateTime(
                                                            payment.created_at
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            История платежей не найдена
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={() => {
                                setItemsModalOpen(false);
                                setSelectedItemsArrival(null);
                                setArrivalItems([]);
                            }}
                            variant="outline"
                        >
                            Закрыть
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Arrival Modal */}
            <AddArrival
                isOpen={addArrivalModalOpen}
                onClose={() => setAddArrivalModalOpen(false)}
                changeStatus={changeStatus}
            />

            {/* Arrival Excel Download Modal */}
            <ArrivalExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onDownload={handleExcelDownload}
                isLoading={isDownloading}
                suppliers={suppliers}
                onFiltersChange={handleFiltersChange}
                totalCount={totalCount}
                onSupplierSearch={onSupplierSearch}
                isSearchingSuppliers={isSearchingSuppliers}
            />
        </>
    );
}
