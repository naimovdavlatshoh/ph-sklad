import { useState, useEffect, useCallback } from "react";
import { GetDataSimple, PostSimple, DeleteData } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import Pagination from "../../components/common/Pagination.tsx";
import Button from "../../components/ui/button/Button.tsx";
import { TrashBinIcon } from "../../icons/index.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import AddExpense from "./AddExpense.tsx";

// Comment icon SVG
const CommentIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
    </svg>
);

interface Expense {
    id: string;
    expense_name: string;
    amount: string;
    comments: string;
    created_at: string;
    user_name: string;
    quantity: string;
    material_name: string;
    object_name?: string;
}

interface TableExpensesProps {
    searchQuery: string;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function TableExpenses({
    searchQuery,
    currentPage,
    onPageChange,
}: TableExpensesProps) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [status, setStatus] = useState(false);

    const changeStatus = () => setStatus((prev) => !prev);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/expenses/list?page=${currentPage}&limit=10`
            );

            const data = response?.result || response?.data?.result || [];
            const pages = response?.pages || response?.data?.pages || 1;

            setExpenses(data);
            setTotalPages(pages);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            toast.error("Ошибка при загрузке расходов");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || query.trim().length < 3) {
                fetchExpenses();
                return;
            }

            setLoading(true);
            try {
                const response: any = await PostSimple(
                    `api/expenses/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${currentPage}&limit=10`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setExpenses(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchExpenses();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchExpenses();
            } finally {
                setLoading(false);
            }
        },
        [currentPage, fetchExpenses]
    );

    const handleDelete = async () => {
        if (!selectedExpense) return;

        setIsDeleting(true);
        try {
            const response: any = await DeleteData(
                `api/expenses/delete/${selectedExpense.id}`
            );

            if (response?.status === 200 || response?.success) {
                toast.success("Расход успешно удален");
                setDeleteModalOpen(false);
                setSelectedExpense(null);
                changeStatus();
            } else {
                toast.error("Ошибка при удалении расхода");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Ошибка при удалении расхода");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        if (searchQuery.trim() && searchQuery.trim().length >= 3) {
            performSearch(searchQuery);
        } else {
            fetchExpenses();
        }
    }, [searchQuery, fetchExpenses, performSearch, status]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="space-y-4">
                {/* Add Expense Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setAddExpenseModalOpen(true)}
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

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full">
                            <table className="w-full text-sm">
                                {" "}
                                {/* text-sm umumiy qilib */}
                                <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <tr>
                                        <th className="px-4 py-2 font-medium text-gray-500 text-start">
                                            #
                                        </th>
                                        <th className="px-4 py-2 font-medium text-gray-500 text-start">
                                            Объект
                                        </th>
                                        <th className="px-4 py-2 font-medium text-gray-500 text-start">
                                            Материал
                                        </th>
                                        <th className="px-4 py-2 font-medium text-gray-500 text-start">
                                            Количество
                                        </th>
                                        <th className="px-4 py-2 font-medium text-gray-500 text-start">
                                            Описание
                                        </th>
                                        <th className="px-4 py-2 font-medium text-gray-500 text-start">
                                            Пользователь
                                        </th>
                                        <th className="px-4 py-2 font-medium text-gray-500 text-start">
                                            Дата
                                        </th>
                                        <th className="px-4 py-2 font-medium text-gray-500 text-start">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-sm">
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={11}
                                                className="text-center py-6 text-gray-500 text-sm"
                                            >
                                                Расходы не найдены
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map((expense, index) => (
                                            <tr
                                                key={expense.id}
                                                className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                            >
                                                <td className="px-4 py-2">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {expense.object_name || "—"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {expense.material_name ||
                                                        "—"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {parseFloat(
                                                        expense.quantity
                                                    ).toString()}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {expense.comments &&
                                                    expense.comments.trim() !==
                                                        "" ? (
                                                        <div className="relative group">
                                                            <CommentIcon className="w-5 h-5 text-green-500 mx-auto cursor-pointer hover:text-green-600 transition-colors" />
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                                {
                                                                    expense.comments
                                                                }
                                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <CommentIcon className="w-5 h-5 text-gray-300 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {expense.user_name}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div>
                                                        <div className="font-medium">
                                                            {formatDate(
                                                                expense.created_at
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formatTime(
                                                                expense.created_at
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {/* @ts-ignore */}
                                                    <Button
                                                        onClick={() => {
                                                            setDeleteModalOpen(
                                                                true
                                                            );
                                                            setSelectedExpense(
                                                                expense
                                                            );
                                                        }}
                                                        size="xs"
                                                        variant="danger"
                                                        startIcon={
                                                            <TrashBinIcon className="size-4" />
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </table>
                    </div>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                className="max-w-md"
            >
                <div className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">
                        Удалить расход
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Вы уверены, что хотите удалить расход "
                        {selectedExpense?.expense_name}"?
                        <br />
                        Это действие нельзя отменить.
                    </p>

                    <div className="flex justify-center space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Expense Modal */}
            <AddExpense
                isOpen={addExpenseModalOpen}
                onClose={() => setAddExpenseModalOpen(false)}
                changeStatus={changeStatus}
            />
        </>
    );
}
