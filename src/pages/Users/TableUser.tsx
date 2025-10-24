import { PencilIcon, TrashBinIcon, UserIcon } from "../../icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useModal } from "../../hooks/useModal";
import EditUserModal from "./EditUser";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/button/Button";
import DeleteUserModal from "./DeleteUser";
import { DeleteData } from "../../service/data";

interface Users {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
    login: string;
    role_id: number;
    role_name: string;
    created_at: string;
}
interface TableUserProps {
    users: Users[];
    changeStatus: () => void;
}

export default function TableUser({ users, changeStatus }: TableUserProps) {
    const { isOpen, openModal, closeModal } = useModal();
    // @ts-ignore
    const [response, setResponse] = useState("");
    const [selectedUser, setSelectedUser] = useState<Users | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const onDeleteUser = async () => {
        setIsDeleting(true);
        try {
            await DeleteData(`api/user/delete/${selectedUser?.user_id}`);
            toast.success("Пользователь успешно удален!");
            changeStatus();
        } catch (error) {
            toast.error("Что-то пошло не так при удалении пользователя");
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
        }
    };



    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
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
                                Имя пользователя
                            </TableCell>
                            <TableCell
                                isHeader
                                className=" py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Логин
                            </TableCell>
                            <TableCell
                                isHeader
                                className=" py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Роль
                            </TableCell>
                            <TableCell
                                isHeader
                                className=" py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Действия
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {users?.map((order: Users, index: number) => (
                            <TableRow key={order.user_id}>
                                <TableCell className="  text-gray-500 px-5 py-4  text-theme-sm dark:text-gray-400">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div className="flex items-center gap-3">
                                        <div className=" overflow-hidden rounded-full bg-gray-100 p-3 text-blue-500 text-xl">
                                            <UserIcon />
                                        </div>
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {order.firstname}
                                            </span>
                                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                {order.lastname +
                                                    " " +
                                                    order.fathername}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className=" py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {order.login}
                                </TableCell>
                                <TableCell className=" py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {order.role_name}
                                </TableCell>
                                <TableCell className=" py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <Button
                                        className="mr-2"
                                        onClick={() => {
                                            openModal();
                                            setSelectedUser(order);
                                        }}
                                        size="xs"
                                        variant="outline"
                                        startIcon={
                                            <PencilIcon className="size-4" />
                                        }
                                    >
                                        {""}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setDeleteModalOpen(true);
                                            setSelectedUser(order);
                                        }}
                                        size="xs"
                                        variant="danger"
                                        startIcon={
                                            <TrashBinIcon className="size-4" />
                                        }
                                    >
                                        {""}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <EditUserModal
                isOpen={isOpen}
                onClose={closeModal}
                changeStatus={changeStatus}
                setResponse={setResponse}
                user={selectedUser}
            />
            <DeleteUserModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onDelete={onDeleteUser}
                userName={
                    selectedUser
                        ? `${selectedUser.firstname} ${selectedUser.lastname}`
                        : ""
                }
                isDeleting={isDeleting}
            />
        </div>
    );
}
