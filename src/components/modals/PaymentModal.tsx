import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import InputField from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Label from "../form/Label";
import Select from "../form/Select";
import { PostDataTokenJson, GetDataSimple } from "../../service/data";
import toast from "react-hot-toast";
// import { formatAmount } from "../../utils/numberFormat";

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

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    arrivalId: string;
    arrivalSupplier: string;
    paymentHistory: PaymentHistory[];
    totalPrice: string;
    totalPayments: string;
    arrivalDollarRate: string;
    cashTypeText: string;
    onPaymentSuccess: () => void;
}

interface PaymentData {
    arrival_id: number;
    payment_amount: number;
    payment_method: number;
    cash_type: number;
    comments?: string;
}

export default function PaymentModal({
    isOpen,
    onClose,
    arrivalId,
    arrivalSupplier,
    paymentHistory,
    totalPrice,
    totalPayments,
    arrivalDollarRate,
    cashTypeText,
    onPaymentSuccess,
}: PaymentModalProps) {
    const [formData, setFormData] = useState<PaymentData>({
        arrival_id: parseInt(arrivalId),
        payment_amount: 0,
        payment_method: 1,
        cash_type: 1,
        comments: "",
    });
    const [paymentAmountString, setPaymentAmountString] = useState<string>("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1");
    const [selectedCashType, setSelectedCashType] = useState("1");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dollarRate, setDollarRate] = useState<number>(0);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAmount = (amount: string) => {
        return parseInt(amount).toLocaleString().replace(/,/g, " ");
    };

    // Utility function for formatting numbers with spaces
    const formatNumberWithSpaces = (value: string) => {
        if (!value) return "";
        // Remove any existing spaces
        const cleanValue = value.replace(/\s/g, "");
        // Split by decimal point
        const parts = cleanValue.split(".");
        // Format integer part with spaces
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        // Return formatted number
        return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    };

    const remainingAmount = parseInt(totalPrice) - parseInt(totalPayments);

    // Dollar kursini yuklash
    const loadDollarRate = async () => {
        try {
            const response = await GetDataSimple("api/payments/dollar");
            const rate = response.dollar_rate || response?.data?.result || 0;
            setDollarRate(parseFloat(rate) || 0);
        } catch (error) {
            console.error("Error loading dollar rate:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadDollarRate();
        }
    }, [isOpen]);

    const paymentMethodOptions = [
        { value: 1, label: "Наличка" },
        { value: 2, label: "Терминал" },
        { value: 3, label: "Клик" },
        { value: 4, label: "Перечисление" },
    ];

    const cashTypeOptions = [
        { value: 0, label: "Доллар" },
        { value: 1, label: "Сум" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (formData.payment_amount <= 0) {
            setError("Сумма платежа должна быть больше 0");
            return;
        }

        setIsSubmitting(true);
        try {
            await PostDataTokenJson("api/payments/create", formData);
            toast.success("Платеж успешно создан");
            onPaymentSuccess();
            onClose();
            // Reset form
            setFormData({
                arrival_id: parseInt(arrivalId),
                payment_amount: 0,
                payment_method: 1,
                cash_type: 1,
                comments: "",
            });
            setSelectedPaymentMethod("1");
            setSelectedCashType("1");
            setPaymentAmountString("");
        } catch (error: any) {
            console.error("Payment creation error:", error.response.data.error);
            setError(error.response.data.error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setError(null);
            setPaymentAmountString("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Создать платеж
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <span className="font-medium">Поставщик:</span>{" "}
                            {arrivalSupplier}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <span className="font-medium">Курс доллара:</span>{" "}
                            {formatAmount(arrivalDollarRate)} сум
                        </p>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Сводка по оплате
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                Общая сумма
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {formatAmount(totalPrice)} {cashTypeText}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                Оплачено
                            </p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                                {formatAmount(totalPayments)} {cashTypeText}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                Остаток
                            </p>
                            <p
                                className={`font-medium ${
                                    remainingAmount > 0
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-600 dark:text-green-400"
                                }`}
                            >
                                {formatAmount(remainingAmount.toString())}{" "}
                                {cashTypeText}
                            </p>
                        </div>
                        {/* <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                Статус
                            </p>
                            <p
                                className={`font-medium text-xs ${
                                    remainingAmount === 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-yellow-600 dark:text-yellow-400"
                                }`}
                            >
                                {remainingAmount === 0
                                    ? "Полностью оплачено"
                                    : "Частично оплачено"}
                            </p>
                        </div> */}
                    </div>
                </div>

                {/* Payment History */}
                {paymentHistory.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            История платежей
                        </h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                            {paymentHistory.map((payment) => (
                                <div
                                    key={payment.payment_id}
                                    className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatAmount(
                                                    payment.payment_amount
                                                )}{" "}
                                                {payment.cash_type_text}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {payment.payment_method_text} •{" "}
                                                {payment.cash_type_text}
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                Курс:{" "}
                                                {formatAmount(
                                                    payment.payment_dollar_rate
                                                )}{" "}
                                                сум
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {formatDate(payment.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                        Пользователь: {payment.user_name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
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
                            <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="payment_amount">
                                Сумма платежа{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <InputField
                                id="payment_amount"
                                type="text"
                                value={formatNumberWithSpaces(
                                    paymentAmountString
                                )}
                                onChange={(e) => {
                                    setError(null);
                                    const value = e.target.value.replace(
                                        /\s/g,
                                        ""
                                    ); // Remove spaces for processing
                                    setPaymentAmountString(value);
                                    const parsedValue = parseFloat(value) || 0;
                                    setFormData({
                                        ...formData,
                                        payment_amount: parsedValue,
                                    });
                                }}
                                placeholder="0"
                                required
                            />

                            {/* Currency conversion display */}
                            {paymentAmountString && dollarRate > 0 && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {formData.cash_type === 0 ? (
                                        // If Dollar is selected, show Sum equivalent
                                        <>
                                            В сумах:{" "}
                                            <span className="font-medium text-green-600">
                                                {formatAmount(
                                                    (
                                                        parseFloat(
                                                            paymentAmountString
                                                        ) * dollarRate
                                                    ).toString()
                                                )}{" "}
                                                сум
                                            </span>
                                        </>
                                    ) : (
                                        // If Sum is selected, show Dollar equivalent
                                        <>
                                            В долларах:{" "}
                                            <span className="font-medium text-green-600">
                                                {(
                                                    parseFloat(
                                                        paymentAmountString
                                                    ) / dollarRate
                                                ).toFixed(2)}{" "}
                                                $
                                            </span>
                                        </>
                                    )}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="payment_method">
                                Способ оплаты{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                defaultValue={selectedPaymentMethod}
                                onChange={(value) => {
                                    setError(null);
                                    setSelectedPaymentMethod(value);
                                    setFormData({
                                        ...formData,
                                        payment_method: parseInt(value),
                                    });
                                }}
                                options={paymentMethodOptions}
                                placeholder="Выберите способ оплаты"
                            />
                        </div>

                        <div>
                            <Label htmlFor="cash_type">
                                Тип валюты{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                defaultValue={selectedCashType}
                                onChange={(value) => {
                                    setError(null);
                                    setSelectedCashType(value);
                                    setFormData({
                                        ...formData,
                                        cash_type: parseInt(value),
                                    });
                                }}
                                options={cashTypeOptions}
                                placeholder="Выберите тип валюты"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="comments">Комментарии</Label>
                        <TextArea
                            value={formData.comments}
                            onChange={(e) => {
                                setError(null);
                                setFormData({
                                    ...formData,
                                    comments: e.target.value,
                                });
                            }}
                            placeholder="Введите комментарии (не обязательно)"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Создание..." : "Создать платеж"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
