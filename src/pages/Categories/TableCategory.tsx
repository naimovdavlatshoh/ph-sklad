import { PencilIcon } from "../../icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useModal } from "../../hooks/useModal";
import { useState } from "react";
import Button from "../../components/ui/button/Button";
import EditCategory from "./EditCategory";

interface ExpenseCategory {
    category_id: string;
    category_name: string;
}

interface TableExpenseCategoryProps {
    categories: ExpenseCategory[];
    changeStatus: () => void;
}

export default function TableCategory({
    categories,
    changeStatus,
}: TableExpenseCategoryProps) {
    const { isOpen, openModal, closeModal } = useModal();

    const [selectedCategory, setSelectedCategory] =
        useState<ExpenseCategory | null>(null);

    const handleEdit = (category: ExpenseCategory) => {
        setSelectedCategory(category);
        openModal();
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="pl-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                #
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Название
                            </TableCell>

                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Действия
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    Категории не найдены
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category, index) => (
                                <TableRow
                                    key={category.category_id}
                                    className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                >
                                    <TableCell className="pl-5 py-4 text-sm text-black dark:text-white">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="py-4 text-sm text-black dark:text-white">
                                        {category.category_name || "Не указано"}
                                    </TableCell>
                                    <TableCell className="py-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                className="mr-2"
                                                onClick={() =>
                                                    handleEdit(category)
                                                }
                                                size="xs"
                                                variant="outline"
                                                startIcon={
                                                    <PencilIcon className="size-4" />
                                                }
                                            >
                                                {""}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <EditCategory
                isOpen={isOpen}
                onClose={closeModal}
                onSuccess={changeStatus}
                category={selectedCategory}
            />
        </div>
    );
}
