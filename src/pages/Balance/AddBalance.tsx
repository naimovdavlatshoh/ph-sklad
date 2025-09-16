import { useState } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import InputField from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import { PostDataTokenJson } from "../../service/data";
import toast from "react-hot-toast";
import { formatAmount } from "../../utils/numberFormat";

interface AddBalanceProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

const paymentMethodOptions = [
    { value: 1, label: "Наличка" },
    { value: 2, label: "Терминал" },
    { value: 3, label: "Клик" },
    { value: 4, label: "Перечисление" },
];

export default function AddBalance({
    isOpen,
    onClose,
    changeStatus,
}: AddBalanceProps) {
    const [formData, setFormData] = useState({
        payment_amount: "",
        payment_method: "1",
        comments: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        payment_amount?: string;
        payment_method?: string;
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { payment_amount?: string; payment_method?: string } =
            {};

        if (!formData.payment_amount.trim()) {
            newErrors.payment_amount = "Сумма обязательна";
        } else if (
            isNaN(Number(formData.payment_amount)) ||
            Number(formData.payment_amount) <= 0
        ) {
            newErrors.payment_amount = "Введите корректную сумму";
        }

        if (!formData.payment_method) {
            newErrors.payment_method = "Способ оплаты обязателен";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await PostDataTokenJson("api/balance/create", {
                payment_amount: Number(formData.payment_amount),
                payment_method: Number(formData.payment_method),
                comments: formData.comments.trim() || undefined,
            });

            toast.success("Баланс успешно добавлен");
            changeStatus();
            onClose();

            // Reset form
            setFormData({
                payment_amount: "",
                payment_method: "1",
                comments: "",
            });
            setErrors({});
        } catch (error) {
            console.error("Error creating balance:", error);
            toast.error("Ошибка при создании баланса");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
            setErrors({});
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Добавить баланс
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Заполните форму для добавления новой записи баланса
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Payment Amount */}
                    <div>
                        <Label htmlFor="payment_amount">
                            Сумма <span className="text-red-500">*</span>
                        </Label>
                        <InputField
                            id="payment_amount"
                            type="text"
                            placeholder="0"
                            value={
                                formData.payment_amount === "0"
                                    ? ""
                                    : formatAmount(formData.payment_amount)
                            }
                            onChange={(e) => {
                                // Remove all non-numeric characters except decimal point
                                const numericValue = e.target.value.replace(
                                    /[^\d.]/g,
                                    ""
                                );
                                setFormData({
                                    ...formData,
                                    payment_amount: numericValue,
                                });
                            }}
                            error={!!errors.payment_amount}
                        />
                        {errors.payment_amount && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.payment_amount}
                            </p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <Label htmlFor="payment_method">
                            Способ оплаты{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            options={paymentMethodOptions}
                            placeholder="Выберите способ оплаты"
                            onChange={(value) =>
                                setFormData({
                                    ...formData,
                                    payment_method: value,
                                })
                            }
                            defaultValue={formData.payment_method}
                        />
                        {errors.payment_method && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.payment_method}
                            </p>
                        )}
                    </div>

                    {/* Comments */}
                    <div>
                        <Label htmlFor="comments">Комментарий</Label>
                        <TextArea
                            placeholder="Введите комментарий (не обязательно)"
                            value={formData.comments}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    comments: e.target.value,
                                })
                            }
                            rows={3}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[100px]"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Сохранение...</span>
                                </div>
                            ) : (
                                "Добавить"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
