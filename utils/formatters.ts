/**
 * Formats a date or date string to dd/mm/yy
 * @param date Date object or ISO date string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return String(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
};

/**
 * Formats a date/time string to dd/mm/yy HH:mm
 */
export const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return String(date);

    const datePart = formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${datePart} ${hours}:${minutes}`;
};

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase
 */
export const capitalize = (text: string): string => {
    if (!text) return '';
    const trimmed = text.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

/**
 * Formats a user's full name with proper capitalization
 */
export const formatFullName = (firstName: string, lastName: string): string => {
    return `${capitalize(firstName)} ${capitalize(lastName)}`.trim();
};
