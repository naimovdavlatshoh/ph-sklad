import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";

interface ReturnItem {
    return_id: string;
    issue_id: string;
    issue_item_id: string;
    material_name: string;
    quantity: string;
    foreman_name: string;
    issued_to_name: string;
    return_user_name: string;
    expected_return_date: string;
    return_date: string;
    delay_days: number;
    returned_on_time: boolean;
    return_status_text: string;
    issue_condition_type: string;
    issue_condition_note: string;
    return_condition_type: string;
    return_condition_note: string;
}

interface TableReturnProps {
    returns: ReturnItem[];
    changeStatus: () => void;
}

export default function TableReturn({
    returns,
    changeStatus,
}: TableReturnProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedReturn) return;

        setIsDeleting(true);
        try {
            await DeleteData(
                `api/materialsissues/delete/${selectedReturn.return_id}`
            );
            toast.success("Возврат успешно удален");
            changeStatus();
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error("Ошибка при удалении возврата");
        } finally {
            setIsDeleting(false);
        }
    };

    const getConditionTypeText = (type: string) => {
        switch (type) {
            case "1":
                return "Новое";
            case "2":
                return "Среднее";
            case "3":
                return "Старое";
            default:
                return "Неизвестно";
        }
    };

    const getConditionTypeColor = (type: string) => {
        switch (type) {
            case "1":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "2":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "3":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                                    Материал
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Количество
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Статус возврата
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Прораб
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Дата возврата
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {returns.length === 0 ? (
                                <tr>
                                    <td
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                        colSpan={7}
                                    >
                                        <div className="flex flex-col items-center">
                                            <svg
                                                className="mx-auto h-12 w-12 mb-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <p>Возвраты не найдены</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                returns.map((returnItem, index) => (
                                    <tr
                                        key={returnItem.return_id}
                                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                    >
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white font-medium">
                                            {returnItem.material_name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {parseFloat(
                                                returnItem.quantity
                                            ).toFixed(0)}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <div className="">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        returnItem.returned_on_time
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 "
                                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                    }`}
                                                >
                                                    {
                                                        returnItem.return_status_text
                                                    }
                                                </span>
                                                {/* {returnItem.delay_days > 0 && (
                                                    <span className="text-xs text-red-500">
                                                        Задержка:{" "}
                                                        {returnItem.delay_days}{" "}
                                                        дн.
                                                    </span>
                                                )} */}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {returnItem.foreman_name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {formatDate(returnItem.return_date)}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() => {
                                                        setDetailModalOpen(
                                                            true
                                                        );
                                                        setSelectedReturn(
                                                            returnItem
                                                        );
                                                    }}
                                                    size="xs"
                                                    variant="outline"
                                                    startIcon={
                                                        <svg
                                                            className="size-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    }
                                                >
                                                    {""}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setDeleteModalOpen(
                                                            true
                                                        );
                                                        setSelectedReturn(
                                                            returnItem
                                                        );
                                                    }}
                                                    size="xs"
                                                    variant="danger"
                                                    startIcon={
                                                        <TrashBinIcon className="size-4" />
                                                    }
                                                >
                                                    {""}
                                                </Button>
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
                        Удалить возврат
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить возврат материала "
                        {selectedReturn?.material_name}"?
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

            {/* Detail Modal */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                className="max-w-2xl"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Детали возврата
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Подробная информация о возврате материала
                        </p>
                    </div>

                    {selectedReturn && (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Материал
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                        {selectedReturn.material_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Количество
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {parseFloat(
                                            selectedReturn.quantity
                                        ).toFixed(0)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Прораб
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {selectedReturn.foreman_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Выдал
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {selectedReturn.issued_to_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Вернул
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {selectedReturn.return_user_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Статус возврата
                                    </label>
                                    <div className="mt-1">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                selectedReturn.returned_on_time
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                            }`}
                                        >
                                            {selectedReturn.return_status_text}
                                        </span>
                                        {/* {selectedReturn.delay_days > 0 && (
                                            <span className="ml-2 text-xs text-red-500">
                                                (Задержка:{" "}
                                                {selectedReturn.delay_days} дн.)
                                            </span>
                                        )} */}
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Ожидаемая дата возврата
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {formatDate(
                                            selectedReturn.expected_return_date
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Фактическая дата возврата
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {formatDate(selectedReturn.return_date)}
                                    </p>
                                </div>
                            </div>

                            {/* Condition Information */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Состояние материала
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Состояние при выдаче
                                        </label>
                                        <div className="mt-1">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionTypeColor(
                                                    selectedReturn.issue_condition_type
                                                )}`}
                                            >
                                                {getConditionTypeText(
                                                    selectedReturn.issue_condition_type
                                                )}
                                            </span>
                                            {selectedReturn.issue_condition_note && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {
                                                        selectedReturn.issue_condition_note
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Состояние при возврате
                                        </label>
                                        <div className="mt-1">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionTypeColor(
                                                    selectedReturn.return_condition_type
                                                )}`}
                                            >
                                                {getConditionTypeText(
                                                    selectedReturn.return_condition_type
                                                )}
                                            </span>
                                            {selectedReturn.return_condition_note && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {
                                                        selectedReturn.return_condition_note
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-6 ">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDetailModalOpen(false)}
                            className="px-6 py-2.5"
                        >
                            Закрыть
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
