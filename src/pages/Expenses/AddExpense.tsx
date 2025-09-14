import { useState, useEffect, useCallback } from "react";
import { Modal } from "../../components/ui/modal";
import {
    PostDataTokenJson,
    GetDataSimple,
    PostSimple,
} from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";

interface ObjectItem {
    object_id: number;
    object_name: string;
}

interface Material {
    material_id: number;
    material_name: string;
    stock_quantity?: number;
}

interface ExpenseItem {
    material_id: number;
    quantity: number;
}

interface AddExpenseProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

export default function AddExpense({
    isOpen,
    onClose,
    changeStatus,
}: AddExpenseProps) {
    const [formData, setFormData] = useState({
        object_id: "",
        comments: "",
    });
    const [items, setItems] = useState<ExpenseItem[]>([
        { material_id: 0, quantity: 0 },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [objects, setObjects] = useState<ObjectItem[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [searchingMaterials, setSearchingMaterials] = useState(false);

    const fetchObjects = useCallback(async () => {
        try {
            const response: any = await GetDataSimple(
                "api/warehouse/objectlist"
            );
            const data = response || response?.data?.result || [];
            setObjects(data);
        } catch (error) {
            console.error("Error fetching objects:", error);
        }
    }, []);

    const fetchMaterials = useCallback(async () => {
        try {
            const response: any = await GetDataSimple(
                "api/materials/list?page=1&limit=100"
            );
            const data = response?.result || response?.data?.result || [];
            setMaterials(data);
        } catch (error) {
            console.error("Error fetching materials:", error);
        }
    }, []);

    const handleMaterialSearch = useCallback(
        async (keyword: string) => {
            if (!keyword.trim()) {
                fetchMaterials();
                return;
            }

            if (keyword.trim().length < 3) {
                fetchMaterials();
                return;
            }

            setSearchingMaterials(true);
            try {
                const response: any = await PostSimple(
                    `api/materials/search?keyword=${encodeURIComponent(
                        keyword
                    )}&page=1&limit=50`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    setMaterials(searchResults);
                } else {
                    fetchMaterials();
                }
            } catch (error) {
                console.error("Material search error:", error);
                fetchMaterials();
            } finally {
                setSearchingMaterials(false);
            }
        },
        [fetchMaterials]
    );

    useEffect(() => {
        if (isOpen) {
            fetchObjects();
            fetchMaterials();
        }
    }, [isOpen, fetchObjects, fetchMaterials]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleItemChange = (
        index: number,
        field: keyof ExpenseItem,
        value: string | number
    ) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { material_id: 0, quantity: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.object_id) {
            setError("Выберите объект");
            return;
        }

        if (items.length === 0) {
            setError("Добавьте хотя бы один материал");
            return;
        }

        if (
            items.some((item) => item.material_id === 0 || item.quantity <= 0)
        ) {
            setError("Заполните все поля для материалов");
            return;
        }

        setLoading(true);
        try {
            // Filter out invalid items and ensure all required fields are present
            const validItems = items.filter(
                (item) => item.material_id > 0 && item.quantity > 0
            );

            if (validItems.length === 0) {
                setError("Добавьте хотя бы один валидный материал");
                setLoading(false);
                return;
            }

            const requestData = {
                object_id: parseInt(formData.object_id),
                comments: formData.comments.trim() || null,
                items: validItems.map((item) => ({
                    material_id: item.material_id,
                    quantity: item.quantity,
                })),
            };

            const response = await PostDataTokenJson(
                "api/expenses/create",
                requestData
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Расход успешно создан");
                handleClose();
                changeStatus();
            } else {
                setError("Ошибка при создании расхода");
            }
        } catch (error) {
            console.error("Error creating expense:", error);
            setError("Ошибка при создании расхода");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            object_id: "",
            comments: "",
        });
        setItems([{ material_id: 0, quantity: 0 }]);
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-5xl">
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Добавить новый расход
                </h3>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="object_id">
                                <span className="text-red-500 mr-1">*</span>
                                Объект
                            </Label>
                            <Select
                                options={objects.map((o) => ({
                                    value: o.object_id,
                                    label: o.object_name,
                                }))}
                                placeholder="Выберите объект"
                                onChange={(value) =>
                                    handleSelectChange("object_id", value)
                                }
                                defaultValue={formData.object_id}
                                className="relative"
                                style={{ zIndex: 1001 }}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                Комментарии
                            </label>
                            <InputField
                                type="text"
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                placeholder="Введите комментарии (не обязательно)"
                                className="w-full px-4 py-4 h-[46px] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="text-red-500 mr-1">*</span>
                                Материалы
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                                size="sm"
                                className="px-3 py-2 text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Добавить материал
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                Материал
                                            </label>
                                            <Select
                                                options={materials.map(
                                                    (material) => ({
                                                        value: material.material_id,
                                                        label: `${
                                                            material.material_name
                                                        }${
                                                            material.stock_quantity
                                                                ? ` (${parseFloat(
                                                                      material.stock_quantity.toString()
                                                                  ).toString()})`
                                                                : ""
                                                        }`,
                                                    })
                                                )}
                                                placeholder="материал"
                                                onChange={(value) =>
                                                    handleItemChange(
                                                        index,
                                                        "material_id",
                                                        parseInt(value)
                                                    )
                                                }
                                                defaultValue={
                                                    item.material_id > 0
                                                        ? item.material_id.toString()
                                                        : ""
                                                }
                                                className="text-sm relative"
                                                style={{ zIndex: 1000 - index }}
                                                searchable={true}
                                                onSearch={handleMaterialSearch}
                                                searching={searchingMaterials}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                Количество
                                            </label>
                                            <InputField
                                                type="number"
                                                value={
                                                    item.quantity === 0
                                                        ? ""
                                                        : item.quantity
                                                }
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "quantity",
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                placeholder="0"
                                                min="1"
                                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-sm"
                                            />
                                        </div>

                                        <div className="flex items-end gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                    Действие
                                                </label>
                                                <div className="px-3 h-[44px] flex items-center bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg text-sm font-medium text-red-600 dark:text-red-400">
                                                    Расход
                                                </div>
                                            </div>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-6"
                                                    title="Удалить материал"
                                                >
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
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="px-6 py-2.5"
                            disabled={loading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Создание..." : "Создать"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
