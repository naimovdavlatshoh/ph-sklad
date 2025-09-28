import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import DatePickerExpanse from "../../components/form/date-picker-expanse.tsx";

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Category {
    category_id: string;
    category_name: string;
    is_active: string;
}

export default function AddExpenseModal({
    isOpen,
    onClose,
    onSuccess,
}: AddExpenseModalProps) {
    const [formData, setFormData] = useState({
        category_id: "",
        number_of_people: "",
        expense_date: "",
        comments: "",
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [searchingCategories, setSearchingCategories] = useState(false);

    // Fetch categories when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response: any = await GetDataSimple(
                "api/kitchen/categorylist?page=1&limit=100"
            );
            const categoriesData =
                response?.result || response?.data?.result || [];
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Ошибка при загрузке категорий");
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleCategorySearch = async (keyword: string) => {
        if (!keyword.trim()) {
            fetchCategories();
            return;
        }

        // Only search if keyword has at least 3 characters
        if (keyword.trim().length < 3) {
            return;
        }

        setSearchingCategories(true);
        try {
            const response: any = await PostSimple(
                `api/kitchen/categorysearch?keyword=${encodeURIComponent(
                    keyword
                )}`
            );

            if (response?.status === 200 || response?.data?.success) {
                const searchResults =
                    response?.data?.result || response?.result || [];
                setCategories(searchResults);
            } else {
                fetchCategories();
            }
        } catch (error) {
            console.error("Category search error:", error);
            fetchCategories();
        } finally {
            setSearchingCategories(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category_id || formData.category_id === "0") {
            toast.error("Пожалуйста, выберите категорию");
            return;
        }

        if (
            !formData.number_of_people ||
            parseInt(formData.number_of_people) <= 0
        ) {
            toast.error("Пожалуйста, введите количество людей");
            return;
        }

        if (!formData.expense_date) {
            toast.error("Пожалуйста, выберите дату расхода");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple("api/kitchen/expensecreate", {
                category_id: parseInt(formData.category_id),
                number_of_people: parseInt(formData.number_of_people),
                expense_date: formData.expense_date,
                comments: formData.comments.trim(),
            });

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Расход успешно создан");
                setFormData({
                    category_id: "",
                    number_of_people: "",
                    expense_date: "",
                    comments: "",
                });
                onSuccess();
                onClose();
            } else {
                toast.error("Ошибка при создании расхода");
            }
        } catch (error) {
            console.error("Error creating expense:", error);
            toast.error("Ошибка при создании расхода");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            category_id: "",
            number_of_people: "",
            expense_date: "",
            comments: "",
        });
        onClose();
    };

    // Get today's date and calculate min/max dates
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <div className="text-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Добавить расход
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Категория *
                        </label>
                        <Select
                            options={[
                                { value: 0, label: "Выберите категорию" },
                                ...categories
                                    .filter((cat) => cat.is_active === "1")
                                    .map((category) => ({
                                        value: parseInt(category.category_id),
                                        label: category.category_name,
                                    })),
                            ]}
                            placeholder="Выберите категорию"
                            onChange={(value) =>
                                setFormData({
                                    ...formData,
                                    category_id: value,
                                })
                            }
                            defaultValue={formData.category_id}
                            searchable={true}
                            onSearch={handleCategorySearch}
                            searching={searchingCategories}
                        />
                        {(loadingCategories || searchingCategories) && (
                            <p className="text-xs text-gray-500 mt-1">
                                {searchingCategories
                                    ? "Поиск категорий..."
                                    : "Загрузка категорий..."}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Количество людей *
                        </label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.number_of_people}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    number_of_people: e.target.value,
                                })
                            }
                            placeholder="Введите количество людей"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <DatePickerExpanse
                            id="expense_date"
                            label="Дата расхода *"
                            placeholder="Выберите дату расхода"
                            minDate={threeDaysAgo}
                            maxDate={today}
                            onChange={(selectedDates) => {
                                if (selectedDates.length > 0) {
                                    const date = selectedDates[0];
                                    const year = date.getFullYear();
                                    const month = String(
                                        date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                        2,
                                        "0"
                                    );
                                    const dateString = `${year}-${month}-${day}`;
                                    setFormData({
                                        ...formData,
                                        expense_date: dateString,
                                    });
                                }
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Комментарии
                        </label>
                        <TextArea
                            value={formData.comments}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    comments: e.target.value,
                                })
                            }
                            placeholder="Введите комментарии (необязательно)"
                            rows={3}
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
                            disabled={
                                loading ||
                                !formData.category_id ||
                                !formData.number_of_people ||
                                !formData.expense_date
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Создание..." : "Создать расход"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
