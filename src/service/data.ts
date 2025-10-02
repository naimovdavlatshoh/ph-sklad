import axios from "axios";
import { handleAuthError } from "../utils/authUtils";

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (handleAuthError(error)) {
            return Promise.resolve({ data: { handled: true } });
        }
        return Promise.reject(error);
    }
);

export const GetDataSimpleBlob = async (url: string, config: any = {}) => {
    const token = localStorage.getItem("token"); // yoki sessionStorage

    const response = await axios.get(BASE_URL + url, {
        responseType: config.responseType || "json", // blob yoki json
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...config.headers,
        },
        ...config,
    });

    return response.data;
};

export const BASE_URL = "https://apiwh.ph.town/";

export const Token = localStorage.getItem("token");
export const Role = localStorage.getItem("role");

export const PostData = async (url: string, data: any) => {
    const response = await axios.post(BASE_URL + url, data);
    return response;
};

export const PostDataToken = async (url: string, data: any) => {
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            "Content-Type": "multipart/formData",
            Authorization: `Bearer ${Token}`,
        },
    });
    return response;
};

export const PostDocxContract = async (
    url: string,
    contractData: any,
    docxBlob: Blob
) => {
    const formData = new FormData();
    formData.append("contract_file", docxBlob, "shartnoma.docx");
    formData.append("contract_data", JSON.stringify(contractData));

    const response = await axios.post(BASE_URL + url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Token}`,
        },
    });
    return response;
};

export const PostDataTokenJson = async (url: string, data: any) => {
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            Authorization: `Bearer ${Token}`,
        },
    });
    return response;
};

export const PostSimple = async (url: string, data: any = {}) => {
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            Authorization: `Bearer ${Token}`,
        },
    });
    return response;
};

export const GetDataSimple = async (url: string) => {
    if (Token) {
        const response = await axios.get(BASE_URL + url, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    } else {
        const response = await axios.get(BASE_URL + url);
        return response.data;
    }
};
export const GetDataSimpleUrl = async (url: string) => {
    if (Token) {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    } else {
        const response = await axios.get(BASE_URL + url);
        return response.data;
    }
};

export const DeleteData = async (url: string) => {
    const response = await axios.delete(BASE_URL + url, {
        headers: {
            Authorization: `Bearer ${Token}`,
        },
    });
    return response;
};

// Payments API functions
export const GetPaymentsList = async (page: number = 1, limit: number = 10) => {
    const response = await GetDataSimple(
        `api/payments/list?page=${page}&limit=${limit}`
    );
    return response;
};

export const CreatePayment = async (paymentData: {
    arrival_id: number;
    payment_amount: number;
    payment_method: number; // 1-Наличка, 2-Терминал, 3-Клик, 4-Перечисление
    cash_type: number; // 0 - Доллар, 1 - сум
    comments?: string;
}) => {
    const response = await PostDataTokenJson(
        "api/payments/create",
        paymentData
    );
    return response;
};

export const SearchPayments = async (keyword: string) => {
    const response = await GetDataSimple(
        `api/payments/search?keyword=${keyword}`
    );
    return response;
};

export const DeletePayment = async (paymentId: number) => {
    const response = await DeleteData(`api/payments/delete/${paymentId}`);
    return response;
};

// Arrivals search function
export const SearchArrivals = async (keyword: string) => {
    const response = await PostSimple(
        `api/arrival/search?keyword=${encodeURIComponent(keyword)}`
    );
    return response;
};
