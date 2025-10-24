import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { BASE_URL, GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableMaterialsIssues from "./TableMaterialsIssues.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import Loader from "../../components/ui/loader/Loader.tsx";
import CreateMaterialIssuance from "./CreateMaterialIssuance.tsx";
import ReturnTool from "./ReturnTool.tsx";
import MaterialsIssuesExcelDownloadModal from "../../components/modals/MaterialsIssuesExcelDownloadModal.tsx";
import Button from "../../components/ui/button/Button.tsx";

interface MaterialIssue {
    id: number;
    foreman_id: number;
    foreman_name: string;
    expected_return_date: string;
    comments?: string;
    created_at: string;
    items: MaterialIssueItem[];
}

interface MaterialIssueItem {
    id: number;
    material_id: number;
    material_name: string;
    quantity: number;
    condition_type: string;
    condition_note?: string;
    returned: boolean;
    return_date?: string;
    actual_return_date: string;
}

// interface Foreman {
//     foreman_id: number;
//     foreman_name: string;
//     phone_number: string;
// }

// interface Material {
//     material_id: number;
//     material_name: string;
//     category_name: string;
//     unit_name: string;
// }

export default function MaterialsIssuesList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredIssues, setFilteredIssues] = useState<MaterialIssue[]>([]);
    // const [foremen, setForemen] = useState<Foreman[]>([]);
    // const [materials, setMaterials] = useState<Material[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [returnFilter, setReturnFilter] = useState<"without" | "with">(
        "with"
    );
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [foremen, setForemen] = useState<any[]>([]);
    const [isSearchingForemen, setIsSearchingForemen] = useState(false);
    const [excelFilters, setExcelFilters] = useState({
        start_date: "",
        end_date: "",
        foreman_id: "",
    });
    const [totalCount, setTotalCount] = useState(0);

    const fetchIssues = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/materialsissues/list?page=${page}&limit=30&return_filter=${returnFilter}`
            );
            const issuesData = response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredIssues(issuesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching material issues:", error);
            toast.error("Что-то пошло не так при загрузке выданных материалов");
        }
    }, [page, returnFilter]);

    // const fetchForemen = useCallback(async () => {
    //     try {
    //         const response: any = await GetDataSimple(
    //             `api/foreman/list?page=1&limit=100`
    //         );
    //         const foremenData =
    //             response?.result || response?.data?.result || [];
    //         setForemen(foremenData);
    //     } catch (error) {
    //         console.error("Error fetching foremen:", error);
    //     }
    // }, []);

    // const fetchMaterials = useCallback(async () => {
    //     try {
    //         const response: any = await GetDataSimple(
    //             `api/materials/list?page=1&limit=100`
    //         );
    //         const materialsData =
    //             response?.result || response?.data?.result || [];
    //         setMaterials(materialsData);
    //     } catch (error) {
    //         console.error("Error fetching materials:", error);
    //     }
    // }, []);

    const fetchForemen = useCallback(async () => {
        try {
            const response: any = await GetDataSimple(
                "api/foreman/list?page=1&limit=100"
            );
            const foremenData =
                response?.result || response?.data?.result || [];
            setForemen(foremenData);
        } catch (error) {
            console.error("Error fetching foremen:", error);
        }
    }, []);

    // Search foremen function
    const handleForemanSearch = async (query: string) => {
        if (!query.trim()) {
            fetchForemen();
            return;
        }

        // Only search if query has at least 3 characters
        if (query.trim().length < 3) {
            return;
        }

        try {
            setIsSearchingForemen(true);
            const response = await fetch(
                `${BASE_URL}api/foreman/search?keyword=${encodeURIComponent(
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
                setForemen(data.result || data.data || []);
            }
        } catch (error) {
            console.error("Error searching foremen:", error);
        } finally {
            setIsSearchingForemen(false);
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

            if (excelFilters.foreman_id) {
                params.append("foreman_id", excelFilters.foreman_id);
            }

            const response = await fetch(
                `${BASE_URL}api/excel/materialissues?${params.toString()}`,
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
            link.download = `Выдача-материалов_${formatDateToDDMMYYYY(
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
            toast.error("Ошибка при скачивании Excel файла");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFiltersChange = (newFilters: any) => {
        setExcelFilters(newFilters);
        // Only call API if both dates are present
        if (
            newFilters.start_date &&
            newFilters.end_date &&
            newFilters.start_date.trim() !== "" &&
            newFilters.end_date.trim() !== ""
        ) {
            // Call getTotalCount with the new filters directly
            getTotalCountWithFilters(newFilters);
        } else {
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
            setTotalCount(0);
            return;
        }

        try {
            const formattedStartDate = formatDateToDDMMYYYY(filters.start_date);
            const formattedEndDate = formatDateToDDMMYYYY(filters.end_date);

            const params = new URLSearchParams({
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                count: "1",
            });

            if (filters.foreman_id) {
                params.append("foreman_id", filters.foreman_id);
            }

            const response = await fetch(
                `${BASE_URL}api/excel/materialissues?${params.toString()}`,
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
            setTotalCount(0);
        }
    };

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                fetchIssues();
                return;
            }

            if (query.trim().length < 3) {
                fetchIssues();
                return;
            }

            setIsSearching(true);
            try {
                // Search both material issues and returns
                const response: any = await PostSimple(
                    `api/materialsissues/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredIssues(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchIssues();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchIssues();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchIssues]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchIssues();
    }, [status, fetchIssues]);

    const handleReturnTool = (issueId: number) => {
        setSelectedIssueId(issueId);
        setReturnModalOpen(true);
    };

    const handleFilterChange = (filter: "without" | "with") => {
        setReturnFilter(filter);
        setPage(1); // Reset to first page when filter changes
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchIssues();
        fetchForemen();
    }, [fetchIssues, fetchForemen]);

    // Fetch foremen and materials when modal opens
    // useEffect(() => {
    //     if (isOpen) {
    //         fetchForemen();
    //         fetchMaterials();
    //     }
    // }, [isOpen, fetchForemen, fetchMaterials]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "materialsissues") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                fetchIssues();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchIssues]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="WAREHOUSE" description="Выдача материалов" />
            <PageBreadcrumb pageTitle="Выдача" />
            <ComponentCard
                title="Список выданных материалов"
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
                            Создать выдачу
                        </button>
                    </div>
                }
            >
                <TableMaterialsIssues
                    issues={filteredIssues}
                    changeStatus={changeStatus}
                    onReturnTool={handleReturnTool}
                    activeFilter={returnFilter}
                    onFilterChange={handleFilterChange}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <CreateMaterialIssuance
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
            />

            <ReturnTool
                isOpen={returnModalOpen}
                onClose={() => {
                    setReturnModalOpen(false);
                    setSelectedIssueId(null);
                    changeStatus();
                }}
                changeStatus={changeStatus}
                issueId={selectedIssueId}
            />

            {/* Materials Issues Excel Download Modal */}
            <MaterialsIssuesExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onDownload={handleExcelDownload}
                isLoading={isDownloading}
                foremen={foremen}
                onFiltersChange={handleFiltersChange}
                totalCount={totalCount}
                onForemanSearch={handleForemanSearch}
                isSearchingForemen={isSearchingForemen}
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
