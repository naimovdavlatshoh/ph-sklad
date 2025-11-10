import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import InputField from "../form/input/InputField";
import Label from "../form/Label";
import { GetDataSimple, PostDataTokenJson } from "../../service/data";
import { toast } from "react-hot-toast";
import Loader from "../ui/loader/Loader";

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Category {
    category_id?: string | number;
    category_name: string;
}

export default function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [categoryName, setCategoryName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{
        category_name?: string;
    }>({});

    // Fetch categories when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await GetDataSimple(
                "api/kassabank/categories/list"
            );
            const list = response;
            response?.data?.result || response?.categories || [];
            setCategories(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Ошибка при загрузке категорий");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { category_name?: string } = {};

        if (!categoryName.trim()) {
            newErrors.category_name = "Название категории обязательно";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await PostDataTokenJson("api/kassabank/categories/create", {
                category_name: categoryName.trim(),
            });

            toast.success("Категория успешно создана");
            setCategoryName("");
            setErrors({});
            fetchCategories(); // Refresh categories list
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error("Ошибка при создании категории");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setCategoryName("");
            setErrors({});
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Категории
                    </h2>
                </div>

                {/* Add Category Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700"
                >
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="category_name">
                                Название категории{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <InputField
                                id="category_name"
                                type="text"
                                placeholder="Введите название категории"
                                value={categoryName}
                                onChange={(e) => {
                                    setCategoryName(e.target.value);
                                    if (errors.category_name) {
                                        setErrors({});
                                    }
                                }}
                                error={!!errors.category_name}
                                disabled={isSubmitting}
                            />
                            {errors.category_name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.category_name}
                                </p>
                            )}
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting || categoryName.length < 3
                                }
                                variant="primary"
                                size="sm"
                                className="min-w-[120px] "
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Добавление...</span>
                                    </div>
                                ) : (
                                    "Добавить"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Categories List */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Список категорий ({categories.length})
                    </h3>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader />
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-y-auto">
                            {categories.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    Категорий нет
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {categories.map((category, idx) => (
                                        <div
                                            key={category.category_id || idx}
                                            className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700"
                                        >
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {category.category_name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Закрыть
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
