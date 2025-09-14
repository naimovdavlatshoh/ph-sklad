import { useState, useEffect } from "react";
import { useSearch } from "../../context/SearchContext";
import {
    GetPaymentsList,
    SearchPayments,
    DeletePayment,
} from "../../service/data";

import Button from "../../components/ui/button/Button";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";
import { AddPaymentModal } from "./AddPaymentModal";
import { PaymentTable } from "./PaymentTable";

export interface Payment {
    invoice_number: string;
    payment_id: string;
    user_id: string;
    user_name: string;
    arrival_id: string;
    supplier_id: string;
    supplier_name: string;
    payment_dollar_rate_that_time: string;
    arrival_dollar_rate_that_time: string;
    payment_amount: string;
    payment_method: string;
    payment_method_text: string;
    cash_type_text: string;
    dollar_rate: string;
    comments: string;
    created_at: string;
}

export default function PaymentList() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<Payment[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<{
        id: string;
        supplierName: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { searchQuery } = useSearch();

    const loadPayments = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await GetPaymentsList(page, 10);
            setPayments(response?.result || []);
            setTotalPages(response.pages || 1);
            setCurrentPage(page);
        } catch (error) {
            toast.error("Ошибка при загрузке платежей");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setIsSearching(false);
            setSearchResults([]);
            loadPayments(1);
            return;
        }

        try {
            setIsSearching(true);
            const response = await SearchPayments(query);
            setSearchResults(response.data || []);
        } catch (error) {
            toast.error("Ошибка при поиске платежей");
        }
    };

    const handleDeleteClick = (paymentId: string, supplierName: string) => {
        setPaymentToDelete({ id: paymentId, supplierName });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!paymentToDelete) return;

        try {
            setIsDeleting(true);
            await DeletePayment(parseInt(paymentToDelete.id));
            toast.success("Платеж успешно удален");
            loadPayments(currentPage);
            setIsDeleteModalOpen(false);
            setPaymentToDelete(null);
        } catch (error) {
            toast.error("Ошибка при удалении платежа");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setPaymentToDelete(null);
    };

    const handleAddPayment = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
    };

    const handlePaymentAdded = () => {
        loadPayments(currentPage);
        setIsAddModalOpen(false);
    };

    useEffect(() => {
        loadPayments(1);
    }, []);

    useEffect(() => {
        if (searchQuery) {
            handleSearch(searchQuery);
        } else {
            setIsSearching(false);
            setSearchResults([]);
            loadPayments(1);
        }
    }, [searchQuery]);

    const displayPayments = isSearching ? searchResults : payments;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Касса-Склад
                </h1>
                <Button onClick={handleAddPayment}>Добавить платеж</Button>
            </div>

            <PaymentTable
                payments={displayPayments}
                loading={loading}
                onDelete={handleDeleteClick}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={loadPayments}
                isSearching={isSearching}
            />

            {/* Add Payment Modal */}
            {isAddModalOpen && (
                <AddPaymentModal
                    isOpen={isAddModalOpen}
                    onClose={handleCloseModal}
                    onPaymentAdded={handlePaymentAdded}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Удалить платеж"
                message="Вы уверены, что хотите удалить этот платеж? Это действие нельзя отменить."
                itemName={paymentToDelete?.supplierName}
                isLoading={isDeleting}
            />
        </div>
    );
}
