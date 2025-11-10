import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import InputField from "../form/input/InputField";
import Label from "../form/Label";
import { GetDataSimple, PostDataTokenJson } from "../../service/data";
import { toast } from "react-hot-toast";

interface KassabankDollarRateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function KassabankDollarRateModal({
    isOpen,
    onClose,
}: KassabankDollarRateModalProps) {
    const [dollarRate, setDollarRate] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [errors, setErrors] = useState<{
        dollar_rate?: string;
    }>({});

    // Fetch dollar rate when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchDollarRate();
        }
    }, [isOpen]);

    const fetchDollarRate = async () => {
        setIsFetching(true);
        try {
            const response = await GetDataSimple("api/kassabank/dollar");
            const rate =
                response?.dollar_rate ||
                response?.data?.dollar_rate ||
                response?.result ||
                0;
            setDollarRate(rate.toString());
            console.log(response);
        } catch (error: any) {
            onClose();
            console.error(error.response.data.error);
            toast.error("Ошибка при загрузке курса доллара");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { dollar_rate?: string } = {};

        if (!dollarRate.trim()) {
            newErrors.dollar_rate = "Курс доллара обязателен";
        } else if (isNaN(Number(dollarRate)) || Number(dollarRate) <= 0) {
            newErrors.dollar_rate = "Введите корректный курс доллара";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await PostDataTokenJson("api/kassabank/exchange-rate/create", {
                dollar_rate: Number(dollarRate),
            });

            toast.success("Курс доллара успешно обновлен");
            onClose();
            setErrors({});
        } catch (error: any) {
            onClose();
            console.error(error.response.data.error);
            toast.error("Ошибка при обновлении курса доллара");
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
        <Modal className="max-w-md" isOpen={isOpen} onClose={handleClose}>
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Изменить курс доллара
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dollar Rate */}
                    <div>
                        <Label htmlFor="dollar_rate">
                            Курс доллара <span className="text-red-500">*</span>
                        </Label>
                        <InputField
                            id="dollar_rate"
                            type="text"
                            placeholder="0"
                            value={dollarRate}
                            onChange={(e) => {
                                // Remove all non-numeric characters except decimal point
                                const numericValue = e.target.value.replace(
                                    /[^\d.]/g,
                                    ""
                                );
                                setDollarRate(numericValue);
                                if (errors.dollar_rate) {
                                    setErrors({});
                                }
                            }}
                            error={!!errors.dollar_rate}
                            disabled={isFetching}
                        />
                        {errors.dollar_rate && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.dollar_rate}
                            </p>
                        )}
                        {isFetching && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Загрузка курса...
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading || isFetching}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isFetching}
                            className="min-w-[100px]"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Сохранение...</span>
                                </div>
                            ) : (
                                "Сохранить"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
