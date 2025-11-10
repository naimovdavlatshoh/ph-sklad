import { useEffect, useState, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { GetDataSimple, DeleteData } from "../../service/data.ts";
import Loader from "../../components/ui/loader/Loader.tsx";
import Pagination from "../../components/common/Pagination.tsx";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal.tsx";
import AddPrixodModal from "../../components/modals/AddPrixodModal.tsx";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/button/Button.tsx";
import { TrashBinIcon } from "../../icons/index.ts";
import { IoMdAdd } from "react-icons/io";

export default function PrixodTab() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const [addPrixodModalOpen, setAddPrixodModalOpen] = useState(false);

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

    // Visible columns with Russian headers (exclude IDs)
    const columns: { key: string; label: string }[] = [
        { key: "user_name", label: "Пользователь" },
        { key: "payment_method_text", label: "Метод оплаты" },
        { key: "arrival_amount_formatted", label: "Сумма (UZS)" },
        { key: "moment_usd_rate", label: "Курс USD" },
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

    const fetchArrivals = useCallback(async () => {
        setLoading(true);
        try {
            const res: any = await GetDataSimple(
                `api/kassabank/arrivals/list?page=${page}&limit=10`
            );
            const list = res?.result || res?.data?.result || [];
            const pages = res?.pages || res?.data?.pages || 1;
            setItems(list);
            setTotalPages(pages);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchArrivals();
    }, [fetchArrivals]);

    const handleDeleteClick = (item: any) => {
        setSelectedItem(item);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedItem) return;

        setDeleting(true);
        try {
            await DeleteData(
                `api/kassabank/arrivals/delete/${selectedItem.arrival_id}`
            );
            toast.success("Приход успешно удален");
            setDeleteModalOpen(false);
            setSelectedItem(null);
            fetchArrivals();
        } catch (error) {
            console.error("Error deleting arrival:", error);
            toast.error("Ошибка при удалении прихода");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <PageMeta title="WAREHOUSE" description="КассаБанк — Приход" />
            <ComponentCard
                title="Приход"
                desc={
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setAddPrixodModalOpen(true)}
                            variant="primary"
                            size="sm"
                            startIcon={<IoMdAdd className="size-4" />}
                        >
                            Добавить
                        </Button>
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
                                                {/* <button
                                                    onClick={() =>
                                                        handleDeleteClick(row)
                                                    }
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Удалить"
                                                >
                                                    <DeleteIcon className="w-5 h-5" />
                                                </button> */}
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
                message="Вы уверены, что хотите удалить этот приход?"
                itemName={
                    selectedItem ? `ID: ${selectedItem.arrival_id}` : undefined
                }
                isLoading={deleting}
            />

            <AddPrixodModal
                isOpen={addPrixodModalOpen}
                onClose={() => setAddPrixodModalOpen(false)}
                onSuccess={() => {
                    fetchArrivals();
                    setAddPrixodModalOpen(false);
                }}
            />
        </>
    );
}
