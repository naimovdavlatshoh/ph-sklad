import React from "react";
import { AngleLeftIcon, AngleRightIcon } from "../../icons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    const renderPageNumbers = () => {
        const pages = [];

        // Agar totalPages 7 dan kam bo'lsa, barcha pagelarni ko'rsat
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`px-3 py-1 rounded-md border ${
                            i === currentPage
                                ? "bg-blue-600 text-white"
                                : "bg-white hover:bg-gray-100"
                        }`}
                    >
                        {i}
                    </button>
                );
            }
            return pages;
        }

        // Boshidagi 2 ta page
        pages.push(
            <button
                key={1}
                onClick={() => onPageChange(1)}
                className={`px-3 py-1 rounded-md border ${
                    1 === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-100"
                }`}
            >
                1
            </button>
        );

        pages.push(
            <button
                key={2}
                onClick={() => onPageChange(2)}
                className={`px-3 py-1 rounded-md border ${
                    2 === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-100"
                }`}
            >
                2
            </button>
        );

        // Agar currentPage 4 dan katta bo'lsa, 3 nuqta qo'sh
        if (currentPage > 4) {
            pages.push(
                <span key="dots1" className="px-2 py-1 text-gray-500">
                    ...
                </span>
            );
        }

        // Current page va uning atrofidagi pagelar
        const startPage = Math.max(3, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            if (
                i !== 1 &&
                i !== 2 &&
                i !== totalPages - 1 &&
                i !== totalPages
            ) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`px-3 py-1 rounded-md border ${
                            i === currentPage
                                ? "bg-blue-600 text-white"
                                : "bg-white hover:bg-gray-100"
                        }`}
                    >
                        {i}
                    </button>
                );
            }
        }

        // Agar currentPage totalPages - 3 dan kichik bo'lsa, 3 nuqta qo'sh
        if (currentPage < totalPages - 3) {
            pages.push(
                <span key="dots2" className="px-2 py-1 text-gray-500">
                    ...
                </span>
            );
        }

        // Oxiridagi 2 ta page
        pages.push(
            <button
                key={totalPages - 1}
                onClick={() => onPageChange(totalPages - 1)}
                className={`px-3 py-1 rounded-md border ${
                    totalPages - 1 === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-100"
                }`}
            >
                {totalPages - 1}
            </button>
        );

        pages.push(
            <button
                key={totalPages}
                onClick={() => onPageChange(totalPages)}
                className={`px-3 py-1 rounded-md border ${
                    totalPages === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-100"
                }`}
            >
                {totalPages}
            </button>
        );

        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border bg-white hover:bg-gray-100 disabled:opacity-50"
            >
                <AngleLeftIcon />
            </button>

            {renderPageNumbers()}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border bg-white hover:bg-gray-100 disabled:opacity-50"
            >
                <AngleRightIcon />
            </button>
        </div>
    );
};

export default Pagination;
