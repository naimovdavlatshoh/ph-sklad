import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import Loader from "../../components/ui/loader/Loader.tsx";
import TableKitchen from "./TableKitchen";
import AddKitchenModal from "./AddKitchenModal";
import TabNavigation from "../../components/common/TabNavigation.tsx";
import TableOstatki from "../Warehouse/TableOstatki.tsx";
import TableExpenses from "../Expenses/TableExpenses.tsx";
import KitchenExcelDownloadModal from "../../components/modals/KitchenExcelDownloadModal.tsx";
import Button from "../../components/ui/button/Button.tsx";

interface Kitchen {
    kitchen_id: string;
    invoice_number: string;
    user_name: string;
    supplier_id: string;
    supplier_name: string;
    total_price: string;
    delivery_price: string;
    comments: string;
    created_at: string;
    items?: KitchenItem[];
}

interface KitchenItem {
    kitchen_item_id: string;
    kitchen_id: string;
    material_id: string;
    material_name: string;
    amount: string;
    price: string;
    created_at: string;
}

export default function KitchenList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredKitchens, setFilteredKitchens] = useState<Kitchen[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("kuxnya");

    // Excel download states
    const {
        isOpen: isExcelModalOpen,
        openModal: openExcelModal,
        closeModal: closeExcelModal,
    } = useModal();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [excelFilters, setExcelFilters] = useState({
        start_date: "",
        end_date: "",
        supplier_id: "",
    });
    const [excelTotalCount, setExcelTotalCount] = useState(0);
    const [isExcelLoading, setIsExcelLoading] = useState(false);
    const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);

    const tabs = [
        {
            id: "ostatki",
            label: "Остатки",
        },
        {
            id: "prixod",
            label: "Приход",
        },
        {
            id: "kuxnya",
            label: "Кухня",
        },
        {
            id: "rasxod",
            label: "Расход",
        },
    ];

    const fetchKitchens = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/kitchen/list?page=${page}&limit=30`
            );
            const kitchensData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredKitchens(kitchensData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching kitchens:", error);
            toast.error("Что-то пошло не так при загрузке кухни");
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                fetchKitchens();
                return;
            }

            if (query.trim().length < 3) {
                fetchKitchens();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/kitchen/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredKitchens(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchKitchens();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchKitchens();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchKitchens]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        if (activeTab === "kuxnya") {
            fetchKitchens();
        }
    }, [status, fetchKitchens, activeTab]);

    // Excel download functions
    const fetchSuppliers = useCallback(async () => {
        try {
            const response = await GetDataSimple(
                "api/supplier/list?page=1&limit=100"
            );
            const suppliersData =
                response?.result || response?.data?.result || [];
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            toast.error("Ошибка загрузки поставщиков");
        }
    }, []);

    const searchSuppliers = useCallback(
        async (query: string) => {
            if (query.length < 3) {
                fetchSuppliers();
                return;
            }

            setIsSearchingSuppliers(true);
            try {
                const response = await PostSimple(
                    `api/supplier/search?keyword=${encodeURIComponent(query)}`
                );
                const suppliersData =
                    response?.data?.result || response?.data || [];
                setSuppliers(suppliersData);
            } catch (error) {
                console.error("Error searching suppliers:", error);
                fetchSuppliers();
            } finally {
                setIsSearchingSuppliers(false);
            }
        },
        [fetchSuppliers]
    );

    const handleExcelFiltersChange = useCallback((filters: any) => {
        setExcelFilters(filters);

        // Count records based on filters
        if (filters.start_date && filters.end_date) {
            // Convert dates to DD-MM-YYYY format for API
            const startDate = new Date(filters.start_date);
            const endDate = new Date(filters.end_date);

            const formatDate = (date: Date) => {
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            const startDateFormatted = formatDate(startDate);
            const endDateFormatted = formatDate(endDate);

            // Count records with date range
            fetchKitchenCount(startDateFormatted, endDateFormatted);
        }
    }, []);

    const fetchKitchenCount = useCallback(
        async (startDate: string, endDate: string) => {
            try {
                const response = await GetDataSimple(
                    `api/kitchen/list?start_date=${startDate}&end_date=${endDate}&page=1&limit=1`
                );
                const totalCount =
                    response?.total || response?.data?.total || 0;
                setExcelTotalCount(totalCount);
            } catch (error) {
                console.error("Error fetching kitchen count:", error);
                setExcelTotalCount(0);
            }
        },
        []
    );

    const handleExcelDownload = useCallback(async () => {
        if (
            !excelFilters.start_date ||
            !excelFilters.end_date ||
            !excelFilters.supplier_id
        ) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }

        setIsExcelLoading(true);
        try {
            // Convert dates to DD-MM-YYYY format
            const startDate = new Date(excelFilters.start_date);
            const endDate = new Date(excelFilters.end_date);

            const formatDate = (date: Date) => {
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            const startDateFormatted = formatDate(startDate);
            const endDateFormatted = formatDate(endDate);

            const url = `api/excel/kitchen?start_date=${startDateFormatted}&end_date=${endDateFormatted}&supplier_id=${excelFilters.supplier_id}&count=${excelTotalCount}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Download failed");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `kitchen_${startDateFormatted}_${endDateFormatted}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            toast.success("Excel файл успешно скачан");
            closeExcelModal();
        } catch (error) {
            console.error("Excel download error:", error);
            toast.error("Ошибка при скачивании Excel файла");
        } finally {
            setIsExcelLoading(false);
        }
    }, [excelFilters, excelTotalCount, closeExcelModal]);

    // Initial fetch when component mounts
    useEffect(() => {
        if (activeTab === "kuxnya") {
            fetchKitchens();
        }
    }, [fetchKitchens, activeTab]);

    // Fetch suppliers when Excel modal opens
    useEffect(() => {
        if (isExcelModalOpen) {
            fetchSuppliers();
        }
    }, [isExcelModalOpen, fetchSuppliers]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "arrivals" && activeTab === "kuxnya") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                fetchKitchens();
            }
        }
    }, [
        searchQuery,
        currentPage,
        status,
        activeTab,
        performSearch,
        fetchKitchens,
    ]);

    if (loading) {
        return <Loader />;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "ostatki":
                return (
                    <TableOstatki
                        searchQuery={searchQuery}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                );
            case "prixod":
                return (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Переключитесь на вкладку "Приход" в основном разделе
                    </div>
                );
            case "kuxnya":
                return (
                    <>
                        <TableKitchen
                            kitchens={filteredKitchens}
                            changeStatus={changeStatus}
                        />
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                );
            case "rasxod":
                return (
                    <TableExpenses
                        searchQuery={searchQuery}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                );
            default:
                return null;
        }
    };

    const getPageTitle = () => {
        switch (activeTab) {
            case "ostatki":
                return "Склад";
            case "prixod":
                return "Склад";
            case "kuxnya":
                return "Кухня";
            case "rasxod":
                return "Склад";
            default:
                return "Склад";
        }
    };

    const getAddButton = () => {
        if (activeTab === "kuxnya") {
            return (
                <div className="flex gap-3">
                    <button
                        onClick={openModal}
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
                        Добавить кухню
                    </button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openExcelModal}
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
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <PageMeta title="PH-sklad" description={getPageTitle()} />
            <PageBreadcrumb pageTitle={getPageTitle()} />

            <div className="space-y-6">
                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <ComponentCard title={getPageTitle()} desc={getAddButton()}>
                    {renderTabContent()}
                </ComponentCard>
            </div>

            {activeTab === "kuxnya" && (
                <AddKitchenModal
                    isOpen={isOpen}
                    onClose={() => {
                        closeModal();
                        changeStatus();
                    }}
                    changeStatus={changeStatus}
                />
            )}

            <KitchenExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={closeExcelModal}
                onDownload={handleExcelDownload}
                isLoading={isExcelLoading}
                suppliers={suppliers}
                onFiltersChange={handleExcelFiltersChange}
                totalCount={excelTotalCount}
                onSupplierSearch={searchSuppliers}
                isSearchingSuppliers={isSearchingSuppliers}
            />

            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#10B981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#EF4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
        </>
    );
}
