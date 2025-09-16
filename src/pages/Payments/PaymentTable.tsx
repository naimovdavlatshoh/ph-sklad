import { useState } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { Payment } from "./PaymentList";
import Pagination from "../../components/common/Pagination";
import { TrashBinIcon } from "../../icons";
import { formatDateTime } from "../../utils/numberFormat";

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

interface PaymentTableProps {
    payments: Payment[];
    loading: boolean;
    onDelete: (paymentId: string, supplierName: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isSearching: boolean;
}

export function PaymentTable({
    payments,
    loading,
    onDelete,
    currentPage,
    totalPages,
    onPageChange,
    isSearching,
}: PaymentTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const getCashTypeColor = (cashTypeText: string) => {
        return cashTypeText === "Доллар"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    };

    // Removed formatDate function - using formatDateTime from utils

    const formatAmount = (amount: string, cashTypeText: string) => {
        const currency = cashTypeText === "Доллар" ? "$" : "сум";
        return `${parseFloat(amount).toLocaleString()} ${currency}`;
    };

    const handleDelete = async (paymentId: string, supplierName: string) => {
        setDeletingId(paymentId);
        try {
            await onDelete(paymentId, supplierName);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                    <svg
                        className="mx-auto h-12 w-12 mb-4"
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
                    <p>{isSearching ? "Платежи не найдены" : "Нет платежей"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    #
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Номер счета
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Поставщик
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Сумма платежа
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Курс доллара
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Способ оплаты
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Валюта
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Комментарий
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Пользователь
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Дата создания
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Действия
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment, index) => (
                                <TableRow
                                    key={payment.payment_id}
                                    className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                >
                                    <TableCell className="px-5 py-4">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {index + 1}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {payment.invoice_number}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-5 py-4">
                                        <div>
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {payment.supplier_name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {formatAmount(
                                                payment.payment_amount,
                                                payment.cash_type_text
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            <div>
                                                Платеж:{" "}
                                                {parseFloat(
                                                    payment.payment_dollar_rate_that_time
                                                ).toLocaleString()}{" "}
                                                сум
                                            </div>
                                            <div>
                                                Приход:{" "}
                                                {parseFloat(
                                                    payment.arrival_dollar_rate_that_time
                                                ).toLocaleString()}{" "}
                                                сум
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${getPaymentMethodColor(
                                                payment.payment_method
                                            )}`}
                                        >
                                            {payment.payment_method_text}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${getCashTypeColor(
                                                payment.cash_type_text
                                            )}`}
                                        >
                                            {payment.cash_type_text}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-center">
                                        {payment.comments &&
                                        payment.comments.trim() !== "" ? (
                                            <div className="relative group">
                                                <CommentIcon className="w-5 h-5 text-green-500 mx-auto cursor-pointer hover:text-green-600 transition-colors" />
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                    {payment.comments}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <CommentIcon className="w-5 h-5 text-gray-300 mx-auto" />
                                        )}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {payment.user_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {formatDateTime(payment.created_at)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <Button
                                            onClick={() =>
                                                handleDelete(
                                                    payment.payment_id,
                                                    payment.supplier_name
                                                )
                                            }
                                            size="xs"
                                            variant="danger"
                                            disabled={
                                                deletingId ===
                                                payment.payment_id
                                            }
                                            startIcon={
                                                <TrashBinIcon className="size-4" />
                                            }
                                        >
                                            {""}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {!isSearching && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}
