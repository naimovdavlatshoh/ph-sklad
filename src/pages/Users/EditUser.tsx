import React, { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { PostDataTokenJson } from "../../service/data";
import { toast } from "react-hot-toast";

interface EditUserModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    setResponse: (value: string) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    changeStatus,
    setResponse,
    user,
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
        { value: 2, label: "Бухгалтер" },
        { value: 3, label: "Эксперт" },
        { value: 4, label: "Лаборант" },
    ];

    const handleSelectChange = (value: string) => {
        setRoleId(Number(value));
    };

    // User ma'lumotlarini yuklash
    useEffect(() => {
        if (user) {
            setFirstname(user?.firstname || "");
            setLastname(user?.lastname || "");
            setFathername(user?.fathername || "");
            setLogin(user?.login || "");
            setRoleId(user?.role_id || null);
            // Password ni bo'sh qoldiramiz, chunki edit qilganda yangi password kiritish kerak
            setPassword("");
        }
    }, [user]);

    const handleSubmit = () => {
        // Edit holatida password majburiy emas
        if (!firstname || !lastname || !fathername || !login || !roleId) {
            alert("Пожалуйста, заполните все обязательные поля.");
            return;
        }

        setIsLoading(true);

        const payload: any = {
            firstname,
            lastname,
            fathername,
            login,
            role_id: roleId,
        };

        // Agar password kiritilgan bo'lsa, uni qo'shamiz
        if (password.trim()) {
            payload.password = password;
        }

        PostDataTokenJson(`api/user/update/${user?.user_id}`, payload)
            .then((res: any) => {
                if (res?.status === 200 || res?.success) {
                    toast.success("Пользователь успешно обновлен");
                    changeStatus();
                    onClose();
                    console.log("Обновлено успешно");
                } else {
                    toast.error("Ошибка при обновлении пользователя");
                }
            })
            .catch((error: any) => {
                console.error("Ошибка:", error);
                const errorMessage =
                    error?.response?.data?.error || "Произошла ошибка";
                setResponse(errorMessage);
                toast.error(errorMessage);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // Joriy rolni topish
    const getCurrentRole = () => {
        return options.find((option) => option.value === roleId);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[700px] p-6 lg:p-10"
        >
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Редактировать пользователя
            </h2>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="firstname">Введите имя</Label>
                    <Input
                        type="text"
                        id="firstname"
                        placeholder="Имя"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="lastname">Введите фамилию</Label>
                    <Input
                        type="text"
                        id="lastname"
                        placeholder="Фамилия"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="fathername">Введите отчество</Label>
                    <Input
                        type="text"
                        id="fathername"
                        placeholder="Отчество"
                        value={fathername}
                        onChange={(e) => setFathername(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="login">Введите логин</Label>
                    <Input
                        type="text"
                        id="login"
                        placeholder="Логин"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Label>Выберите роль</Label>
                        {getCurrentRole() && (
                            <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md">
                                Текущая: {getCurrentRole()?.label}
                            </span>
                        )}
                    </div>
                    <Select
                        options={options}
                        placeholder="Выберите роль"
                        onChange={handleSelectChange}
                        className="dark:bg-dark-900"
                    />
                </div>
                <div>
                    <Label htmlFor="password">
                        Новый пароль (оставьте пустым, если не хотите менять)
                    </Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Введите новый пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
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

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
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
                            "Сохранить изменения"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditUserModal;
