import { useState, useEffect } from "react";
import { GetDataSimple, DeleteData } from "../../service/data";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/button/Button";
import AddWriteOffModal from "./AddWriteOffModal";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";
import { WriteOffTable } from "./WriteOffTable";

interface WriteOffItem {
    id: number;
    material_id: number;
    material_name: string;
    amount: number;
    reason_type: number;
    comments: string;
    created_at: string;
}

interface WriteOffResponse {
    result: WriteOffItem[];
    pages: number;
    page: number;
    limit: number;
}

export default function WriteOff() {
    const [writeOffs, setWriteOffs] = useState<WriteOffItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [writeOffToDelete, setWriteOffToDelete] = useState<{
        id: number;
        materialName: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadWriteOffs = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = (await GetDataSimple(
                `api/materials/writeoff/list?page=${page}&limit=10`
            )) as WriteOffResponse;
            setWriteOffs(response?.result || []);
            setTotalPages(response.pages || 1);
            setCurrentPage(page);
        } catch (error) {
            toast.error("Ошибка при загрузке списаний");
        } finally {
            setLoading(false);
        }
    };

    const handleAddWriteOff = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
    };

    const handleWriteOffAdded = () => {
        loadWriteOffs(1);
        setIsAddModalOpen(false);
    };

    const handleDeleteClick = (writeOffId: number, materialName: string) => {
        setWriteOffToDelete({ id: writeOffId, materialName });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!writeOffToDelete) return;

        setIsDeleting(true);
        try {
            await DeleteData(
                `api/materials/writeoff/delete/${writeOffToDelete.id}`
            );
            toast.success("Списание успешно удалено");
            loadWriteOffs(currentPage);
            setIsDeleteModalOpen(false);
            setWriteOffToDelete(null);
        } catch (error) {
            console.error("Error deleting write-off:", error);
            toast.error("Ошибка при удалении списания");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setWriteOffToDelete(null);
    };

    useEffect(() => {
        loadWriteOffs(1);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Списание
                </h1>
                <Button onClick={handleAddWriteOff}>Добавить списание</Button>
            </div>

            <WriteOffTable
                writeOffs={writeOffs}
                loading={loading}
                onDelete={handleDeleteClick}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={loadWriteOffs}
                isSearching={false}
            />

            {/* Add WriteOff Modal */}
            {isAddModalOpen && (
                <AddWriteOffModal
                    isOpen={isAddModalOpen}
                    onClose={handleCloseModal}
                    onWriteOffAdded={handleWriteOffAdded}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Удалить списание"
                message="Вы уверены, что хотите удалить это списание? Это действие нельзя отменить."
                itemName={writeOffToDelete?.materialName}
                isLoading={isDeleting}
            />
        </div>
    );
}
