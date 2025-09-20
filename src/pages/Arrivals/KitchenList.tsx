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
                `api/kitchen/list?page=${page}&limit=10`
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
                    )}&page=${page}&limit=10`
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

    // Initial fetch when component mounts
    useEffect(() => {
        if (activeTab === "kuxnya") {
            fetchKitchens();
        }
    }, [fetchKitchens, activeTab]);

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
