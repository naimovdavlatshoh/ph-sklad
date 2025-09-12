import { useState, useEffect, useCallback } from "react";
import { Modal } from "../../components/ui/modal";
import { PostSimple, GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";

interface Material {
    material_id: string | number;
    material_name: string;
    category_name: string;
    unit_name: string;
}

interface AddWriteOffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWriteOffAdded: () => void;
}

export default function AddWriteOffModal({
    isOpen,
    onClose,
    onWriteOffAdded,
}: AddWriteOffModalProps) {
    const [formData, setFormData] = useState({
        material_id: "",
        amount: "",
        reason_type: "",
        comments: "",
    });
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchingMaterials, setSearchingMaterials] = useState(false);

    // Reason type options
    const reasonOptions = [
        { value: 1, label: "Физический износ / поломка" },
        { value: 2, label: "Утрата" },
        { value: 3, label: "Моральное устаревание" },
        { value: 4, label: "Продажа / реализация" },
        { value: 5, label: "Кража" },
        { value: 6, label: "Передача в утилизацию" },
        { value: 7, label: "Передача безвозмездно" },
        { value: 8, label: "Перевод в запасные части" },
    ];

    // Fetch materials when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchMaterials();
        }
    }, [isOpen]);

    const fetchMaterials = useCallback(async () => {
        try {
            const response: any = await GetDataSimple(
                "api/materials/list?page=1&limit=100"
            );
            const materialsData =
                response?.result || response?.data?.result || [];
            setMaterials(materialsData);
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.material_id ||
            !formData.amount ||
            !formData.reason_type
        ) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        if (parseInt(formData.amount) <= 0) {
            toast.error("Количество должно быть больше 0");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple("api/materials/writeoff/create", {
                material_id: parseInt(formData.material_id),
                amount: parseInt(formData.amount),
                reason_type: parseInt(formData.reason_type),
                comments: formData.comments || undefined,
            });

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Списание успешно создано");
                handleClose();
                onWriteOffAdded();
            } else {
                toast.error("Что-то пошло не так при создании списания");
            }
        } catch (error) {
            console.error("Error creating write-off:", error);
            toast.error("Что-то пошло не так при создании списания");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            material_id: "",
            amount: "",
            reason_type: "",
            comments: "",
        });
        onClose();
    };

    // Prepare material options for Select component
    const materialOptions = materials.map((material) => ({
        value: material.material_id,
        label: `${material.material_name} (${material.unit_name})`,
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-2xl max-h-[98vh]"
        >
            <div className="p-6 max-h-[93vh] overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        Создание списания материала
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Заполните форму для создания нового списания материала
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Form Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                            Основная информация
                        </h4>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="material-select">
                                    Материал *
                                </Label>
                                <Select
                                    options={materialOptions.map((option) => ({
                                        ...option,
                                        value: Number(option.value),
                                    }))}
                                    placeholder="Выберите материал"
                                    onChange={(value) =>
                                        handleSelectChange("material_id", value)
                                    }
                                    defaultValue={formData.material_id}
                                    className="z-50 relative"
                                    searchable={true}
                                    onSearch={handleMaterialSearch}
                                    searching={searchingMaterials}
                                />
                            </div>

                            <div>
                                <Label htmlFor="amount">Количество *</Label>
                                <InputField
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="Введите количество"
                                    min="1"
                                    required
                                    className=""
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="reason-select">
                                Причина списания *
                            </Label>
                            <Select
                                options={reasonOptions}
                                placeholder="Выберите причину списания"
                                onChange={(value) =>
                                    handleSelectChange("reason_type", value)
                                }
                                defaultValue={formData.reason_type}
                                className="mt-2 z-50 relative"
                            />
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                            Дополнительная информация
                        </h4>
                        <div>
                            <Label htmlFor="comments">Комментарии</Label>
                            <textarea
                                id="comments"
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                placeholder="Введите комментарии (не обязательно)"
                                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-brand-500/20 focus:border-brand-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-brand-800"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-4 pb-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            size="md"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            size="md"
                        >
                            {loading ? "Создание..." : "Создать списание"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
