// import React from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { TrashBinIcon } from "../../icons";
import Pagination from "../../components/common/Pagination";
import { formatDateTime } from "../../utils/numberFormat";

// Comment icon SVG
const CommentIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
    </svg>
);

interface WriteOffItem {
    id: number;
    material_id: number;
    material_name: string;
    amount: number;
    reason_type: number;
    comments: string;
    created_at: string;
}

interface WriteOffTableProps {
    writeOffs: WriteOffItem[];
    loading: boolean;
    onDelete: (writeOffId: number, materialName: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isSearching: boolean;
}

export function WriteOffTable({
    writeOffs,
    loading,
    onDelete,
    currentPage,
    totalPages,
    onPageChange,
    isSearching,
}: WriteOffTableProps) {
    const reasonTypes = {
        1: "Физический износ / поломка",
        2: "Утрата",
        3: "Моральное устаревание",
        4: "Продажа / реализация",
        5: "Кража",
        6: "Передача в утилизацию",
        7: "Передача безвозмездно",
        8: "Перевод в запасные части",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (writeOffs.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {isSearching
                        ? "Результаты не найдены"
                        : "Нет данных о списаниях"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    {isSearching
                        ? "Попробуйте изменить поисковый запрос"
                        : "Добавьте первое списание материала"}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    #
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Материал
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Количество
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Причина списания
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Комментарии
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Дата списания
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Действия
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {writeOffs.map((writeOff, index) => (
                                <TableRow
                                    key={writeOff.id}
                                    className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {(currentPage - 1) * 10 + index + 1}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {writeOff.material_name}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                                        {writeOff.amount}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                            {reasonTypes[
                                                writeOff.reason_type as keyof typeof reasonTypes
                                            ] || "Неизвестно"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-center">
                                        {writeOff.comments &&
                                        writeOff.comments.trim() !== "" ? (
                                            <div className="relative group">
                                                <CommentIcon className="w-5 h-5 text-green-500 mx-auto cursor-pointer hover:text-green-600 transition-colors" />
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                    {writeOff.comments}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <CommentIcon className="w-5 h-5 text-gray-300 mx-auto" />
                                        )}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(writeOff.created_at)}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={() =>
                                                    onDelete(
                                                        writeOff.id,
                                                        writeOff.material_name
                                                    )
                                                }
                                                size="xs"
                                                variant="danger"
                                                startIcon={
                                                    <TrashBinIcon className="size-4" />
                                                }
                                            >
                                                {""}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
}
