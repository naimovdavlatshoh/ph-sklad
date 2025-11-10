import { useEffect, useState, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { GetDataSimple, DeleteData, PostSimple } from "../../service/data.ts";
import Loader from "../../components/ui/loader/Loader.tsx";
import Pagination from "../../components/common/Pagination.tsx";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal.tsx";
import KassabankDollarRateModal from "../../components/modals/KassabankDollarRateModal.tsx";
import CategoryModal from "../../components/modals/CategoryModal.tsx";
import AddRasxodModal from "../../components/modals/AddRasxodModal.tsx";
import Select from "../../components/form/Select.tsx";
import InputField from "../../components/form/input/InputField.tsx";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/button/Button.tsx";
import { TrashBinIcon, DollarLineIcon } from "../../icons/index.ts";
import { TbCategory } from "react-icons/tb";
import { IoMdAdd } from "react-icons/io";

export default function RasxodTab() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const [dollarRateModalOpen, setDollarRateModalOpen] = useState(false);
    const [dollarRate, setDollarRate] = useState<number | null>(null);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [addRasxodModalOpen, setAddRasxodModalOpen] = useState(false);

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
    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            let url = `api/kassabank/payments/list?page=${page}&limit=10`;
            if (selectedCategoryId && selectedCategoryId !== "0") {
                url += `&category_id=${selectedCategoryId}`;
            }
            const res: any = await GetDataSimple(url);
            const list = res?.result || res?.data?.result || [];
            const pages = res?.pages || res?.data?.pages || 1;
            setItems(list);
            setTotalPages(pages);
        } finally {
            setLoading(false);
        }
    }, [page, selectedCategoryId]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const fetchDollarRate = useCallback(async () => {
        try {
            const response = await GetDataSimple("api/kassabank/dollar");
            const rate =
                response?.dollar_rate ||
                response?.data?.dollar_rate ||
                response?.result ||
                null;
            setDollarRate(rate ? Number(rate) : null);
        } catch (error) {
            console.error("Error fetching dollar rate:", error);
        }
    }, []);

    useEffect(() => {
        fetchDollarRate();
    }, [fetchDollarRate]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await GetDataSimple(
                "api/kassabank/categories/list"
            );
            const list =
                response ||
                response?.data?.result ||
                response?.categories ||
                [];
            setCategories(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCategoryChange = (value: string) => {
        setSelectedCategoryId(value === "0" ? "" : value);
        setPage(1); // Reset to first page when category changes
    };

    const handleSearch = useCallback(
        async (keyword: string) => {
            if (keyword.trim().length < 3) {
                // If keyword is less than 3 characters, fetch normal list
                fetchPayments();
                return;
            }

            setLoading(true);
            try {
                const res: any = await PostSimple(
                    `api/kassabank/payments/search?keyword=${encodeURIComponent(
                        keyword
                    )}`,
                    {}
                );
                const list = res?.data?.result || res?.result || [];
                const pages = res?.data?.pages || res?.pages || 1;
                setItems(list);
                setTotalPages(pages);
            } catch (error) {
                console.error("Error searching payments:", error);
                toast.error("Ошибка при поиске");
            } finally {
                setLoading(false);
            }
        },
        [fetchPayments]
    );

    // Search effect - only trigger when searchKeyword changes and has at least 3 characters
    useEffect(() => {
        if (searchKeyword.trim().length >= 3) {
            const timeoutId = setTimeout(() => {
                handleSearch(searchKeyword);
            }, 500); // Debounce 500ms

            return () => clearTimeout(timeoutId);
        } else if (searchKeyword.trim().length === 0) {
            // If search is cleared, fetch normal list
            fetchPayments();
        }
    }, [searchKeyword, handleSearch, fetchPayments]);

    const handleDeleteClick = (item: any) => {
        setSelectedItem(item);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedItem) return;

        setDeleting(true);
        try {
            await DeleteData(
                `api/kassabank/payments/delete/${selectedItem.payment_id}`
            );
            toast.success("Расход успешно удален");
            setDeleteModalOpen(false);
            setSelectedItem(null);
            fetchPayments();
        } catch (error) {
            console.error("Error deleting payment:", error);
            toast.error("Ошибка при удалении расхода");
        } finally {
            setDeleting(false);
        }
    };

    // Define visible columns with Russian headers
    const columns: { key: string; label: string }[] = [
        { key: "payment_id", label: "ID" },
        { key: "user_name", label: "Пользователь" },
        { key: "category_name", label: "Категория" },
        { key: "payment_amount_formatted", label: "Сумма (UZS)" },
        { key: "payment_amount_usd_formatted", label: "Сумма (USD)" },
        { key: "cash_type_text", label: "Валюта" },
        { key: "payment_method_text", label: "Метод оплаты" },
        { key: "comments", label: "Комментарий" },
        { key: "created_at", label: "Дата" },
    ];

    const formatCell = (key: string, value: any) => {
        if (key === "created_at" && typeof value === "string") {
            const d = new Date(value.replace(" ", "T"));
            if (!isNaN(d.getTime())) {
                const dd = String(d.getDate()).padStart(2, "0");
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const yyyy = d.getFullYear();
                return `${dd}.${mm}.${yyyy}`;
            }
            return value.split(" ")[0] || value;
        }
        return value ?? "";
    };

    return (
        <>
            <PageMeta title="WAREHOUSE" description="КассаБанк — Расход" />
            <ComponentCard
                title="Расход"
                desc={
                    <div className="flex items-center gap-2">
                        <div className="w-[300px]">
                            <InputField
                                id="search_input"
                                type="text"
                                placeholder="Введите минимум 3 символа для поиска..."
                                value={searchKeyword}
                                onChange={(e) => {
                                    setSearchKeyword(e.target.value);
                                }}
                            />
                        </div>
                        <div className="w-[200px]">
                            <Select
                                options={[
                                    { value: 0, label: "Все категории" },
                                    ...categories.map((cat) => ({
                                        value: Number(cat.category_id),
                                        label: cat.category_name,
                                    })),
                                ]}
                                placeholder="Выберите категорию"
                                onChange={handleCategoryChange}
                                defaultValue={
                                    selectedCategoryId
                                        ? selectedCategoryId
                                        : "0"
                                }
                            />
                        </div>
                        <button
                            onClick={() => setDollarRateModalOpen(true)}
                            className="px-4 flex items-center gap-2 bg-green-500 text-white h-[40px] rounded-lg"
                        >
                            <DollarLineIcon className="size-4" />
                            {dollarRate !== null && (
                                <span className="ml-1 font-semibold">
                                    {dollarRate.toLocaleString("ru-RU")} сум
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setCategoryModalOpen(true)}
                            className="px-4 flex items-center gap-2 bg-black text-white h-[40px] rounded-lg"
                        >
                            <TbCategory className="size-3" />
                            Категории
                        </button>
                        <button
                            onClick={() => setAddRasxodModalOpen(true)}
                            className="px-4 flex items-center gap-2 bg-blue-500 text-white h-[40px] rounded-lg"
                        >
                            <IoMdAdd className="size-4" />
                            Добавить
                        </button>
                    </div>
                }
            >
                {loading ? (
                    <Loader />
                ) : (
                    <div className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/40">
                                    <tr>
                                        {columns.map((c) => (
                                            <th
                                                key={c.key}
                                                className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                {c.label}
                                            </th>
                                        ))}
                                        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className="border-b border-gray-100 dark:border-gray-800"
                                        >
                                            {columns.map((c) => (
                                                <td
                                                    key={c.key}
                                                    className="px-4 py-2"
                                                >
                                                    {c.key === "comments" ? (
                                                        row[c.key] &&
                                                        String(
                                                            row[c.key]
                                                        ).trim() !== "" ? (
                                                            <div className="relative group inline-flex items-center">
                                                                <CommentIcon className="w-5 h-5 text-green-500 cursor-pointer hover:text-green-600 transition-colors" />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                                    {row[c.key]}
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <CommentIcon className="w-5 h-5 text-gray-300" />
                                                        )
                                                    ) : (
                                                        String(
                                                            formatCell(
                                                                c.key,
                                                                row[c.key]
                                                            )
                                                        )
                                                    )}
                                                </td>
                                            ))}
                                            <td className="px-4 py-2">
                                                <Button
                                                    onClick={() =>
                                                        handleDeleteClick(row)
                                                    }
                                                    size="xs"
                                                    variant="danger"
                                                    startIcon={
                                                        <TrashBinIcon className="size-4" />
                                                    }
                                                >
                                                    {""}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td
                                                className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                                                colSpan={columns.length + 1}
                                            >
                                                Данных нет
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </ComponentCard>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedItem(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этот расход?"
                itemName={
                    selectedItem ? `ID: ${selectedItem.payment_id}` : undefined
                }
                isLoading={deleting}
            />

            <KassabankDollarRateModal
                isOpen={dollarRateModalOpen}
                onClose={() => {
                    setDollarRateModalOpen(false);
                    fetchDollarRate(); // Refresh dollar rate after modal closes
                }}
            />

            <CategoryModal
                isOpen={categoryModalOpen}
                onClose={() => {
                    setCategoryModalOpen(false);
                    fetchCategories(); // Refresh categories after modal closes
                }}
            />

            <AddRasxodModal
                isOpen={addRasxodModalOpen}
                onClose={() => setAddRasxodModalOpen(false)}
                onSuccess={() => {
                    fetchPayments();
                    setAddRasxodModalOpen(false);
                }}
            />
        </>
    );
}
