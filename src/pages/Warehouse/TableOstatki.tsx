import { useState, useEffect, useCallback } from "react";
import { BASE_URL, GetDataSimple, PostSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import Pagination from "../../components/common/Pagination.tsx";
import Select from "../../components/form/Select.tsx";
import ExcelDownloadModal from "../../components/modals/ExcelDownloadModal.tsx";
import Button from "../../components/ui/button/Button.tsx";

interface OstatkiItem {
    material_id: number;
    material_name: string;
    category_name: string;
    unit_name: string;
    quantity: number;
    unit_id: number;
    category_id: number;
    receipt_price: number;
}

interface Unit {
    unit_id: number;
    unit_name: string;
}

interface Category {
    category_id: number;
    category_name: string;
}

interface TableOstatkiProps {
    searchQuery: string;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function TableOstatki({
    searchQuery,
    currentPage,
    onPageChange,
}: TableOstatkiProps) {
    const [ostatki, setOstatki] = useState<OstatkiItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [units, setUnits] = useState<Unit[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState({
        unit_id: "",
        category_id: "",
        sort_quantity: "DESC",
    });
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const formatNumber = (num: number) => {
        return parseFloat(num.toString()).toString();
    };

    const handleExcelDownload = async () => {
        setIsDownloading(true);
        try {
            // Get token from localStorage
            const token = localStorage.getItem("token");

            const response = await fetch(`${BASE_URL}api/excel/warehouse`, {
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
            link.download = `Остатки_${
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

    const fetchUnits = useCallback(async () => {
        try {
            const response: any = await GetDataSimple(
                "api/materials/unit/list"
            );
            const data = response || response?.data?.result || [];
            console.log("Units API Response:", response);
            console.log("Units Data:", data);
            setUnits(data);
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response: any = await GetDataSimple(
                "api/materials/category/list?page=1&limit=10"
            );
            const data = response?.result || response?.data?.result || [];
            console.log("Categories API Response:", response);
            console.log("Categories Data:", data);
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    const fetchOstatki = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
            });

            // Add filters if they exist
            if (filters.unit_id) params.append("unit_id", filters.unit_id);
            if (filters.category_id)
                params.append("category_id", filters.category_id);
            if (filters.sort_quantity)
                params.append("sort_quantity", filters.sort_quantity);

            const response: any = await GetDataSimple(
                `api/warehouse/list?${params.toString()}`
            );

            const data = response?.result || response?.data?.result || [];
            const pages = response?.pages || response?.data?.pages || 1;

            console.log("Ostatki API Response:", response);
            console.log("Ostatki Data:", data);

            setOstatki(data);
            setTotalPages(pages);
        } catch (error) {
            console.error("Error fetching ostatki:", error);
            toast.error("Ошибка при загрузке остатков");
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                fetchOstatki();
                return;
            }

            if (query.trim().length < 3) {
                fetchOstatki();
                return;
            }

            setLoading(true);
            try {
                const response: any = await PostSimple(
                    `api/warehouse/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${currentPage}&limit=10`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setOstatki(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchOstatki();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchOstatki();
            } finally {
                setLoading(false);
            }
        },
        [currentPage, fetchOstatki]
    );

    useEffect(() => {
        fetchUnits();
        fetchCategories();
    }, [fetchUnits, fetchCategories]);

    useEffect(() => {
        if (searchQuery.trim() && searchQuery.trim().length >= 3) {
            performSearch(searchQuery);
        } else {
            fetchOstatki();
        }
    }, [searchQuery, fetchOstatki, performSearch, filters]);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Фильтры
                    </h4>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Единица измерения
                        </label>
                        <Select
                            options={[
                                { value: 0, label: "Все единицы" },
                                ...units.map((unit) => ({
                                    value: unit.unit_id,
                                    label: unit.unit_name,
                                })),
                            ]}
                            placeholder="Выберите единицу"
                            onChange={(value) =>
                                setFilters({
                                    ...filters,
                                    unit_id: value === "0" ? "" : value,
                                })
                            }
                            defaultValue={filters.unit_id || "0"}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Категория
                        </label>
                        <Select
                            options={[
                                { value: 0, label: "Все категории" },
                                ...categories.map((category) => ({
                                    value: category.category_id,
                                    label: category.category_name,
                                })),
                            ]}
                            placeholder="Выберите категорию"
                            onChange={(value) =>
                                setFilters({
                                    ...filters,
                                    category_id: value === "0" ? "" : value,
                                })
                            }
                            defaultValue={filters.category_id || "0"}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Сортировка по количеству
                        </label>
                        <Select
                            options={[
                                { value: 1, label: "По убыванию" },
                                { value: 2, label: "По возрастанию" },
                            ]}
                            placeholder="Выберите сортировку"
                            onChange={(value) =>
                                setFilters({
                                    ...filters,
                                    sort_quantity:
                                        value === "1" ? "DESC" : "ASC",
                                })
                            }
                            defaultValue={
                                filters.sort_quantity === "DESC" ? "1" : "2"
                            }
                            className="mt-2"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
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
                                    Категория
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Количество
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Цена за единицу
                                </th>
                                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Единица измерения
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {ostatki.length === 0 ? (
                                <tr>
                                    <td
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                        colSpan={6}
                                    >
                                        Остатки не найдены
                                    </td>
                                </tr>
                            ) : (
                                ostatki.map((item, index) => (
                                    <tr
                                        key={item.material_id}
                                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                    >
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white font-medium">
                                            {item.material_name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {item.category_name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white font-medium">
                                            {formatNumber(item.quantity)}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white font-medium">
                                            {formatNumber(item.receipt_price)}{" "}
                                            сум
                                        </td>
                                        <td className="px-5 py-4 text-sm text-black dark:text-white">
                                            {item.unit_name}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />

            {/* Excel Download Modal */}
            <ExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onDownload={handleExcelDownload}
                isLoading={isDownloading}
                title="Скачать Excel - Остатки"
                message="Вы хотите скачать остатки склада в формате Excel?"
            />
        </div>
    );
}
