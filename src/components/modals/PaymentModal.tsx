import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import InputField from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Label from "../form/Label";
import Select from "../form/Select";
import { PostDataTokenJson } from "../../service/data";
import toast from "react-hot-toast";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    arrivalId: string;
    arrivalSupplier: string;
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
    onPaymentSuccess,
}: PaymentModalProps) {
    const [formData, setFormData] = useState<PaymentData>({
        arrival_id: parseInt(arrivalId),
        payment_amount: 0,
        payment_method: 1,
        cash_type: 1,
        comments: "",
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1");
    const [selectedCashType, setSelectedCashType] = useState("1");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        if (formData.payment_amount <= 0) {
            toast.error("Сумма платежа должна быть больше 0");
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
        } catch (error) {
            toast.error("Ошибка при создании платежа");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
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
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <span className="font-medium">Поставщик:</span>{" "}
                        {arrivalSupplier}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="payment_amount">
                            Сумма платежа{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <InputField
                            id="payment_amount"
                            type="number"
                            value={formData.payment_amount}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    payment_amount:
                                        parseFloat(e.target.value) || 0,
                                })
                            }
                            placeholder="Введите сумму платежа"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="payment_method">
                            Способ оплаты{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            defaultValue={selectedPaymentMethod}
                            onChange={(value) => {
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
                            Тип валюты <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            defaultValue={selectedCashType}
                            onChange={(value) => {
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

                    <div>
                        <Label htmlFor="comments">Комментарии</Label>
                        <TextArea
                            value={formData.comments}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    comments: e.target.value,
                                })
                            }
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
