import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { BASE_URL, GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import ExcelDownloadModal from "../../components/modals/ExcelDownloadModal.tsx";
import Button from "../../components/ui/button/Button.tsx";

import Loader from "../../components/ui/loader/Loader.tsx";
import TableSupplier from "./TableSupplier.tsx";
import AddSupplier from "./AddSupplier.tsx";

interface Supplier {
    supplier_id: number;
    supplier_name: string;
    supplier_phone: string;
    bank_account: string;
    created_at: string;
}

export default function SupplierList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/supplier/list?page=${page}&limit=30`
            );
            const suppliersData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredSuppliers(suppliersData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            toast.error("Что-то пошло не так при загрузке поставщиков");
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                // If search is empty, fetch all suppliers
                fetchSuppliers();
                return;
            }

            // If search query is too short, don't search, just fetch all suppliers
            if (query.trim().length < 3) {
                console.log(
                    "Search query is too short, fetching all suppliers"
                );
                fetchSuppliers();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/supplier/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredSuppliers(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchSuppliers();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchSuppliers();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchSuppliers]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchSuppliers();
    }, [status, fetchSuppliers]);

    const handleExcelDownload = async () => {
        setIsDownloading(true);
        try {
            // Get token from localStorage
            const token = localStorage.getItem("token");

            const response = await fetch(`${BASE_URL}api/excel/supplier`, {
                method: "GET",
                headers: {
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to download Excel file");
            }

            // Check if response is actually an Excel file
            const contentType = response.headers.get("content-type");
            console.log("Response Content-Type:", contentType);

            const blob = await response.blob();
            console.log("Blob size:", blob.size, "bytes");
            console.log("Blob type:", blob.type);

            // Create blob with correct MIME type
            const excelBlob = new Blob([blob], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(excelBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Поставщики_${
                new Date().toISOString().split("T")[0]
            }.xlsx`;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();

            // Clean up
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

    // Initial fetch when component mounts
    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    // Handle search and page changes
    useEffect(() => {
        console.log("Search effect triggered:", {
            currentPage,
            searchQuery,
            status,
        });
        if (currentPage === "suppliers") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                console.log("Performing search for:", searchQuery);
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                console.log("Empty search, fetching all suppliers");
                fetchSuppliers();
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchSuppliers]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="PH-sklad" description="Список поставщиков" />
            <PageBreadcrumb pageTitle="Поставщики" />
            <ComponentCard
                title="Список поставщиков"
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
                            Добавить поставщика
                        </button>
                    </div>
                }
            >
                <TableSupplier
                    suppliers={filteredSuppliers}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddSupplier
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
            />

            {/* Excel Download Modal */}
            <ExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onDownload={handleExcelDownload}
                isLoading={isDownloading}
                title="Скачать Excel - Поставщики"
                message="Вы хотите скачать список поставщиков в формате Excel?"
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
