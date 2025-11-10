import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import InputField from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import TextArea from "../form/input/TextArea";
import { PostDataTokenJson } from "../../service/data";
import { toast } from "react-hot-toast";

interface AddPrixodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPrixodModal({
    isOpen,
    onClose,
    onSuccess,
}: AddPrixodModalProps) {
    const [formData, setFormData] = useState({
        arrival_amount: "",
        payment_method: "1",
        comments: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{
        arrival_amount?: string;
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { arrival_amount?: string } = {};

        if (!formData.arrival_amount.trim()) {
            newErrors.arrival_amount = "Сумма обязательна";
        } else if (
            isNaN(Number(formData.arrival_amount)) ||
            Number(formData.arrival_amount) <= 0
        ) {
            newErrors.arrival_amount = "Введите корректную сумму";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await PostDataTokenJson("api/kassabank/arrivals/create", {
                arrival_amount: Number(formData.arrival_amount),
                payment_method: Number(formData.payment_method),
                comments: formData.comments.trim() || undefined,
            });

            toast.success("Приход успешно создан");
            onSuccess();
            handleClose();
        } catch (error: any) {
            handleClose();
            console.error(error.response.data.error);
            toast.error("Ошибка при создании прихода");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setFormData({
                arrival_amount: "",
                payment_method: "1",
                comments: "",
            });
            setErrors({});
        }
    };

    const paymentMethodOptions = [
        { value: 1, label: "Наличка" },
        { value: 2, label: "Терминал" },
        { value: 3, label: "Клик" },
        { value: 4, label: "Перечисление" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Добавить приход
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Arrival Amount */}
                    <div>
                        <Label htmlFor="arrival_amount">
                            Сумма <span className="text-red-500">*</span>
                        </Label>
                        <InputField
                            id="arrival_amount"
                            type="text"
                            placeholder="0"
                            value={formData.arrival_amount}
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(
                                    /[^\d.]/g,
                                    ""
                                );
                                setFormData({
                                    ...formData,
                                    arrival_amount: numericValue,
                                });
                                if (errors.arrival_amount) {
                                    setErrors({
                                        ...errors,
                                        arrival_amount: undefined,
                                    });
                                }
                            }}
                            error={!!errors.arrival_amount}
                            disabled={isSubmitting}
                        />
                        {errors.arrival_amount && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.arrival_amount}
                            </p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <Label htmlFor="payment_method">Метод оплаты</Label>
                        <Select
                            options={paymentMethodOptions}
                            placeholder="Выберите метод оплаты"
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    payment_method: value,
                                });
                            }}
                            defaultValue={formData.payment_method}
                        />
                    </div>

                    {/* Comments */}
                    <div>
                        <Label htmlFor="comments">Комментарий</Label>
                        <TextArea
                            // @ts-ignore
                            id="comments"
                            placeholder="Введите комментарий (не обязательно)"
                            value={formData.comments}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    comments: e.target.value,
                                })
                            }
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                            disabled={isSubmitting}
                            className="min-w-[100px]"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Создание...</span>
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
