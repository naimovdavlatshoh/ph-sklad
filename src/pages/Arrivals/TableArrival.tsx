import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";
import PaymentModal from "../../components/modals/PaymentModal";

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

// Credit card icon SVG
const CreditCardIcon = ({ className }: { className?: string }) => (
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
    </svg>
);

interface PaymentHistory {
    payment_id: string;
    user_id: string;
    user_name: string;
    arrival_id: string;
    payment_amount: string;
    payment_method: string;
    payment_method_text: string;
    cash_type: string;
    cash_type_text: string;
    payment_dollar_rate: string;
    created_at: string;
}

interface Arrival {
    arrival_id: string;
    invoice_number: string;
    user_name: string;
    supplier_id: string;
    supplier_name: string;
    payment_status: string;
    payment_status_text: string;
    total_price: string;
    delivery_price: string;
    arrival_dollar_rate: string;
    comments: string;
    created_at: string;
    total_payments: string;
    payment_history: PaymentHistory[];
}

interface TableArrivalProps {
    arrivals: Arrival[];
    changeStatus: () => void;
}

export default function TableArrival({
    arrivals,
    changeStatus,
}: TableArrivalProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedArrival, setSelectedArrival] = useState<Arrival | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPaymentArrival, setSelectedPaymentArrival] =
        useState<Arrival | null>(null);

    const handleDelete = async () => {
        if (!selectedArrival) return;

        setIsDeleting(true);
        try {
            await DeleteData(
                `api/arrival/delete/${selectedArrival.arrival_id}`
            );
            toast.success("Приход успешно удален");
            changeStatus();
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error("Ошибка при удалении прихода");
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePaymentClick = (arrival: Arrival) => {
        setSelectedPaymentArrival(arrival);
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        changeStatus(); // Refresh the arrivals list
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

    // Generate random color for supplier badge
    const getSupplierBadgeColor = (supplierName: string) => {
        const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-indigo-500",
            "bg-yellow-500",
            "bg-red-500",
            "bg-teal-500",
        ];
        const hash = supplierName.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    };

    // Get first letter of supplier name
    const getSupplierInitial = (supplierName: string) => {
        return supplierName.charAt(0).toUpperCase();
    };

    // calculateTotal function is no longer needed as total_price comes from backend

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
                                    Инвойс номер
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Поставщик
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Пользователь
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Общая сумма
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Статус оплаты
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                                    Комментарии
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Дата
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {arrivals.length === 0 ? (
                                <tr>
                                    <td
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                        colSpan={8}
                                    >
                                        Приходы не найдены
                                    </td>
                                </tr>
                            ) : (
                                arrivals.map((arrival, index) => (
                                    <tr
                                        key={arrival.arrival_id}
                                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                    >
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {arrival.invoice_number || "—"}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-8 h-8 rounded-full ${getSupplierBadgeColor(
                                                        arrival.supplier_name
                                                    )} flex items-center justify-center text-white text-sm font-medium mr-3`}
                                                >
                                                    {getSupplierInitial(
                                                        arrival.supplier_name
                                                    )}
                                                </div>
                                                <span className="font-medium">
                                                    {arrival.supplier_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {arrival.user_name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white font-medium">
                                            {parseInt(
                                                arrival.total_price
                                            ).toLocaleString()}{" "}
                                            сум
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    arrival.payment_status ===
                                                    "3"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                        : arrival.payment_status ===
                                                          "2"
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                                }`}
                                            >
                                                {arrival.payment_status_text}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-center">
                                            {arrival.comments &&
                                            arrival.comments.trim() !== "" ? (
                                                <div className="relative group">
                                                    <CommentIcon className="w-5 h-5 text-green-500 mx-auto cursor-pointer hover:text-green-600 transition-colors" />
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                        {arrival.comments}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <CommentIcon className="w-5 h-5 text-gray-300 mx-auto" />
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            <div>
                                                <div className="font-medium">
                                                    {formatDate(
                                                        arrival.created_at
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {formatTime(
                                                        arrival.created_at
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() =>
                                                        handlePaymentClick(
                                                            arrival
                                                        )
                                                    }
                                                    size="xs"
                                                    variant="primary"
                                                    startIcon={
                                                        <CreditCardIcon className="w-4 h-4" />
                                                    }
                                                >
                                                    {""}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setDeleteModalOpen(
                                                            true
                                                        );
                                                        setSelectedArrival(
                                                            arrival
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
                        Удалить приход
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить приход от "
                        {selectedArrival?.supplier_name}
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

            {/* Payment Modal */}
            {selectedPaymentArrival && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => {
                        setPaymentModalOpen(false);
                        setSelectedPaymentArrival(null);
                    }}
                    arrivalId={selectedPaymentArrival.arrival_id}
                    arrivalSupplier={selectedPaymentArrival.supplier_name}
                    paymentHistory={selectedPaymentArrival.payment_history}
                    totalPrice={selectedPaymentArrival.total_price}
                    totalPayments={selectedPaymentArrival.total_payments}
                    arrivalDollarRate={
                        selectedPaymentArrival.arrival_dollar_rate
                    }
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
}
