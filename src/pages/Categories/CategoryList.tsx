import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal";
import Loader from "../../components/ui/loader/Loader";
import TableCategory from "./TableCategory.tsx";
import AddCategory from "./AddCategory.tsx";

export default function CategoryList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentPage === "categories") {
            if (searchQuery.trim() && searchQuery.trim().length >= 3) {
                console.log("Performing search for categories:", searchQuery);
                performSearch(searchQuery);
            } else if (searchQuery.trim() === "") {
                console.log("Empty search, fetching all categories");
                fetchCategories();
            } else {
                console.log(
                    "Search query too short, waiting for more characters"
                );
                // Don't do anything, just wait for user to type more
            }
        }
    }, [searchQuery, currentPage, status, page]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/materials/category/list?page=${page}&limit=30`
            );
            console.log(response);

            const categoriesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredCategories(categoriesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Что-то пошло не так при загрузке категорий");
        }
    };

    const performSearch = async (query: string) => {
        if (!query.trim() || query.trim().length < 3) {
            fetchCategories();
            return;
        }

        setIsSearching(true);
        try {
            const response: any = await PostSimple(
                `api/materials/category/search?keyword=${encodeURIComponent(
                    query
                )}&page=${page}&limit=30`
            );

            if (response?.status === 200 || response?.data?.success) {
                const searchResults =
                    response?.data?.result || response?.result || [];
                const totalPagesData =
                    response?.data?.pages || response?.pages || 1;

                setFilteredCategories(searchResults);
                setTotalPages(totalPagesData);
            } else {
                fetchCategories();
            }
        } catch (error) {
            console.error("Search error:", error);
            fetchCategories();
        } finally {
            setIsSearching(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = () => {
        setStatus(!status);
    };

    return (
        <>
            <PageMeta
                title="PH-sklad"
                description="Список Категории метариала"
            />

            <PageBreadcrumb pageTitle="Категории метариала" />

            <div className="grid grid-cols-1 gap-6">
                <ComponentCard
                    title="Список Категории метариала"
                    desc={
                        <button
                            onClick={openModal}
                            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            + Добавить категорию
                        </button>
                    }
                >
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <TableCategory
                                categories={filteredCategories}
                                changeStatus={handleStatusChange}
                            />
                            <div className="mt-4">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </>
                    )}
                </ComponentCard>
            </div>

            <AddCategory
                isOpen={isOpen}
                onClose={closeModal}
                onSuccess={handleStatusChange}
            />

            <Toaster position="bottom-right" reverseOrder={false} />
        </>
    );
}
