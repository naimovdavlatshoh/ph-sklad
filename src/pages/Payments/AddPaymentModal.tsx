import { useState, useEffect } from "react";
import { CreatePayment, SearchArrivals } from "../../service/data";
import { GetDataSimple } from "../../service/data";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import { formatCurrency, formatAmount } from "../../utils/numberFormat";
import toast from "react-hot-toast";

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentAdded: () => void;
}

interface Arrival {
    arrival_id: string;
    user_name: string;
    invoice_number: string;
    total_price: string;
    comments: string;
    created_at: string;
}

export function AddPaymentModal({
    isOpen,
    onClose,
    onPaymentAdded,
}: AddPaymentModalProps) {
    const [formData, setFormData] = useState({
        arrival_id: "",
        payment_amount: "",
        payment_method: "1",
        cash_type: "1",
        comments: "",
    });
    const [arrivals, setArrivals] = useState<Arrival[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingArrivals, setLoadingArrivals] = useState(true);
    const [searchingArrivals, setSearchingArrivals] = useState(false);

    const paymentMethods = [
        { value: 1, label: "Наличка" },
        { value: 2, label: "Терминал" },
        { value: 3, label: "Клик" },
        { value: 4, label: "Перечисление" },
    ];

    const cashTypes = [
        { value: 0, label: "Доллар" },
        { value: 1, label: "Сум" },
    ];

    const loadArrivals = async (searchTerm?: string) => {
        try {
            if (searchTerm && searchTerm.length >= 3) {
                setSearchingArrivals(true);
            } else {
                setLoadingArrivals(true);
            }

            const response =
                searchTerm && searchTerm.length >= 3
                    ? await SearchArrivals(searchTerm)
                    : await GetDataSimple("api/arrival/list?page=1&limit=100");

            console.log("API Response:", response);

            // Handle different possible response structures
            let arrivalsData = [];
            if (searchTerm && searchTerm.length >= 3) {
                // POST search response structure (same as ArrivalList)
                arrivalsData = response?.data?.result || response?.result || [];
            } else {
                // GET list response structure
                arrivalsData = response?.result || response?.data?.result || [];
            }

            console.log("Arrivals Data:", arrivalsData);
            console.log("Is Array:", Array.isArray(arrivalsData));
            console.log("Length:", arrivalsData?.length);

            setArrivals(Array.isArray(arrivalsData) ? arrivalsData : []);
        } catch (error: any) {
            console.error("Arrivals loading error:", error.response.data);

            // Backend dan kelgan xato xabari
            const errorMessage = "Произошла ошибка при загрузке приходов";

            toast.error(errorMessage);
        } finally {
            setLoadingArrivals(false);
            setSearchingArrivals(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadArrivals();
        }
    }, [isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.arrival_id || !formData.payment_amount) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        try {
            setLoading(true);
            await CreatePayment({
                arrival_id: parseInt(formData.arrival_id),
                payment_amount: parseFloat(formData.payment_amount),
                payment_method: parseInt(formData.payment_method),
                cash_type: parseInt(formData.cash_type),
                comments: formData.comments || undefined,
            });

            toast.success("Платеж успешно создан");
            onPaymentAdded();
            handleClose();
        } catch (error: any) {
            console.error("Payment creation error:", error.response.data.error);

            // Backend dan kelgan xato xabari
            const errorMessage = error.response.data.error;

            toast.error(errorMessage);

            // Modal yopiladi xato kelsa
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            arrival_id: "",
            payment_amount: "",
            payment_method: "1",
            cash_type: "1",
            comments: "",
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Добавить платеж
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="arrival_id">
                            Приход <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            options={(() => {
                                const safeArrivals =
                                    arrivals?.filter(
                                        (arrival) =>
                                            arrival && arrival.arrival_id
                                    ) || [];

                                const options = safeArrivals.map((arrival) => {
                                    const labelSupplier =
                                        (arrival as any)?.invoice_number ||
                                        (arrival as any)?.user_name ||
                                        "";
                                    const labelTotal = (arrival as any)
                                        ?.total_price
                                        ? formatCurrency(
                                              (arrival as any)?.total_price
                                          )
                                        : "";
                                    const label = `#${arrival.arrival_id}${
                                        labelSupplier
                                            ? ` - ${labelSupplier}`
                                            : ""
                                    }${labelTotal ? ` - ${labelTotal}` : ""}`;

                                    return {
                                        value: parseInt(arrival.arrival_id),
                                        label,
                                    };
                                });

                                console.log("Arrivals (safe):", safeArrivals);
                                console.log("Select Options:", options);

                                return options;
                            })()}
                            placeholder={
                                loadingArrivals
                                    ? "Загрузка..."
                                    : searchingArrivals
                                    ? "Поиск..."
                                    : "Выберите приход"
                            }
                            searchable={true}
                            onSearch={(keyword) => {
                                if (keyword.length >= 3) {
                                    loadArrivals(keyword);
                                } else if (keyword.length === 0) {
                                    loadArrivals();
                                }
                            }}
                            searching={searchingArrivals}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    arrival_id: value,
                                }))
                            }
                            defaultValue={formData.arrival_id}
                        />
                    </div>

                    <div>
                        <Label htmlFor="payment_amount">
                            Сумма платежа{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            name="payment_amount"
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
                                handleInputChange({
                                    target: {
                                        name: "payment_amount",
                                        value: numericValue,
                                    },
                                } as React.ChangeEvent<HTMLInputElement>);
                            }}
                            placeholder="0"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="payment_method">
                            Способ оплаты{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            options={paymentMethods}
                            placeholder="Выберите способ оплаты"
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    payment_method: value,
                                }))
                            }
                            defaultValue={formData.payment_method}
                        />
                    </div>

                    <div>
                        <Label htmlFor="cash_type">
                            Валюта <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            options={cashTypes}
                            placeholder="Выберите валюту"
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    cash_type: value,
                                }))
                            }
                            defaultValue={formData.cash_type}
                        />
                    </div>

                    <div>
                        <Label htmlFor="comments">Комментарий</Label>
                        <TextArea
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            placeholder="Введите комментарий (необязательно)"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? "Создание..." : "Создать платеж"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
