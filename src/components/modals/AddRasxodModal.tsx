import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import InputField from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import TextArea from "../form/input/TextArea";
import { GetDataSimple, PostDataTokenJson } from "../../service/data";
import { toast } from "react-hot-toast";

// Format number with spaces for thousands and allow decimals
const formatNumberWithSpaces = (value: string): string => {
    if (!value) return "";

    // Remove all spaces first
    const cleanValue = value.replace(/\s/g, "");

    // Split by decimal point
    const parts = cleanValue.split(".");

    // Format integer part with spaces
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    // Return formatted number with decimal part if exists
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
};

// Remove formatting to get raw number
const removeFormatting = (value: string): string => {
    return value.replace(/\s/g, "");
};

interface AddRasxodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddRasxodModal({
    isOpen,
    onClose,
    onSuccess,
}: AddRasxodModalProps) {
    const [categories, setCategories] = useState<any[]>([]);
    // @ts-ignore
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [formData, setFormData] = useState({
        category_id: "",
        payment_amount: "",
        payment_method: "1",
        cash_type: "0",
        comments: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{
        category_id?: string;
        payment_amount?: string;
    }>({});

    // Fetch categories when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoadingCategories(true);
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
            toast.error("Ошибка при загрузке категорий");
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { category_id?: string; payment_amount?: string } = {};

        if (!formData.category_id) {
            newErrors.category_id = "Категория обязательна";
        }

        if (!formData.payment_amount.trim()) {
            newErrors.payment_amount = "Сумма обязательна";
        } else if (
            isNaN(Number(formData.payment_amount)) ||
            Number(formData.payment_amount) <= 0
        ) {
            newErrors.payment_amount = "Введите корректную сумму";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await PostDataTokenJson("api/kassabank/payments/create", {
                category_id: Number(formData.category_id),
                payment_amount: Number(formData.payment_amount),
                payment_method: Number(formData.payment_method),
                cash_type: Number(formData.cash_type),
                comments: formData.comments.trim() || undefined,
            });

            toast.success("Расход успешно создан");
            onSuccess();
            handleClose();
        } catch (error: any) {
            handleClose();
            console.error(error.response.data.error);
            toast.error("Ошибка при создании расхода");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setFormData({
                category_id: "",
                payment_amount: "",
                payment_method: "1",
                cash_type: "1",
                comments: "",
            });
            setErrors({});
        }
    };

    const paymentMethodOptions = [
        { value: 1, label: "Наличка" },
        { value: 3, label: "Клик" },
    ];

    const cashTypeOptions = [
        { value: 1, label: "ДОЛЛАР" },
        { value: 0, label: "SUM" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Окно оплаты
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category */}
                    <div>
                        <Label htmlFor="category_id">
                            Категория <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            options={categories.map((cat) => ({
                                value: Number(cat.category_id),
                                label: cat.category_name,
                            }))}
                            placeholder="Выберите категорию"
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    category_id: value,
                                });
                                if (errors.category_id) {
                                    setErrors({
                                        ...errors,
                                        category_id: undefined,
                                    });
                                }
                            }}
                            defaultValue={formData.category_id}
                        />
                        {errors.category_id && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.category_id}
                            </p>
                        )}
                    </div>

                    {/* Payment Amount */}
                    <div>
                        <Label htmlFor="payment_amount">
                            Сумма <span className="text-red-500">*</span>
                        </Label>
                        <InputField
                            id="payment_amount"
                            type="text"
                            placeholder="0"
                            value={formatNumberWithSpaces(
                                formData.payment_amount
                            )}
                            onChange={(e) => {
                                // Allow only numbers and one decimal point
                                let inputValue = e.target.value.replace(
                                    /[^\d.]/g,
                                    ""
                                );

                                // Ensure only one decimal point
                                const parts = inputValue.split(".");
                                if (parts.length > 2) {
                                    inputValue =
                                        parts[0] +
                                        "." +
                                        parts.slice(1).join("");
                                }

                                // Limit decimal places to 2
                                if (parts.length === 2 && parts[1].length > 2) {
                                    inputValue =
                                        parts[0] +
                                        "." +
                                        parts[1].substring(0, 2);
                                }

                                // Store raw value without formatting
                                const rawValue = removeFormatting(inputValue);
                                setFormData({
                                    ...formData,
                                    payment_amount: rawValue,
                                });
                                if (errors.payment_amount) {
                                    setErrors({
                                        ...errors,
                                        payment_amount: undefined,
                                    });
                                }
                            }}
                            error={!!errors.payment_amount}
                            disabled={isSubmitting}
                        />
                        {errors.payment_amount && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.payment_amount}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Можно вводить десятичные числа (например: 1 000.50)
                        </p>
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

                    {/* Cash Type */}
                    <div>
                        <Label htmlFor="cash_type">Валюта</Label>
                        <Select
                            options={cashTypeOptions}
                            placeholder="Выберите валюту"
                            onChange={(value) => {
                                setFormData({ ...formData, cash_type: value });
                            }}
                            defaultValue={formData.cash_type}
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
