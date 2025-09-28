import { useEffect, useState, useCallback } from "react";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import { BASE_URL, GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import Loader from "../../components/ui/loader/Loader.tsx";
import TableKitchen from "../Arrivals/TableKitchen.tsx";
import AddKitchenModal from "../Arrivals/AddKitchenModal.tsx";
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
    short_name: string;
}

export default function KitchenTab() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredKitchens, setFilteredKitchens] = useState<Kitchen[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
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

            // If search query is too short, don't search, just fetch all data
            if (query.trim().length < 3) {
                console.log("Search query is too short, fetching all data");
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
        fetchKitchens();
    }, [status, fetchKitchens]);

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
                `${BASE_URL}api/excel/kitchen?${params.toString()}`,
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
            link.download = `Кухня_${formatDateToDDMMYYYY(
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
                `${BASE_URL}api/excel/kitchen?${params.toString()}`,
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
        fetchKitchens();
        fetchSuppliers();
    }, [fetchKitchens, fetchSuppliers]);

    // Handle search and page changes
    useEffect(() => {
        console.log("Search effect triggered:", {
            currentPage,
            searchQuery,
            status,
        });
        if (currentPage === "kitchen") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                console.log("Performing search for:", searchQuery);
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                console.log("Empty search, fetching all data");
                fetchKitchens();
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchKitchens]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="space-y-6">
                <ComponentCard
                    title="Кухня"
                    desc={
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
                                Добавить приход на кухню
                            </button>
                        </div>
                    }
                >
                    <TableKitchen
                        kitchens={filteredKitchens}
                        changeStatus={changeStatus}
                    />
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </ComponentCard>
            </div>

            <AddKitchenModal
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
            />

            {/* Kitchen Excel Download Modal */}
            <KitchenExcelDownloadModal
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
