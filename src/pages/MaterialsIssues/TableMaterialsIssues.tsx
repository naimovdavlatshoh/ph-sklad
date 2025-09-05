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
}

export default function TableMaterialsIssues({
    issues,
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU");
    };

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
            <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                    <svg
                        className="mx-auto h-12 w-12 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                    <p>Нет выданных материалов</p>
                </div>
            </div>
        );
    }

    return (
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
                                Дата создания
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
                        {issues.map((issue, index) => (
                            <TableRow
                                key={issue.id}
                                className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                            >
                                <TableCell className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="px-5 py-4">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {issue.foreman_name}
                                        </div>
                                        {issue.comments && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {issue.comments}
                                            </div>
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
                                                    {Math.round(item.quantity)}
                                                </span>
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
                                                {item.returned && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        Возвращено
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
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
                                        {formatDate(issue.expected_return_date)}
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
                                            {issue.items[0].actual_return_date}
                                        </span>
                                        {issue.items.some(
                                            (item) => item.actual_return_date
                                        ) ? (
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                Частично возвращено
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                Не возвращено
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-5 py-4">
                                    {issue.created_at}
                                </TableCell>
                                <TableCell className="px-5 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {issue.items.map((item, itemIndex) => (
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
                                        ))}
                                    </div>
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
    );
}
