/**
 * Utility functions for formatting numbers in the application
 */

/**
 * Formats a number with thousand separators using Uzbek locale
 * @param amount - The number to format
 * @param currency - Optional currency suffix (default: "сум")
 * @returns Formatted string with thousand separators
 */
export const formatNumber = (
    amount: number | string,
    currency?: string
): string => {
    if (amount === null || amount === undefined) return "0";

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return "0";

    const formatted = numAmount.toLocaleString("ru-RU").replace(/,/g, " ");

    return currency ? `${formatted} ${currency}` : formatted;
};

/**
 * Formats a number as currency with Uzbek locale
 * @param amount - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string): string => {
    return formatNumber(amount);
};

/**
 * Formats a number without currency suffix
 * @param amount - The number to format
 * @returns Formatted number string
 */
export const formatAmount = (amount: number | string): string => {
    return formatNumber(amount);
};

/**
 * Formats a date to DD.MM.YYYY, HH:mm format
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export const formatDateTime = (date: Date | string): string => {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return "";

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
};
