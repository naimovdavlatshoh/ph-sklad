import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableReturn from "./TableReturn.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";

interface ReturnItem {
    return_id: string;
    issue_id: string;
    issue_item_id: string;
    material_name: string;
    quantity: string;
    foreman_name: string;
    issued_to_name: string;
    return_user_name: string;
    expected_return_date: string;
    return_date: string;
    delay_days: number;
    returned_on_time: boolean;
    return_status_text: string;
    issue_condition_type: string;
    issue_condition_note: string;
    return_condition_type: string;
    return_condition_note: string;
}

export default function ReturnList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredReturns, setFilteredReturns] = useState<ReturnItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/materialsissues/returnlist?page=${page}&limit=30`
            );
            const returnsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredReturns(returnsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching returns:", error);
            toast.error("Что-то пошло не так при загрузке возвратов");
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                fetchReturns();
                return;
            }

            if (query.trim().length < 3) {
                fetchReturns();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/materialsissues/returnsearch?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredReturns(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchReturns();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchReturns();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchReturns]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchReturns();
    }, [status, fetchReturns]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "returns") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                fetchReturns();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchReturns]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="WAREHOUSE" description="Возвраты" />
            <PageBreadcrumb pageTitle="Возвраты" />
            <ComponentCard
                title="Список возвратов"
                desc="Просмотр всех возвращенных материалов"
            >
                <TableReturn
                    returns={filteredReturns}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

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
