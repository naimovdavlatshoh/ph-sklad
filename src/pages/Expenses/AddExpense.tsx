import { useState, useEffect, useCallback } from "react";
import { Modal } from "../../components/ui/modal";
import { PostDataTokenJson, GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";

interface ObjectItem {
    object_id: number;
    object_name: string;
}

interface Material {
    material_id: number;
    material_name: string;
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
        material_id: "",
        quantity: "",
        comments: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [objects, setObjects] = useState<ObjectItem[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);

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
                "api/materials/list?page=1&limit=10"
            );
            const data = response?.result || response?.data?.result || [];
            setMaterials(data);
        } catch (error) {
            console.error("Error fetching materials:", error);
        }
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (
            !formData.object_id ||
            !formData.material_id ||
            !formData.quantity
        ) {
            setError("Заполните все обязательные поля");
            return;
        }

        if (parseFloat(formData.quantity) <= 0) {
            setError("Количество должно быть больше 0");
            return;
        }

        setLoading(true);
        try {
            const response = await PostDataTokenJson("api/expenses/create", {
                object_id: parseInt(formData.object_id),
                material_id: parseInt(formData.material_id),
                quantity: parseFloat(formData.quantity),
                comments: formData.comments.trim() || null,
            });

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
            material_id: "",
            quantity: "",
            comments: "",
        });
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Добавить расход
                </h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Object */}
                    <div>
                        <Label htmlFor="object_id">Объект *</Label>
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
                        />
                    </div>

                    {/* Material */}
                    <div>
                        <Label htmlFor="material_id">Материал *</Label>
                        <Select
                            options={materials.map((m) => ({
                                value: m.material_id,
                                label: m.material_name,
                            }))}
                            placeholder="Выберите материал"
                            onChange={(value) =>
                                handleSelectChange("material_id", value)
                            }
                            defaultValue={formData.material_id}
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <Label htmlFor="quantity">Количество *</Label>
                        <InputField
                            id="quantity"
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            placeholder="Введите количество"
                            min="0"
                            step={1}
                            required
                        />
                    </div>

                    {/* Comments */}
                    <div>
                        <Label htmlFor="comments">Комментарии</Label>
                        <TextArea
                            // @ts-ignore
                            id="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            placeholder="Введите комментарий (не обязательно)"
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
                            {loading ? "Создание..." : "Создать"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
