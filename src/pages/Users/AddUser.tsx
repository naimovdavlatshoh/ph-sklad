// components/modals/AddUserModal.tsx

import React, { useState } from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { PostDataTokenJson } from "../../service/data";
import { toast } from "react-hot-toast";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    setResponse: (value: string) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
    isOpen,
    onClose,
    changeStatus,
    setResponse,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [fathername, setFathername] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const options = [
        { value: 1, label: "Директор" },
        { value: 2, label: "Менеджер" },
    ];
    const handleSelectChange = (value: string) => {
        setRoleId(Number(value));
    };

    const handleSubmit = () => {
        if (
            !firstname ||
            !lastname ||
            !fathername ||
            !login ||
            !password ||
            !roleId
        ) {
            alert("Пожалуйста, заполните все поля.");
            return;
        }

        setIsLoading(true);

        const payload = {
            firstname,
            lastname,
            fathername,
            login,
            password,
            role_id: roleId,
        };

        PostDataTokenJson("api/user/create", payload)
            .then((res: any) => {
                if (res?.status === 200 || res?.success) {
                    toast.success("Пользователь успешно добавлен");
                    setFirstname("");
                    setLastname("");
                    setFathername("");
                    setLogin("");
                    setPassword("");
                    setRoleId(null);
                    changeStatus();
                    onClose();
                    console.log("qushildi");
                } else {
                }
            })
            .catch((error: any) => {
                // console.log(error.response.data.error);
                onClose();
                setResponse(error.response.data.error);

                toast.error(error.response.data.error);
                setFirstname("");
                setLastname("");
                setFathername("");
                setLogin("");
                setPassword("");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[700px] p-6 lg:p-10"
        >
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Добавить пользователя
            </h2>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="inputTwo">Введите имя</Label>
                    <Input
                        type="text"
                        id="inputTwo"
                        placeholder="Имя"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="inputTwo">Введите фамилию</Label>
                    <Input
                        type="text"
                        id="inputTwo"
                        placeholder="Фамилия"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="inputTwo">Введите отчество</Label>
                    <Input
                        type="text"
                        id="inputTwo"
                        placeholder="Отчество"
                        value={fathername}
                        onChange={(e) => setFathername(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="inputTwo">Введите логин</Label>
                    <Input
                        type="text"
                        id="inputTwo"
                        placeholder="Логин"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                </div>
                <div>
                    <Label>Выберите роль</Label>
                    <Select
                        options={options}
                        placeholder="Select Option"
                        onChange={handleSelectChange}
                        className="dark:bg-dark-900"
                    />
                </div>
                <div>
                    <Label>Введите пароль</Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                            {showPassword ? (
                                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                            ) : (
                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:text-gray-100"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md text-white transition-colors ${
                            isLoading
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Сохранение...
                            </div>
                        ) : (
                            "Сохранить"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddUserModal;
