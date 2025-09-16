import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface ExcelDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
    isLoading?: boolean;
    title?: string;
    message?: string;
}

export default function ExcelDownloadModal({
    isOpen,
    onClose,
    onDownload,
    isLoading = false,
    title = "Скачать Excel",
    message = "Вы хотите скачать данные в формате Excel?",
}: ExcelDownloadModalProps) {
    const handleDownload = () => {
        onDownload();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
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
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {message}
                    </p>

                    <div className="flex justify-center space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleDownload}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isLoading ? "Скачивание..." : "Скачать Excel"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
