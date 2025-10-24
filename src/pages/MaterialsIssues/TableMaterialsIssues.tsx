import { useState } from "react";

import Button from "../../components/ui/button/Button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "../../components/ui/table";
import ReturnModal from "../../components/modals/ReturnModal";
import { PostDataTokenJson } from "../../service/data";
import toast from "react-hot-toast";
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

// Format date without time
const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

interface MaterialIssue {
    id: number;
    foreman_id: number;
    foreman_name: string;
    expected_return_date: string;
    comments?: string;
    created_at: string;
    items: MaterialIssueItem[];
}

interface MaterialIssueItem {
    id: number;
    material_id: number;
    material_name: string;
    quantity: number;
    condition_type: string;
    condition_note?: string;
    returned: boolean;
    return_date?: string;
    actual_return_date: string;
}

interface TableMaterialsIssuesProps {
    issues: MaterialIssue[];
    changeStatus: () => void;
    onReturnTool: (issueId: number) => void;
    activeFilter: "without" | "with";
    onFilterChange: (filter: "without" | "with") => void;
}

export default function TableMaterialsIssues({
    issues,
    activeFilter,
    onFilterChange,
}: TableMaterialsIssuesProps) {
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{
        id: number;
        name: string;
    } | null>(null);

    const getConditionTypeText = (type: number) => {
        switch (type) {
            case 1:
                return "Новое";
            case 2:
                return "Среднее";
            case 3:
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

    // Removed formatDate function - using formatDateTime from utils

    const isOverdue = (expectedDate: string) => {
        return new Date(expectedDate) < new Date();
    };

    const handleReturnItem = async (data: {
        condition_type: string;
        return_date: string;
        condition_note?: string;
    }) => {
        if (!selectedItem) return;

        PostDataTokenJson(
            `api/materialsissues/returnitem/${selectedItem.id}`,
            data
        )
            .then(() => {
                toast.success("Материал успешно возвращен");
                setReturnModalOpen(false);
                setSelectedItem(null);
            })
            .catch(() => toast.error("Ошибка при возврате материала"));
    };

    const handleReturnClick = (itemId: number, itemName: string) => {
        setSelectedItem({ id: itemId, name: itemName });
        setReturnModalOpen(true);
    };

    if (issues.length === 0) {
        return (
            <div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onFilterChange("without")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                            activeFilter === "without"
                                ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                    >
                        Без возврата
                    </button>
                    <button
                        onClick={() => onFilterChange("with")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                            activeFilter === "with"
                                ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                    >
                        С возвратом
                    </button>
                </div>
                <div className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
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
                        <p>Нет выданных материалов</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onFilterChange("without")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                        activeFilter === "without"
                            ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                    Без возврата
                </button>
                <button
                    onClick={() => onFilterChange("with")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                        activeFilter === "with"
                            ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                    С возвратом
                </button>
            </div>

            {/* Table */}
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
                                    Прораб
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Материалы
                                </TableCell>
                                {activeFilter === "with" && (
                                    <>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Ожидаемая дата возврата
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Статус
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Действия
                                        </TableCell>
                                    </>
                                )}
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Дата создания
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.map((issue, index) => (
                                <TableRow
                                    key={issue.id}
                                    className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                >
                                    <TableCell className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {issue.foreman_name}
                                            </div>
                                            {issue.comments &&
                                            issue.comments.trim() !== "" ? (
                                                <div className="relative group">
                                                    <CommentIcon className="w-5 h-5 text-green-500 cursor-pointer hover:text-green-600 transition-colors" />
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                        {issue.comments}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <CommentIcon className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                        <div className="space-y-1">
                                            {issue.items.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="text-sm">
                                                        {item.material_name} x{" "}
                                                        {Math.round(
                                                            item.quantity
                                                        )}
                                                    </span>
                                                    {activeFilter ===
                                                        "with" && (
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded-full ${getConditionTypeColor(
                                                                item.condition_type
                                                            )}`}
                                                        >
                                                            {getConditionTypeText(
                                                                parseInt(
                                                                    item.condition_type
                                                                )
                                                            )}
                                                        </span>
                                                    )}
                                                    {item.returned && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                            Возвращено
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    {activeFilter === "with" && (
                                        <>
                                            <TableCell className="px-5 py-4">
                                                <div
                                                    className={`${
                                                        isOverdue(
                                                            issue.expected_return_date
                                                        )
                                                            ? "text-red-600 dark:text-red-400"
                                                            : ""
                                                    }`}
                                                >
                                                    {formatDateOnly(
                                                        issue.expected_return_date
                                                    )}
                                                    {isOverdue(
                                                        issue.expected_return_date
                                                    ) && (
                                                        <div className="text-xs text-red-500">
                                                            Просрочено
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm">
                                                        {formatDateOnly(
                                                            issue.items[0]
                                                                .actual_return_date
                                                        )}
                                                    </span>
                                                    {issue.items.some(
                                                        (item) =>
                                                            item.actual_return_date
                                                    ) ? (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                            Возвращено
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                            Не возвращено
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {issue.items.map(
                                                        (item, itemIndex) => (
                                                            <Button
                                                                key={itemIndex}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleReturnClick(
                                                                        item.id,
                                                                        item.material_name
                                                                    )
                                                                }
                                                                disabled={
                                                                    item.actual_return_date !==
                                                                    null
                                                                }
                                                                className={
                                                                    item.returned
                                                                        ? "opacity-50 cursor-not-allowed"
                                                                        : ""
                                                                }
                                                            >
                                                                {item.actual_return_date
                                                                    ? "Возврат"
                                                                    : "Возврат"}
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                            </TableCell>
                                        </>
                                    )}
                                    <TableCell className="px-5 py-4">
                                        {formatDateTime(issue.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Return Modal */}
                {selectedItem && (
                    <ReturnModal
                        isOpen={returnModalOpen}
                        onClose={() => {
                            setReturnModalOpen(false);
                            setSelectedItem(null);
                        }}
                        onReturn={handleReturnItem}
                        itemId={selectedItem.id}
                        itemName={selectedItem.name}
                    />
                )}
            </div>
        </div>
    );
}
