import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import { GetDataSimple, PostSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface Category {
    category_id: number;
    category_name: string;
}

interface Unit {
    unit_id: number;
    unit_name: string;
    short_name: string;
}

interface AddMaterialProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    categories: Category[];
}

export default function AddMaterial({
    isOpen,
    onClose,
    changeStatus,
    categories,
}: AddMaterialProps) {
    const [formData, setFormData] = useState({
        category_id: "",
        material_name: "",
        return_type: "1",
        unit_id: "",
    });
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);

    useEffect(() => {
        GetDataSimple("api/materials/unit/list").then((res: Unit[]) => {
            setUnits(res);
        });
    }, [isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.category_id ||
            !formData.material_name ||
            !formData.unit_id
        ) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple("api/materials/create", {
                ...formData,
                category_id: parseInt(formData.category_id),
                return_type: parseInt(formData.return_type),
                unit_id: parseInt(formData.unit_id),
            });

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Материал успешно создан");
                setFormData({
                    category_id: "",
                    material_name: "",
                    return_type: "1",
                    unit_id: "",
                });
                changeStatus();
                onClose();
            } else {
                toast.error("Что-то пошло не так при создании материала");
            }
        } catch (error) {
            console.error("Error creating material:", error);
            toast.error("Что-то пошло не так при создании материала");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            category_id: "",
            material_name: "",
            return_type: "1",
            unit_id: "",
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Добавить новый материал
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Категория материала *
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map((category) => (
                                <option
                                    key={category.category_id}
                                    value={category.category_id}
                                >
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Название материала *
                        </label>
                        <InputField
                            type="text"
                            name="material_name"
                            value={formData.material_name}
                            onChange={handleInputChange}
                            placeholder="Введите название материала"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Тип возврата *
                        </label>
                        <select
                            name="return_type"
                            value={formData.return_type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        >
                            <option value="1">С возвратом</option>
                            <option value="2">Без возврата</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Единица измерения *
                        </label>
                        <select
                            name="unit_id"
                            value={formData.unit_id}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        >
                            <option value="">Выберите единицу</option>
                            {units.map((unit) => (
                                <option key={unit.unit_id} value={unit.unit_id}>
                                    {unit.unit_name}
                                </option>
                            ))}
                        </select>
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
                            disabled={loading}
                            className="px-6 py-2.5"
                        >
                            {loading ? "Создание..." : "Создать"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
