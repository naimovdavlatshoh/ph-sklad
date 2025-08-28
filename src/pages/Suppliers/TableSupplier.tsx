import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { PencilIcon } from "../../icons/index.ts";
import EditSupplier from "./EditSupplier.tsx";

interface Supplier {
    supplier_id: number;
    supplier_name: string;
    supplier_phone: string;
    bank_account: string;
    created_at: string;
}

interface TableSupplierProps {
    suppliers: Supplier[];
    changeStatus: () => void;
}

export default function TableSupplier({
    suppliers,
    changeStatus,
}: TableSupplierProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedSupplier) return;

        setIsDeleting(true);
        try {
            await DeleteData(
                `api/supplier/delete/${selectedSupplier.supplier_id}`
            );
            toast.success("Поставщик успешно удален");
            changeStatus();
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error("Ошибка при удалении поставщика");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setEditModalOpen(true);
    };

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                            <tr>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    #
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Название
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Телефон
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Банковский счет
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                        colSpan={5}
                                    >
                                        Поставщики не найдены
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier, index) => (
                                    <tr
                                        key={supplier.supplier_id}
                                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                    >
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {supplier.supplier_name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {supplier.supplier_phone}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            <span className="font-mono text-xs">
                                                {supplier.bank_account}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    className="mr-2"
                                                    onClick={() =>
                                                        handleEdit(supplier)
                                                    }
                                                    size="xs"
                                                    variant="outline"
                                                    startIcon={
                                                        <PencilIcon className="size-4" />
                                                    }
                                                >
                                                    {""}
                                                </Button>
                                                {/* <Button
                                                    onClick={() => {
                                                        setDeleteModalOpen(
                                                            true
                                                        );
                                                        setSelectedSupplier(
                                                            supplier
                                                        );
                                                    }}
                                                    size="xs"
                                                    variant="danger"
                                                    startIcon={
                                                        <TrashBinIcon className="size-4" />
                                                    }
                                                >
                                                    {""}
                                                </Button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                className="max-w-md"
            >
                <div className="p-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900">
                        <svg
                            className="w-6 h-6 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Удалить поставщика
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить поставщика "
                        {selectedSupplier?.supplier_name}"?
                        <br />
                        Это действие нельзя отменить.
                    </p>

                    <div className="flex justify-center space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="px-6 py-2.5"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-6 py-2.5"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            {selectedSupplier && (
                <EditSupplier
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedSupplier(null);
                    }}
                    onSuccess={() => {
                        setEditModalOpen(false);
                        setSelectedSupplier(null);
                        changeStatus();
                    }}
                    supplier={selectedSupplier}
                />
            )}
        </>
    );
}
