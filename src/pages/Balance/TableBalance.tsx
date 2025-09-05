import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";

interface Balance {
    id: number;
    payment_amount: number;
    payment_method: number;
    comments?: string;
    created_at: string;
    payment_method_text?: string;
    user_name: string;
}

interface TableBalanceProps {
    balances: Balance[];
    changeStatus: () => void;
}

export default function TableBalance({
    balances,
    changeStatus,
}: TableBalanceProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedBalance, setSelectedBalance] = useState<Balance | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedBalance) return;

        setIsDeleting(true);
        try {
            await DeleteData(`api/balance/delete/${selectedBalance.id}`);
            toast.success("Баланс успешно удален");
            changeStatus();
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error("Ошибка при удалении баланса");
        } finally {
            setIsDeleting(false);
        }
    };

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case "1":
                return "Наличка";
            case "2":
                return "Терминал";
            case "3":
                return "Клик";
            case "4":
                return "Перечисление";
            default:
                return "Неизвестно";
        }
    };

    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case "1":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "2":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "3":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
            case "4":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "UZS",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                            <tr>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    #
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Сумма
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Способ оплаты
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Пользователь
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Комментарий
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
                            {balances.length === 0 ? (
                                <tr>
                                    <td
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                        colSpan={6}
                                    >
                                        <div className="flex flex-col items-center">
                                            <svg
                                                className="mx-auto h-12 w-12 mb-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                />
                                            </svg>
                                            <p>Балансы не найдены</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                balances.map((balance, index) => (
                                    <tr
                                        key={balance.id}
                                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                    >
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white font-medium">
                                            {formatCurrency(
                                                balance.payment_amount
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(
                                                    balance.payment_method.toString()
                                                )}`}
                                            >
                                                {getPaymentMethodText(
                                                    balance.payment_method.toString()
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {balance?.user_name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {balance.comments || "—"}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {formatDate(balance.created_at)}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() => {
                                                        setDeleteModalOpen(
                                                            true
                                                        );
                                                        setSelectedBalance(
                                                            balance
                                                        );
                                                    }}
                                                    size="xs"
                                                    variant="danger"
                                                    startIcon={
                                                        <TrashBinIcon className="size-4" />
                                                    }
                                                >
                                                    {""}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                        Удалить баланс
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить запись баланса на сумму{" "}
                        {selectedBalance &&
                            new Intl.NumberFormat("ru-RU", {
                                style: "currency",
                                currency: "UZS",
                                minimumFractionDigits: 0,
                            }).format(selectedBalance.payment_amount)}
                        ?
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
        </>
    );
}
