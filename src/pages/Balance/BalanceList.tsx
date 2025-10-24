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
import TableBalance from "./TableBalance.tsx";
import AddBalance from "./AddBalance.tsx";
import { formatCurrency } from "../../utils/numberFormat.ts";

interface Balance {
    id: number;
    payment_amount: number;
    payment_method: number;
    comments?: string;
    created_at: string;
    payment_method_text?: string;
    user_name: string;
}

export default function BalanceList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredBalances, setFilteredBalances] = useState<Balance[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [currentbalance, setCurrenbBalance] = useState(0);

    const fetchBalances = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/balance/list?page=${page}&limit=30`
            );
            const balancesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredBalances(balancesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching balances:", error);
            toast.error("Что-то пошло не так при загрузке балансов");
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                fetchBalances();
                return;
            }

            if (query.trim().length < 3) {
                fetchBalances();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/balance/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredBalances(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchBalances();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchBalances();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchBalances]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchBalances();
    }, [status, fetchBalances]);
    const balance = () => {
        GetDataSimple(`api/balance/available`).then((res) => {
            setCurrenbBalance(res.available_balance);
        });
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchBalances();
        balance();
    }, [fetchBalances]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "balance") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                fetchBalances();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchBalances]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="WAREHOUSE" description="Баланс" />
            <PageBreadcrumb pageTitle="Баланс" />
            <ComponentCard
                title="Список балансов"
                desc={
                    <div className="flex justify-between items-center gap-10">
                        {" "}
                        <div className="flex items-center gap-2">
                            <p>
                                Баланс :{" "}
                                <span className="text-green-500 font-medium">
                                    {formatCurrency(currentbalance)} сум
                                </span>
                            </p>
                        </div>{" "}
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
                            Добавить баланс
                        </button>
                    </div>
                }
            >
                <TableBalance
                    balances={filteredBalances}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddBalance
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
