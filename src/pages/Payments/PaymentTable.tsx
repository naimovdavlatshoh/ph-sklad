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
import { Modal } from "../../components/ui/modal/index.tsx";
import { GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";

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

interface PaymentDetails {
    arrival_id: string;
    invoice_number: string;
    user_name: string;
    supplier_id: string;
    supplier_name: string;
    payment_status: string;
    payment_status_text: string;
    total_price: string;
    delivery_price: string;
    total_price_formatted: string;
    delivery_price_formatted: string;
    arrival_dollar_rate: string;
    cash_type: string;
    cash_type_text: string;
    comments: string;
    created_at: string;
    total_payments: string;
    items: Array<{
        arrival_item_id: string;
        arrival_id: string;
        material_id: string;
        material_name: string;
        unit_name: string;
        short_name: string;
        amount: string;
        amount_formatted: string;
        price: string;
        price_formatted: string;
        created_at: string;
    }>;
    payment_history: Array<{
        payment_id: string;
        user_id: string;
        user_name: string;
        arrival_id: string;
        payment_amount: string;
        payment_amount_formatted: string;
        payment_method: string;
        payment_method_text: string;
        cash_type: string;
        cash_type_text: string;
        payment_dollar_rate: string;
        created_at: string;
    }>;
}

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
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
        null
    );
    const [loadingDetails, setLoadingDetails] = useState(false);

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

    // const formatAmount = (amount: string, cashTypeText: string) => {
    //     const currency = cashTypeText === "Доллар" ? "$" : "сум";
    //     return `${parseFloat(amount)
    //         .toLocaleString()
    //         .replace(/,/g, " ")} ${currency}`;
    // };

    const handleDelete = async (paymentId: string, supplierName: string) => {
        setDeletingId(paymentId);
        try {
            await onDelete(paymentId, supplierName);
        } finally {
            setDeletingId(null);
        }
    };

    const handleViewPayment = async (arrivalId: string) => {
        setLoadingDetails(true);
        try {
            const response = await GetDataSimple(
                `api/payments/read/${arrivalId}`
            );
            setPaymentDetails(response);
            setViewModalOpen(true);
        } catch (error: any) {
            toast.error(
                error.response?.data?.error ||
                    "Ошибка при загрузке деталей платежа"
            );
        } finally {
            setLoadingDetails(false);
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
                                            {payment?.payment_amount_formatted}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            <div>
                                                Платеж:{" "}
                                                {parseFloat(
                                                    payment.payment_dollar_rate_that_time
                                                )
                                                    .toLocaleString()
                                                    .replace(/,/g, " ")}{" "}
                                                сум
                                            </div>
                                            <div>
                                                Приход:{" "}
                                                {parseFloat(
                                                    payment.arrival_dollar_rate_that_time
                                                )
                                                    .toLocaleString()
                                                    .replace(/,/g, " ")}{" "}
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
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={() =>
                                                    handleViewPayment(
                                                        payment.arrival_id
                                                    )
                                                }
                                                size="xs"
                                                variant="outline"
                                                disabled={loadingDetails}
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
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                }
                                            >
                                                {""}
                                            </Button>
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
                                        </div>
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

            {/* View Payment Details Modal */}
            <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                className="max-w-4xl"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Детали платежа
                        </h3>
                        <button
                            onClick={() => setViewModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {loadingDetails ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : paymentDetails ? (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Основная информация
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">
                                                ID прихода:
                                            </span>{" "}
                                            {paymentDetails.arrival_id}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Номер счета:
                                            </span>{" "}
                                            {paymentDetails.invoice_number}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Поставщик:
                                            </span>{" "}
                                            {paymentDetails.supplier_name}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Пользователь:
                                            </span>{" "}
                                            {paymentDetails.user_name}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Статус:
                                            </span>
                                            <span
                                                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                    paymentDetails.payment_status ===
                                                    "3"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                }`}
                                            >
                                                {
                                                    paymentDetails.payment_status_text
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Финансовая информация
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">
                                                Общая сумма:
                                            </span>{" "}
                                            {
                                                paymentDetails.total_price_formatted
                                            }{" "}
                                            {paymentDetails.cash_type_text}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Доставка:
                                            </span>{" "}
                                            {
                                                paymentDetails.delivery_price_formatted
                                            }{" "}
                                            {paymentDetails.cash_type_text}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Курс доллара:
                                            </span>{" "}
                                            {parseFloat(
                                                paymentDetails.arrival_dollar_rate
                                            )
                                                .toLocaleString()
                                                .replace(/,/g, " ")}{" "}
                                            сум
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Общие платежи:
                                            </span>{" "}
                                            {parseFloat(
                                                paymentDetails.total_payments
                                            )
                                                .toLocaleString()
                                                .replace(/,/g, " ")}{" "}
                                            {paymentDetails.cash_type_text}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Дата создания:
                                            </span>{" "}
                                            {formatDateTime(
                                                paymentDetails.created_at
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comments */}
                            {paymentDetails.comments && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Комментарий
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {paymentDetails.comments}
                                    </p>
                                </div>
                            )}

                            {/* Items */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                                    Товары
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-2">
                                                    Материал
                                                </th>
                                                <th className="text-left py-2">
                                                    Количество
                                                </th>
                                                <th className="text-left py-2">
                                                    Цена
                                                </th>
                                                <th className="text-left py-2">
                                                    Сумма
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paymentDetails.items.map(
                                                (item) => (
                                                    <tr
                                                        key={
                                                            item.arrival_item_id
                                                        }
                                                        className="border-b border-gray-200 dark:border-gray-700"
                                                    >
                                                        <td className="py-2">
                                                            {item.material_name}
                                                        </td>
                                                        <td className="py-2">
                                                            {
                                                                item.amount_formatted
                                                            }{" "}
                                                            {item.short_name}
                                                        </td>
                                                        <td className="py-2">
                                                            {
                                                                item.price_formatted
                                                            }{" "}
                                                            {
                                                                paymentDetails.cash_type_text
                                                            }
                                                        </td>
                                                        <td className="py-2">
                                                            {(
                                                                parseFloat(
                                                                    item.amount
                                                                ) *
                                                                parseFloat(
                                                                    item.price
                                                                )
                                                            )
                                                                .toLocaleString()
                                                                .replace(
                                                                    /,/g,
                                                                    " "
                                                                )}{" "}
                                                            {
                                                                paymentDetails.cash_type_text
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment History */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                                    История платежей
                                </h4>
                                <div className="space-y-3">
                                    {paymentDetails.payment_history.map(
                                        (payment) => (
                                            <div
                                                key={payment.payment_id}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <span className="font-medium">
                                                            Сумма:
                                                        </span>{" "}
                                                        {
                                                            payment.payment_amount_formatted
                                                        }{" "}
                                                        {payment.cash_type_text}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Способ:
                                                        </span>{" "}
                                                        {
                                                            payment.payment_method_text
                                                        }
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Пользователь:
                                                        </span>{" "}
                                                        {payment.user_name}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Курс доллара:
                                                        </span>{" "}
                                                        {parseFloat(
                                                            payment.payment_dollar_rate
                                                        )
                                                            .toLocaleString()
                                                            .replace(
                                                                /,/g,
                                                                " "
                                                            )}{" "}
                                                        сум
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Дата:
                                                        </span>{" "}
                                                        {formatDateTime(
                                                            payment.created_at
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Не удалось загрузить детали платежа
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
