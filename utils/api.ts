export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:3001/api';

export interface ApiError {
    message: string;
    statusCode: number;
}

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: 'An unexpected error occurred', statusCode: response.status };
            }
            throw errorData as ApiError;
        }

        // Handle empty responses (like 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json() as T;
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'message' in error) {
            throw error;
        }
        throw { message: 'Network error or server unreachable', statusCode: 500 };
    }
};
