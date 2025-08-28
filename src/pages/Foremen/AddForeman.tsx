import { useState } from "react";
import { Modal } from "../../components/ui/modal";
import { PostSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface AddForemanProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

export default function AddForeman({
    isOpen,
    onClose,
    changeStatus,
}: AddForemanProps) {
    const [formData, setFormData] = useState({
        foreman_name: "",
        phone_number: "",
        comments: "",
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.foreman_name.trim() || !formData.phone_number.trim()) {
            toast.error("Пожалуйста, заполните обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple("api/foreman/create", formData);

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Прораб успешно создан");
                setFormData({
                    foreman_name: "",
                    phone_number: "",
                    comments: "",
                });
                changeStatus();
                onClose();
            } else {
                toast.error("Что-то пошло не так при создании прораба");
            }
        } catch (error) {
            console.error("Error creating foreman:", error);
            toast.error("Что-то пошло не так при создании прораба");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            foreman_name: "",
            phone_number: "",
            comments: "",
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Добавить нового прораба
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Имя прораба *
                        </label>
                        <InputField
                            type="text"
                            name="foreman_name"
                            value={formData.foreman_name}
                            onChange={handleInputChange}
                            placeholder="Введите имя прораба"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Телефон *
                        </label>
                        <InputField
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            placeholder="+998991234567"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Комментарии
                        </label>
                        <textarea
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            placeholder="Не обязательно"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
