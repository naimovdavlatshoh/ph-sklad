import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import {  PencilIcon } from "../../icons/index.ts";
import EditMaterial from "./EditMaterial.tsx";

interface Material {
    material_id: number;
    category_id: number;
    material_name: string;
    return_type: number;
    unit_id: number;
    created_at: string;
    category_name?: string;
    unit_name?: string;
}

interface TableMaterialProps {
    materials: Material[];
    changeStatus: () => void;
}

export default function TableMaterial({
    materials,
    changeStatus,
}: TableMaterialProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedMaterial) return;

        setIsDeleting(true);
        try {
            await DeleteData(
                `api/materials/delete/${selectedMaterial.material_id}`
            );
            toast.success("Материал успешно удален");
            changeStatus();
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error("Ошибка при удалении материала");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (material: Material) => {
        setSelectedMaterial(material);
        setEditModalOpen(true);
    };

    const getReturnTypeText = (returnType: number) => {
        return returnType === 1 ? "С возвратом" : "Без возврата";
    };

    const getReturnTypeColor = (returnType: string) => {
        return returnType === "1"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
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
                                    Категория
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Тип возврата
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Единица
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {materials.length === 0 ? (
                                <tr>
                                    <td
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                        colSpan={6}
                                    >
                                        Материалы не найдены
                                    </td>
                                </tr>
                            ) : (
                                materials.map((material, index) => (
                                    <tr
                                        key={material.material_id}
                                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                    >
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {material.material_name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {material.category_name ||
                                                "Не указано"}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getReturnTypeColor(
                                                    material.return_type.toString()
                                                )}`}
                                            >
                                                {getReturnTypeText(
                                                    material.return_type
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {material.unit_name || "Не указано"}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    className="mr-2"
                                                    onClick={() =>
                                                        handleEdit(material)
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
                                                        setSelectedMaterial(
                                                            material
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
                        Удалить материал
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить материал "
                        {selectedMaterial?.material_name}"?
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
            {selectedMaterial && (
                <EditMaterial
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedMaterial(null);
                    }}
                    onSuccess={() => {
                        setEditModalOpen(false);
                        setSelectedMaterial(null);
                        changeStatus();
                    }}
                    material={selectedMaterial}
                />
            )}
        </>
    );
}
