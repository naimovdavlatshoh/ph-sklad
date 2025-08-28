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
import TableArrival from "./TableArrival.tsx";
import AddArrival from "./AddArrival.tsx";


interface Arrival {
    arrival_id: string;
    user_name: string;
    supplier_name: string;
    total_price: string;
    comments: string;
    created_at: string;
}

export default function ArrivalList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredArrivals, setFilteredArrivals] = useState<Arrival[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const fetchArrivals = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/arrival/list?page=${page}&limit=10`
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
                // If search is empty, fetch all arrivals
                fetchArrivals();
                return;
            }

            // If search query is too short, don't search, just fetch all arrivals
            if (query.trim().length < 3) {
                console.log("Search query is too short, fetching all arrivals");
                fetchArrivals();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/arrival/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=10`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredArrivals(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchArrivals();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchArrivals();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchArrivals]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchArrivals();
    }, [status, fetchArrivals]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchArrivals();
    }, [fetchArrivals]);

    // Handle search and page changes
    useEffect(() => {
        console.log("Search effect triggered:", {
            currentPage,
            searchQuery,
            status,
        });
        if (currentPage === "arrivals") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                console.log("Performing search for:", searchQuery);
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                console.log("Empty search, fetching all arrivals");
                fetchArrivals();
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchArrivals]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="PH-sklad" description="Список приходов" />
            <PageBreadcrumb pageTitle="Приходы" />
            <ComponentCard
                title="Список приходов"
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
                        Добавить приход
                    </button>
                }
            >
                <TableArrival
                    arrivals={filteredArrivals}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddArrival
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
