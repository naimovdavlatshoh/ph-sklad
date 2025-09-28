import { useEffect, useState, useCallback } from "react";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import { GetDataSimple, PostSimple, DeleteData } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import Loader from "../../components/ui/loader/Loader.tsx";
import Button from "../../components/ui/button/Button.tsx";
import AddExpenseModal from "./AddExpenseModal.tsx";
import ExpenseExcelDownloadModal from "./ExpenseExcelDownloadModal.tsx";
import { Modal } from "../../components/ui/modal";

interface Expense {
    expense_id: string;
    category_id: string;
    category_name: string;
    number_of_people: string;
    expense_date: string;
    comments: string;
    created_at: string;
    updated_at: string | null;
}

export default function ExpenseTab() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const {
        isOpen: isExcelModalOpen,
        openModal: openExcelModal,
        closeModal: closeExcelModal,
    } = useModal();
    const [loading, setLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);
    // Excel functionality can be added later if needed

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/kitchen/expenselist?page=${page}&limit=30`
            );
            const expensesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredExpenses(expensesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            toast.error("Что-то пошло не так при загрузке расходов");
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                fetchExpenses();
                return;
            }

            // If search query is too short, don't search, just fetch all data
            if (query.trim().length < 3) {
                console.log("Search query is too short, fetching all data");
                fetchExpenses();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/kitchen/expensesearch?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredExpenses(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchExpenses();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchExpenses();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchExpenses]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchExpenses();
    }, [status, fetchExpenses]);

    const handleDelete = async () => {
        if (!selectedExpense) return;

        setIsDeleting(true);
        try {
            await DeleteData(
                `api/kitchen/expensedelete/${selectedExpense.expense_id}`
            );
            toast.success("Расход успешно удален");
            changeStatus();
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error("Ошибка при удалении расхода");
        } finally {
            setIsDeleting(false);
        }
    };

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

    // Excel functionality can be added later if needed

    // Initial fetch when component mounts
    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

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
                fetchExpenses();
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchExpenses]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="space-y-6">
                <ComponentCard
                    title="Расходы"
                    desc={
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openExcelModal}
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
                                Добавить расход
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
                                            Категория
                                        </th>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Количество людей
                                        </th>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Дата расхода
                                        </th>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Комментарии
                                        </th>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Дата создания
                                        </th>
                                        <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td
                                                className="text-center py-8 text-gray-500 dark:text-gray-400"
                                                colSpan={7}
                                            >
                                                Расходы не найдены
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExpenses.map(
                                            (expense, index) => (
                                                <tr
                                                    key={expense.expense_id}
                                                    className="border-b border-gray-100 font-normal dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                                >
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {
                                                                expense.category_name
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        <div className="font-normal text-blue-600 dark:text-blue-400">
                                                            {
                                                                expense.number_of_people
                                                            }{" "}
                                                            чел.
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        <div className="font-normal">
                                                            {new Date(
                                                                expense.expense_date
                                                            ).toLocaleDateString(
                                                                "ru-RU"
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-black dark:text-white">
                                                        {expense.comments ||
                                                            "—"}
                                                    </td>
                                                    <td className="px-5 py-4 font-normal text-sm text-black dark:text-white">
                                                        <div>
                                                            <div className="font-normal">
                                                                {formatDateTime(
                                                                    expense.expense_date
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm">
                                                        <div className="flex items-center space-x-2">
                                                            {/* <Button
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
                                                            </Button> */}
                                                            <Button
                                                                size="xs"
                                                                variant="danger"
                                                                onClick={() => {
                                                                    setDeleteModalOpen(
                                                                        true
                                                                    );
                                                                    setSelectedExpense(
                                                                        expense
                                                                    );
                                                                }}
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
                                                    </td>
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

            <AddExpenseModal
                isOpen={isOpen}
                onClose={closeModal}
                onSuccess={changeStatus}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                className="max-w-md"
            >
                <div className="p-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900">
                        <svg
                            className="w-6 h-6 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Удалить расход
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить расход для категории "
                        {selectedExpense?.category_name}
                        "?
                        <br />
                        Это действие нельзя отменить.
                    </p>

                    <div className="flex justify-center space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="px-6 py-2.5"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-6 py-2.5"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ExpenseExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={closeExcelModal}
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
