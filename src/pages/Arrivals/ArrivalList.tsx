import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { BASE_URL, GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import TableArrival from "./TableArrival.tsx";
import TabNavigation from "../../components/common/TabNavigation.tsx";
import TableOstatki from "../Warehouse/TableOstatki.tsx";
import TableExpenses from "../Expenses/TableExpenses.tsx";
import ArrivalExcelDownloadModal from "../../components/modals/ArrivalExcelDownloadModal.tsx";

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
    cash_type_text: string;
    cash_type: string;
    payment_history: PaymentHistory[];
}

export default function ArrivalList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredArrivals, setFilteredArrivals] = useState<Arrival[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("prixod");
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);
    const [excelFilters, setExcelFilters] = useState({
        start_date: "",
        end_date: "",
        supplier_id: "",
    });
    const [totalCount, setTotalCount] = useState(0);

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
            id: "rasxod",
            label: "Расход",
        },
    ];

    const fetchArrivals = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/arrival/list?page=${page}&limit=30`
            );
            const arrivalsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredArrivals(arrivalsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching arrivals:", error);
            toast.error("Что-то пошло не так при загрузке приходов");
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                // If search is empty, fetch all data based on active tab
                if (activeTab === "prixod") {
                    fetchArrivals();
                }
                return;
            }

            // If search query is too short, don't search, just fetch all data
            if (query.trim().length < 3) {
                console.log("Search query is too short, fetching all data");
                if (activeTab === "prixod") {
                    fetchArrivals();
                }
                return;
            }

            setIsSearching(true);
            try {
                let response: any;
                if (activeTab === "prixod") {
                    response = await PostSimple(
                        `api/arrival/search?keyword=${encodeURIComponent(
                            query
                        )}&page=${page}&limit=30`
                    );
                }

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    if (activeTab === "prixod") {
                        setFilteredArrivals(searchResults);
                    }
                    setTotalPages(totalPagesData);
                } else {
                    if (activeTab === "prixod") {
                        fetchArrivals();
                    }
                }
            } catch (error) {
                console.error("Search error:", error);
                if (activeTab === "prixod") {
                    fetchArrivals();
                }
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchArrivals, activeTab]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        if (activeTab === "prixod") {
            fetchArrivals();
        }
    }, [status, fetchArrivals, activeTab]);

    const fetchSuppliers = useCallback(async () => {
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
    }, []);

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

    const formatDateToDDMMYYYY = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

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

    // Initial fetch when component mounts
    useEffect(() => {
        if (activeTab === "prixod") {
            fetchArrivals();
        }
        fetchSuppliers();
    }, [fetchArrivals, fetchSuppliers, activeTab]);

    // Handle search and page changes
    useEffect(() => {
        console.log("Search effect triggered:", {
            currentPage,
            searchQuery,
            status,
            activeTab,
        });
        if (currentPage === "arrivals" && activeTab === "prixod") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                console.log("Performing search for:", searchQuery);
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                console.log("Empty search, fetching all data");
                if (activeTab === "prixod") {
                    fetchArrivals();
                }
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [
        searchQuery,
        currentPage,
        status,
        activeTab,
        performSearch,
        fetchArrivals,
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
                    <>
                        <TableArrival
                            arrivals={filteredArrivals}
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
            case "rasxod":
                return "Склад";
            default:
                return "Склад";
        }
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

                {renderTabContent()}
            </div>

            {/* Arrival Excel Download Modal */}
            <ArrivalExcelDownloadModal
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
