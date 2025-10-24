import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableMaterial from "./TableMaterial.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";

import Loader from "../../components/ui/loader/Loader.tsx";
import AddMaterial from "./AddMaterial.tsx";

interface Material {
    material_id: number;
    category_id: number;
    material_name: string;
    return_type: string;
    unit_id: number;
    created_at: string;
    category_name?: string;
    unit_name?: string;
}

interface Category {
    category_id: number;
    category_name: string;
}

export default function MaterialList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/materials/list?page=${page}&limit=30`
            );
            const materialsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredMaterials(materialsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching materials:", error);
            toast.error("Что-то пошло не так при загрузке материалов");
        }
    }, [page]);

    const fetchCategories = useCallback(async () => {
        try {
            const response: any = await GetDataSimple(
                `api/materials/category/list?page=1&limit=100`
            );
            const categoriesData =
                response?.result || response?.data?.result || [];
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                // If search is empty, fetch all materials
                fetchMaterials();
                return;
            }

            // If search query is too short, don't search, just fetch all materials
            if (query.trim().length < 3) {
                console.log(
                    "Search query is too short, fetching all materials"
                );
                fetchMaterials();
                return;
            }

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/materials/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredMaterials(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchMaterials();
                }
            } catch (error) {
                console.error("Search error:", error);
                fetchMaterials();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchMaterials]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchMaterials();
    }, [status, fetchMaterials]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    // Fetch categories and units only when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen, fetchCategories]);

    // Handle search and page changes
    useEffect(() => {

        if (currentPage === "materials") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                console.log("Performing search for:", searchQuery);
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                fetchMaterials();
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchMaterials]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="WAREHOUSE" description="Список материалов" />
            <PageBreadcrumb pageTitle="Материалы" />
            <ComponentCard
                title="Список материалов"
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
                        Добавить материал
                    </button>
                }
            >
                <TableMaterial
                    materials={filteredMaterials}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddMaterial
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
                categories={categories}
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
