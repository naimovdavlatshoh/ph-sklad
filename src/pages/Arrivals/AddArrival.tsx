import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import { PostSimple, GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";

interface Supplier {
    supplier_id: number;
    supplier_name: string;
}

interface Material {
    material_id: number;
    material_name: string;
}

interface ArrivalItem {
    material_id: number;
    amount: number;
    price: number;
}

interface AddArrivalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

export default function AddArrival({
    isOpen,
    onClose,
    changeStatus,
}: AddArrivalProps) {
    const [formData, setFormData] = useState({
        supplier_id: "",
        comments: "",
    });
    const [items, setItems] = useState<ArrivalItem[]>([
        { material_id: 0, amount: 0, price: 0 },
    ]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers();
            fetchMaterials();
        }
    }, [isOpen]);

    const fetchSuppliers = async () => {
        try {
            const response: any = await GetDataSimple("api/supplier/list");
            const suppliersData =
                response?.result || response?.data?.result || [];
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    const fetchMaterials = async () => {
        try {
            const response: any = await GetDataSimple("api/materials/list");
            const materialsData =
                response?.result || response?.data?.result || [];
            setMaterials(materialsData);
        } catch (error) {
            console.error("Error fetching materials:", error);
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

    const handleItemChange = (
        index: number,
        field: keyof ArrivalItem,
        value: string | number
    ) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { material_id: 0, amount: 0, price: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.supplier_id) {
            toast.error("Пожалуйста, выберите поставщика");
            return;
        }

        // Check if items array is empty or has invalid items
        if (items.length === 0) {
            toast.error("Пожалуйста, добавьте хотя бы один материал");
            return;
        }

        if (
            items.some(
                (item) =>
                    item.material_id === 0 ||
                    item.amount <= 0 ||
                    item.price <= 0
            )
        ) {
            toast.error("Пожалуйста, заполните все поля для материалов");
            return;
        }

        setLoading(true);
        try {
            // Filter out invalid items and ensure all required fields are present
            const validItems = items.filter(
                (item) =>
                    item.material_id > 0 && item.amount > 0 && item.price > 0
            );

            if (validItems.length === 0) {
                toast.error(
                    "Пожалуйста, добавьте хотя бы один валидный материал"
                );
                setLoading(false);
                return;
            }

            const requestData = {
                supplier_id: parseInt(formData.supplier_id),
                comments: formData.comments,
                items: validItems.map((item) => ({
                    material_id: item.material_id,
                    amount: item.amount,
                    price: item.price,
                })),
            };

            // Debug: Log the request data
            console.log("Request data being sent:", requestData);
            console.log("Items array:", requestData.items);
            console.log("Items length:", requestData.items.length);

            const response = await PostSimple(
                "api/arrival/create",
                requestData
            );

            // Debug: Log the response
            console.log("API Response:", response);
            console.log("Response status:", response?.status);
            console.log("Response data:", response?.data);

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Приход успешно создан");
                resetForm();
                changeStatus();
                onClose();
            } else {
                toast.error("Что-то пошло не так при создании прихода");
            }
        } catch (error) {
            console.error("Error creating arrival:", error);
            toast.error("Что-то пошло не так при создании прихода");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            supplier_id: "",
            comments: "",
        });
        setItems([{ material_id: 0, amount: 0, price: 0 }]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-3xl">
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Добавить новый приход
                </h3>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                <span className="text-red-500 mr-1">*</span>
                                Поставщик
                            </label>
                            <div className="relative">
                                <select
                                    name="supplier_id"
                                    value={formData.supplier_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all duration-200 text-gray-900 dark:text-white appearance-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-500"
                                >
                                    <option value="">
                                        Выберите поставщика
                                    </option>
                                    {suppliers.map((supplier) => (
                                        <option
                                            key={supplier.supplier_id}
                                            value={supplier.supplier_id}
                                        >
                                            {supplier.supplier_name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Комментарии
                            </label>
                            <InputField
                                type="text"
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                placeholder="Введите комментарии (не обязательно)"
                                className="w-full px-4 py-4 h-[50px] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
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
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                Материал
                                            </label>
                                            <Select
                                                options={materials.map(
                                                    (material) => ({
                                                        value: material.material_id,
                                                        label: material.material_name,
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
                                                className="text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                Количество
                                            </label>
                                            <InputField
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "amount",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                placeholder="0"
                                                min="1"
                                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                Цена (сум)
                                            </label>
                                            <InputField
                                                type="number"
                                                value={item.price}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "price",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                placeholder="0"
                                                min="1"
                                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-sm"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    size="sm"
                                                    className="px-3 py-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                    Удалить
                                                </Button>
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
