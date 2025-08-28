// import React from "react";

import { useState } from "react";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    userName?: string;
    isDeleting?: boolean;
}

export default function DeleteUserModal({
    isOpen,
    onClose,
    onDelete,
    userName,
    isDeleting = false,
}: DeleteUserModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await onDelete();
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[700px] p-6 lg:p-10"
        >
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Удаление пользователя
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Вы уверены, что хотите удалить пользователя{" "}
                    <span className="font-medium">{userName}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isLoading || isDeleting}
                    >
                        {isLoading || isDeleting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Удаление...
                            </div>
                        ) : (
                            "Удалить"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
