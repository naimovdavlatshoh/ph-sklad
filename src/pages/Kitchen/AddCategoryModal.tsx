import { useState } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { PostSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddCategoryModal({
    isOpen,
    onClose,
    onSuccess,
}: AddCategoryModalProps) {
    const [formData, setFormData] = useState({
        category_name: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category_name.trim()) {
            toast.error("Пожалуйста, введите название категории");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple("api/kitchen/categorycreate", {
                category_name: formData.category_name.trim(),
            });

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Категория успешно создана");
                setFormData({ category_name: "" });
                onSuccess();
                onClose();
            } else {
                toast.error("Ошибка при создании категории");
            }
        } catch (error: any) {
            onClose();
            console.error("Error creating category:", error);
            toast.error(error.response.data.error);
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
                <div className="text-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Добавить категорию
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Название категории *
                        </label>
                        <input
                            type="text"
                            value={formData.category_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category_name: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="Введите название категории"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-center space-x-3 mt-6">
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
                            disabled={loading || !formData.category_name.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Создание..." : "Создать категорию"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
