import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import { PostSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface Supplier {
    supplier_id: number;
    supplier_name: string;
    supplier_phone: string;
    bank_account: string;
    created_at: string;
}

interface EditSupplierProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplier: Supplier;
}

export default function EditSupplier({
    isOpen,
    onClose,
    onSuccess,
    supplier,
}: EditSupplierProps) {
    const [formData, setFormData] = useState({
        supplier_name: "",
        supplier_phone: "",
        bank_account: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (supplier) {
            setFormData({
                supplier_name: supplier.supplier_name || "",
                supplier_phone: supplier.supplier_phone || "",
                bank_account: supplier.bank_account || "",
            });
        }
    }, [supplier]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.supplier_name.trim() ||
            !formData.supplier_phone.trim() ||
            !formData.bank_account.trim()
        ) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const response = await PostSimple(
                `api/supplier/update/${supplier.supplier_id}`,
                formData
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Поставщик успешно обновлен");
                onSuccess();
                onClose();
            } else {
                toast.error("Что-то пошло не так при обновлении поставщика");
            }
        } catch (error) {
            console.error("Error updating supplier:", error);
            toast.error("Что-то пошло не так при обновлении поставщика");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Редактировать поставщика
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Название поставщика *
                        </label>
                        <InputField
                            type="text"
                            name="supplier_name"
                            value={formData.supplier_name}
                            onChange={handleInputChange}
                            placeholder="Введите название поставщика"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Телефон *
                        </label>
                        <InputField
                            type="tel"
                            name="supplier_phone"
                            value={formData.supplier_phone}
                            onChange={handleInputChange}
                            placeholder="+998991234567"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Банковский счет *
                        </label>
                        <InputField
                            type="text"
                            name="bank_account"
                            value={formData.bank_account}
                            onChange={handleInputChange}
                            placeholder="12345678912345678912"
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
                            {loading ? "Обновление..." : "Обновить"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
