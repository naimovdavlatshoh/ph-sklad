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
import TableForeman from "./TableForeman.tsx";
import AddForeman from "./AddForeman.tsx";

interface Foreman {
    foreman_id: number;
    foreman_name: string;
    phone_number: string;
    comments?: string;
    created_at: string;
}

export default function ForemanList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredForemen, setFilteredForemen] = useState<Foreman[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const fetchForemen = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/foreman/list?page=${page}&limit=10`
            );
            const foremenData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredForemen(foremenData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching foremen:", error);
            toast.error("Что-то пошло не так при загрузке прорабов");
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                // If search is empty, fetch all foremen
                fetchForemen();
                return;
            }

            // If search query is too short, don't search, just fetch all foremen
            if (query.trim().length < 3) {
                console.log("Search query is too short, fetching all foremen");
                fetchForemen();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/foreman/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=10`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredForemen(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchForemen();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchForemen();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchForemen]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchForemen();
    }, [status, fetchForemen]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchForemen();
    }, [fetchForemen]);

    // Handle search and page changes
    useEffect(() => {
        console.log("Search effect triggered:", {
            currentPage,
            searchQuery,
            status,
        });
        if (currentPage === "foremen") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                console.log("Performing search for:", searchQuery);
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                console.log("Empty search, fetching all foremen");
                fetchForemen();
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchForemen]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="PH-sklad" description="Список прорабов" />
            <PageBreadcrumb pageTitle="Прорабы" />
            <ComponentCard
                title="Список прорабов"
                desc={
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
                        Добавить прораба
                    </button>
                }
            >
                <TableForeman
                    foremen={filteredForemen}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddForeman
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
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
