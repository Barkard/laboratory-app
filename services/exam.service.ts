import { apiFetch } from '../utils/api';
import { Exam } from '../types';

export const examService = {
    getAllExams: async (): Promise<Exam[]> => {
        return apiFetch<Exam[]>('/exams');
    },

    getExamById: async (id: number): Promise<Exam> => {
        return apiFetch<Exam>(`/exams/${id}`);
    },

    createExam: async (data: Partial<Exam>): Promise<Exam> => {
        return apiFetch<Exam>('/exams', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateExam: async (id: number, data: Partial<Exam>): Promise<Exam> => {
        return apiFetch<Exam>(`/exams/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteExam: async (id: number): Promise<void> => {
        return apiFetch<void>(`/exams/${id}`, {
            method: 'DELETE',
        });
    },
};
