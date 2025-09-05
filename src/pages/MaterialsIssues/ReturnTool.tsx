import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import { GetDataSimple, PostSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface MaterialIssueItem {
    id: number;
    material_id: number;
    material_name: string;
    quantity: number;
    condition_type: number;
    condition_note?: string;
    returned: boolean;
    return_date?: string;
}

interface ReturnToolProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    issueId: number | null;
}

export default function ReturnTool({
    isOpen,
    onClose,
    changeStatus,
    issueId,
}: ReturnToolProps) {
    const [formData, setFormData] = useState({
        condition_type: 1,
        return_date: new Date().toISOString().split("T")[0],
        condition_note: "",
    });
    const [loading, setLoading] = useState(false);
    const [issueItems, setIssueItems] = useState<MaterialIssueItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && issueId) {
            fetchIssueItems();
        }
    }, [isOpen, issueId]);

    const fetchIssueItems = async () => {
        if (!issueId) return;

        try {
            const response: any = await GetDataSimple(
                `api/materialsissues/${issueId}`
            );
            const items =
                response?.result?.items || response?.data?.result?.items || [];
            setIssueItems(items);
        } catch (error) {
            console.error("Error fetching issue items:", error);
            toast.error("Ошибка при загрузке данных выдачи");
        }
    };

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

        if (!selectedItemId) {
            toast.error("Пожалуйста, выберите материал для возврата");
            return;
        }

        if (!formData.return_date) {
            toast.error("Пожалуйста, укажите дату возврата");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple(
                `api/materialsissues/returnitem/${selectedItemId}`,
                {
                    condition_type: parseInt(
                        formData.condition_type.toString()
                    ),
                    return_date: formData.return_date,
                    condition_note: formData.condition_note || undefined,
                }
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Инструмент успешно возвращен");
                handleClose();
                changeStatus();
            } else {
                toast.error("Что-то пошло не так при возврате инструмента");
            }
        } catch (error) {
            console.error("Error returning tool:", error);
            toast.error("Что-то пошло не так при возврате инструмента");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            condition_type: 1,
            return_date: new Date().toISOString().split("T")[0],
            condition_note: "",
        });
        setIssueItems([]);
        setSelectedItemId(null);
        onClose();
    };

    const getConditionTypeText = (type: number) => {
        switch (type) {
            case 1:
                return "Новое";
            case 2:
                return "Среднее";
            case 3:
                return "Старое";
            default:
                return "Новое";
        }
    };

    // const getConditionTypeColor = (type: number) => {
    //     switch (type) {
    //         case 1:
    //             return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    //         case 2:
    //             return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    //         case 3:
    //             return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    //         default:
    //             return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    //     }
    // };

    const availableItems = issueItems.filter((item) => !item.returned);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Возврат инструмента
                </h3>

                {availableItems.length === 0 ? (
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p>Все материалы уже возвращены</p>
                        </div>
                        <Button
                            onClick={handleClose}
                            className="mt-4 px-6 py-2.5"
                        >
                            Закрыть
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Выберите материал для возврата *
                            </label>
                            <div className="space-y-2">
                                {availableItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedItemId === item.id
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                        }`}
                                        onClick={() =>
                                            setSelectedItemId(item.id)
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {item.material_name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Количество: {item.quantity}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    При выдаче:{" "}
                                                    {getConditionTypeText(
                                                        item.condition_type
                                                    )}
                                                </div>
                                                {item.condition_note && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Примечание:{" "}
                                                        {item.condition_note}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="selectedItem"
                                                    checked={
                                                        selectedItemId ===
                                                        item.id
                                                    }
                                                    onChange={() =>
                                                        setSelectedItemId(
                                                            item.id
                                                        )
                                                    }
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Состояние при возврате *
                                </label>
                                <select
                                    name="condition_type"
                                    value={formData.condition_type}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                >
                                    <option value={1}>Новое</option>
                                    <option value={2}>Среднее</option>
                                    <option value={3}>Старое</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Дата возврата *
                                </label>
                                <InputField
                                    type="date"
                                    name="return_date"
                                    value={formData.return_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Примечание о состоянии
                            </label>
                            <textarea
                                name="condition_note"
                                value={formData.condition_note}
                                onChange={handleInputChange}
                                placeholder="Опишите состояние материала при возврате (не обязательно)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="px-6 py-2.5"
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !selectedItemId}
                                className="px-6 py-2.5"
                            >
                                {loading ? "Возврат..." : "Вернуть инструмент"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
