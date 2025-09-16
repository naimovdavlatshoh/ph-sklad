import { useState, useEffect } from "react";
import { BASE_URL, GetDataSimple, DeleteData } from "../../service/data";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/button/Button";
import AddWriteOffModal from "./AddWriteOffModal";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";
import ExcelDownloadModal from "../../components/modals/ExcelDownloadModal";
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
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

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

    const handleExcelDownload = async () => {
        setIsDownloading(true);
        try {
            // Get token from localStorage
            const token = localStorage.getItem("token");

            const response = await fetch(`${BASE_URL}api/excel/writeoff`, {
                method: "GET",
                headers: {
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to download Excel file");
            }

            // Check if response is actually an Excel file
            const contentType = response.headers.get("content-type");
            console.log("Response Content-Type:", contentType);

            const blob = await response.blob();
            console.log("Blob size:", blob.size, "bytes");
            console.log("Blob type:", blob.type);

            // Create blob with correct MIME type
            const excelBlob = new Blob([blob], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(excelBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Списание_${
                new Date().toISOString().split("T")[0]
            }.xlsx`;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            toast.success("Excel файл успешно скачан");
            setIsExcelModalOpen(false);
        } catch (error) {
            console.error("Error downloading Excel file:", error);
            toast.error("Ошибка при скачивании Excel файла");
        } finally {
            setIsDownloading(false);
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
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExcelModalOpen(true)}
                        startIcon={
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        }
                    >
                        Скачать Excel
                    </Button>
                    <Button onClick={handleAddWriteOff}>
                        Добавить списание
                    </Button>
                </div>
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

            {/* Excel Download Modal */}
            <ExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onDownload={handleExcelDownload}
                isLoading={isDownloading}
                title="Скачать Excel - Списания"
                message="Вы хотите скачать списания в формате Excel?"
            />
        </div>
    );
}
