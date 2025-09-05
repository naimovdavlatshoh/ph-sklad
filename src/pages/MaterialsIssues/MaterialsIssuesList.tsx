import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableMaterialsIssues from "./TableMaterialsIssues.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import Loader from "../../components/ui/loader/Loader.tsx";
import CreateMaterialIssuance from "./CreateMaterialIssuance.tsx";
import ReturnTool from "./ReturnTool.tsx";

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

// interface Foreman {
//     foreman_id: number;
//     foreman_name: string;
//     phone_number: string;
// }

// interface Material {
//     material_id: number;
//     material_name: string;
//     category_name: string;
//     unit_name: string;
// }

export default function MaterialsIssuesList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredIssues, setFilteredIssues] = useState<MaterialIssue[]>([]);
    // const [foremen, setForemen] = useState<Foreman[]>([]);
    // const [materials, setMaterials] = useState<Material[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchIssues = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/materialsissues/list?page=${page}&limit=10`
            );
            const issuesData = response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredIssues(issuesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching material issues:", error);
            toast.error("Что-то пошло не так при загрузке выданных материалов");
        }
    }, [page]);

    // const fetchForemen = useCallback(async () => {
    //     try {
    //         const response: any = await GetDataSimple(
    //             `api/foreman/list?page=1&limit=100`
    //         );
    //         const foremenData =
    //             response?.result || response?.data?.result || [];
    //         setForemen(foremenData);
    //     } catch (error) {
    //         console.error("Error fetching foremen:", error);
    //     }
    // }, []);

    // const fetchMaterials = useCallback(async () => {
    //     try {
    //         const response: any = await GetDataSimple(
    //             `api/materials/list?page=1&limit=100`
    //         );
    //         const materialsData =
    //             response?.result || response?.data?.result || [];
    //         setMaterials(materialsData);
    //     } catch (error) {
    //         console.error("Error fetching materials:", error);
    //     }
    // }, []);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                fetchIssues();
                return;
            }

            if (query.trim().length < 3) {
                fetchIssues();
                return;
            }

            setIsSearching(true);
            try {
                // Search both material issues and returns
                const response: any = await PostSimple(
                    `api/materialsissues/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=10`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredIssues(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchIssues();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchIssues();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchIssues]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchIssues();
    }, [status, fetchIssues]);

    const handleReturnTool = (issueId: number) => {
        setSelectedIssueId(issueId);
        setReturnModalOpen(true);
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    // Fetch foremen and materials when modal opens
    // useEffect(() => {
    //     if (isOpen) {
    //         fetchForemen();
    //         fetchMaterials();
    //     }
    // }, [isOpen, fetchForemen, fetchMaterials]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "materialsissues") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                fetchIssues();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchIssues]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="PH-sklad" description="Выдача материалов" />
            <PageBreadcrumb pageTitle="Выдача" />
            <ComponentCard
                title="Список выданных материалов"
                desc={
                    <button
                        onClick={openModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Создать выдачу
                    </button>
                }
            >
                <TableMaterialsIssues
                    issues={filteredIssues}
                    changeStatus={changeStatus}
                    onReturnTool={handleReturnTool}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <CreateMaterialIssuance
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
            />

            <ReturnTool
                isOpen={returnModalOpen}
                onClose={() => {
                    setReturnModalOpen(false);
                    setSelectedIssueId(null);
                    changeStatus();
                }}
                changeStatus={changeStatus}
                issueId={selectedIssueId}
            />

            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#10B981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#EF4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
        </>
    );
}
