import { useEffect, useState, useCallback } from "react";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import Loader from "../../components/ui/loader/Loader.tsx";
// import Button from "../../components/ui/button/Button.tsx";
import AddCategoryModal from "./AddCategoryModal.tsx";

interface Category {
    category_id: string;
    category_name: string;
    is_active: string;
    created_at: string;
    updated_at: string | null;
}

export default function CategoryTab() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredCategories, setFilteredCategories] = useState<Category[]>(
        []
    );
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    // Excel functionality can be added later if needed

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/kitchen/categorylist?page=${page}&limit=30`
            );
            const categoriesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredCategories(categoriesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Что-то пошло не так при загрузке категорий");
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                fetchCategories();
                return;
            }

            // If search query is too short, don't search, just fetch all data
            if (query.trim().length < 3) {
                console.log("Search query is too short, fetching all data");
                fetchCategories();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/kitchen/categorysearch?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredCategories(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchCategories();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchCategories();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchCategories]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchCategories();
    }, [status, fetchCategories]);

    // Format date to DD.MM.YYYY, HH:MM format
    const formatDateTime = (dateString: string) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}.${month}.${year}, ${hours}:${minutes}`;
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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
                fetchCategories();
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchCategories]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="space-y-6">
                <ComponentCard
                    title="Категории"
                    desc={
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
                                Добавить категорию
                            </button>
                        </div>
                    }
                >
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <tr>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            #
                                        </th>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Название категории
                                        </th>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Статус
                                        </th>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Дата создания
                                        </th>
                                        {/* <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Действия
                                        </th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {filteredCategories.length === 0 ? (
                                        <tr>
                                            <td
                                                className="text-center py-8 text-gray-500 dark:text-gray-400"
                                                colSpan={5}
                                            >
                                                Категории не найдены
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCategories.map(
                                            (category, index) => (
                                                <tr
                                                    key={category.category_id}
                                                    className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                                >
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        <div className="font-normal">
                                                            {
                                                                category.category_name
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        <div
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                category.is_active ===
                                                                "1"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            }`}
                                                        >
                                                            {category.is_active ===
                                                            "1"
                                                                ? "Активна"
                                                                : "Неактивна"}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        <div>
                                                            <div className="font-normal">
                                                                {formatDateTime(
                                                                    category.created_at
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* <td className="px-5 py-4 text-sm">
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                size="xs"
                                                                variant="outline"
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
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                        />
                                                                    </svg>
                                                                }
                                                            >
                                                                {""}
                                                            </Button>
                                                            <Button
                                                                size="xs"
                                                                variant="danger"
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
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                        />
                                                                    </svg>
                                                                }
                                                            >
                                                                {""}
                                                            </Button>
                                                        </div>
                                                    </td> */}
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </ComponentCard>
            </div>

            <AddCategoryModal
                isOpen={isOpen}
                onClose={closeModal}
                onSuccess={changeStatus}
            />

            {/* <Toaster
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
            /> */}
        </>
    );
}
