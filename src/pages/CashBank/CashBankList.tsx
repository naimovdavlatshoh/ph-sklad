import { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import TabNavigation from "../../components/common/TabNavigation.tsx";
import RasxodTab from "./RasxodTab";
import PrixodTab from "./PrixodTab";
import KassabankExcelDownloadModal from "../../components/modals/KassabankExcelDownloadModal.tsx";
import { GetDataSimple, BASE_URL } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { DownloadIcon } from "../../icons/index.ts";

export default function CashBankList() {
    const [activeTab, setActiveTab] = useState("rasxod");
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [excelFilters, setExcelFilters] = useState({
        start_date: "",
        end_date: "",
        category_id: "",
    });
    const [totalCount, setTotalCount] = useState(0);

    const tabs = [
        { id: "rasxod", label: "Расход" },
        { id: "prixod", label: "Приход" },
    ];

    const fetchCategories = useCallback(async () => {
        try {
            const response = await GetDataSimple(
                "api/kassabank/categories/list"
            );
            const list =
                response ||
                response?.data?.result ||
                response?.categories ||
                [];
            setCategories(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const formatDateToDDMMYYYY = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getTotalCountWithFilters = useCallback(async () => {
        if (!excelFilters.start_date || !excelFilters.end_date) {
            setTotalCount(0);
            return;
        }

        try {
            const params = new URLSearchParams({
                start_date: formatDateToDDMMYYYY(excelFilters.start_date),
                end_date: formatDateToDDMMYYYY(excelFilters.end_date),
                count: "1",
            });

            if (excelFilters.category_id) {
                params.append("category_id", excelFilters.category_id);
            }

            const response: any = await GetDataSimple(
                `api/excel/kassabank?${params.toString()}`
            );
            const count =
                response?.total_count ||
                response?.count ||
                response?.data?.count ||
                0;
            setTotalCount(count);
        } catch (error) {
            console.error("Error fetching total count:", error);
            setTotalCount(0);
        }
    }, [excelFilters]);

    useEffect(() => {
        if (excelFilters.start_date && excelFilters.end_date) {
            getTotalCountWithFilters();
        } else {
            setTotalCount(0);
        }
    }, [excelFilters, getTotalCountWithFilters]);

    const handleExcelDownload = async () => {
        if (
            !excelFilters.start_date ||
            !excelFilters.end_date ||
            excelFilters.start_date.trim() === "" ||
            excelFilters.end_date.trim() === ""
        ) {
            toast.error("Пожалуйста, выберите дату начала и дату окончания");
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem("token");

            const params = new URLSearchParams({
                start_date: formatDateToDDMMYYYY(excelFilters.start_date),
                end_date: formatDateToDDMMYYYY(excelFilters.end_date),
            });

            if (excelFilters.category_id) {
                params.append("category_id", excelFilters.category_id);
            }

            const response = await fetch(
                `${BASE_URL}api/excel/kassabank?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download Excel file");
            }

            const blob = await response.blob();
            const excelBlob = new Blob([blob], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(excelBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `КассаБанк_${formatDateToDDMMYYYY(
                excelFilters.start_date
            )}_${formatDateToDDMMYYYY(excelFilters.end_date)}.xlsx`;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            toast.success("Excel файл успешно скачан");
            setIsExcelModalOpen(false);
        } catch (error: any) {
            setIsExcelModalOpen(false);
            toast.error(
                error?.response?.data?.error ||
                    "Ошибка при скачивании Excel файла"
            );
        } finally {
            setIsDownloading(false);
        }
    };

    const handleExcelFiltersChange = (filters: any) => {
        setExcelFilters(filters);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case "rasxod":
                return <RasxodTab />;
            case "prixod":
                return <PrixodTab />;
            default:
                return <RasxodTab />;
        }
    };

    return (
        <>
            <PageMeta title="WAREHOUSE" description="Касса-Банк" />
            <PageBreadcrumb pageTitle="Касса-Банк" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <TabNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                    <button
                        onClick={() => setIsExcelModalOpen(true)}
                        className="px-4 flex items-center gap-2 bg-green-500 text-white h-[40px] rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <DownloadIcon className="size-4" />
                        Скачать Excel
                    </button>
                </div>
                {renderActiveTab()}
            </div>

            <KassabankExcelDownloadModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onDownload={handleExcelDownload}
                isLoading={isDownloading}
                categories={categories}
                onFiltersChange={handleExcelFiltersChange}
                totalCount={totalCount}
            />
        </>
    );
}
