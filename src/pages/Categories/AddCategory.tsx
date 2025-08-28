import { useState } from "react";
import { Modal } from "../../components/ui/modal";
import { PostSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface AddExpenseCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddCategory({
    isOpen,
    onClose,
    onSuccess,
}: AddExpenseCategoryModalProps) {
    const [formData, setFormData] = useState({
        category_name: "",
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category_name.trim()) {
            toast.error("Название категории обязательно");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple(
                "api/materials/category/create",
                formData
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Категория успешно создана!");
                setFormData({ category_name: "" });
                onSuccess();
                onClose();
            } else {
                toast.error("Что-то пошло не так при создании категории");
            }
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error("Что-то пошло не так при создании категории");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ category_name: "" });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Добавить категорию материалов
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Название категории *
                        </label>
                        <InputField
                            type="text"
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleInputChange}
                            placeholder="Введите название категории"
                            required
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
