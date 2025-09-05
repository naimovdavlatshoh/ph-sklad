import { useState, useEffect, useCallback } from "react";
import { Modal } from "../../components/ui/modal";
import { PostSimple, GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Label from "../../components/form/Label";

interface Foreman {
    foreman_id: number;
    foreman_name: string;
    phone_number: string;
}

interface Material {
    material_id: number;
    material_name: string;
    category_name: string;
    unit_name: string;
}

interface MaterialIssueItem {
    material_id: number;
    quantity: number;
    condition_type: number;
    condition_note: string;
}

interface CreateMaterialIssuanceProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

export default function CreateMaterialIssuance({
    isOpen,
    onClose,
    changeStatus,
}: CreateMaterialIssuanceProps) {
    const [formData, setFormData] = useState({
        foreman_id: "",
        expected_return_date: "",
        comments: "",
    });
    const [items, setItems] = useState<MaterialIssueItem[]>([
        {
            material_id: 0,
            quantity: 1,
            condition_type: 1,
            condition_note: "",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [foremen, setForemen] = useState<Foreman[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [searchingForemen, setSearchingForemen] = useState(false);
    const [searchingMaterials, setSearchingMaterials] = useState(false);

    // Fetch initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchForemen();
            fetchMaterials();
        }
    }, [isOpen]);

    const fetchForemen = useCallback(async () => {
        try {
            const response: any = await GetDataSimple("api/foreman/list");
            const foremenData =
                response?.result || response?.data?.result || [];
            setForemen(foremenData);
        } catch (error) {
            console.error("Error fetching foremen:", error);
        }
    }, []);

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

    const handleForemanSearch = useCallback(
        async (keyword: string) => {
            if (!keyword.trim()) {
                fetchForemen();
                return;
            }

            if (keyword.trim().length < 3) {
                fetchForemen();
                return;
            }

            setSearchingForemen(true);
            try {
                const response: any = await PostSimple(
                    `api/foreman/search?keyword=${encodeURIComponent(
                        keyword
                    )}&page=1&limit=50`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    setForemen(searchResults);
                } else {
                    fetchForemen();
                }
            } catch (error) {
                console.error("Foreman search error:", error);
                fetchForemen();
            } finally {
                setSearchingForemen(false);
            }
        },
        [fetchForemen]
    );

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

    const handleItemChange = (
        index: number,
        field: keyof MaterialIssueItem,
        value: string | number
    ) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const handleDateChange = (_dates: Date[], dateStr: string) => {
        setFormData((prev) => ({
            ...prev,
            expected_return_date: dateStr,
        }));
    };

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {
                material_id: 0,
                quantity: 1,
                condition_type: 1,
                condition_note: "",
            },
        ]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.foreman_id || !formData.expected_return_date) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        if (
            items.some((item) => item.material_id === 0 || item.quantity <= 0)
        ) {
            toast.error("Пожалуйста, выберите материалы и укажите количество");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple("api/materialsissues/create", {
                foreman_id: parseInt(formData.foreman_id),
                expected_return_date: formData.expected_return_date,
                comments: formData.comments || undefined,
                items: items.map((item) => ({
                    material_id: item.material_id,
                    quantity: item.quantity,
                    condition_type: item.condition_type,
                    condition_note: item.condition_note || undefined,
                })),
            });

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Выдача материала успешно создана");
                handleClose();
                changeStatus();
            } else {
                toast.error("Что-то пошло не так при создании выдачи");
            }
        } catch (error) {
            console.error("Error creating material issuance:", error);
            toast.error("Что-то пошло не так при создании выдачи");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            foreman_id: "",
            expected_return_date: "",
            comments: "",
        });
        setItems([
            {
                material_id: 0,
                quantity: 1,
                condition_type: 1,
                condition_note: "",
            },
        ]);
        onClose();
    };

    // const getConditionTypeText = (type: number) => {
    //     switch (type) {
    //         case 1:
    //             return "Новое";
    //         case 2:
    //             return "Среднее";
    //         case 3:
    //             return "Старое";
    //         default:
    //             return "Новое";
    //     }
    // };

    // Prepare foreman options for Select component
    const foremanOptions = foremen.map((foreman) => ({
        value: foreman.foreman_id,
        label: `${foreman.foreman_name} - ${foreman.phone_number}`,
    }));

    // Prepare material options for Select component
    const materialOptions = materials.map((material) => ({
        value: material.material_id,
        label: `${material.material_name} (${material.unit_name})`,
    }));

    // Condition type options
    const conditionOptions = [
        { value: 1, label: "Новое" },
        { value: 2, label: "Среднее" },
        { value: 3, label: "Старое" },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-5xl max-h-[90vh]"
        >
            <div className="p-6 max-h-[85vh] overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        Создание выдачи материала/инструмента
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Заполните форму для создания новой выдачи материалов
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
                                <Label htmlFor="foreman-select">Прораб *</Label>
                                <Select
                                    options={foremanOptions}
                                    placeholder="Выберите прораба"
                                    onChange={(value) =>
                                        handleSelectChange("foreman_id", value)
                                    }
                                    defaultValue={formData.foreman_id}
                                    className=""
                                    searchable={true}
                                    onSearch={handleForemanSearch}
                                    searching={searchingForemen}
                                />
                            </div>

                            <div>
                                <DatePicker
                                    id="expected-return-date"
                                    label="Ожидаемая дата возврата *"
                                    placeholder="Выберите дату"
                                    onChange={handleDateChange}
                                />
                            </div>
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
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Materials Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Материалы/Инструменты
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Добавьте материалы и инструменты для выдачи
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={addItem}
                                variant="primary"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                + Добавить материал
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                                Материал {index + 1}
                                            </h5>
                                        </div>
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                variant="danger"
                                                size="xs"
                                            >
                                                Удалить
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <Label
                                                htmlFor={`material-${index}`}
                                            >
                                                Материал *
                                            </Label>
                                            <Select
                                                options={materialOptions}
                                                placeholder="Выберите материал"
                                                onChange={(value) =>
                                                    handleItemChange(
                                                        index,
                                                        "material_id",
                                                        parseInt(value)
                                                    )
                                                }
                                                defaultValue={item.material_id.toString()}
                                                className="mt-2"
                                                searchable={true}
                                                onSearch={handleMaterialSearch}
                                                searching={searchingMaterials}
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor={`quantity-${index}`}
                                            >
                                                Количество *
                                            </Label>
                                            <InputField
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "quantity",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                min="1"
                                                required
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor={`condition-${index}`}
                                            >
                                                Состояние *
                                            </Label>
                                            <Select
                                                options={conditionOptions}
                                                placeholder="Выберите состояние"
                                                onChange={(value) =>
                                                    handleItemChange(
                                                        index,
                                                        "condition_type",
                                                        parseInt(value)
                                                    )
                                                }
                                                defaultValue={item.condition_type.toString()}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor={`condition-note-${index}`}
                                            >
                                                Примечание о состоянии
                                            </Label>
                                            <InputField
                                                type="text"
                                                value={item.condition_note}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "condition_note",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Описание состояния"
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                            {loading ? "Создание..." : "Создать выдачу"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
