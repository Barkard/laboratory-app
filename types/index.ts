export interface User {
    user_id: number;
    identity_card: string;
    first_name: string;
    last_name: string;
}

export interface ExamType {
    type_id: number;
    category_name: string;
}

export interface CustomFile {
    file_id: number;
    config_name: string;
    json_schema: string;
}

export interface DynamicField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'checkbox' | 'select';
    options?: string[];
}

export interface Exam {
    exam_id: number;
    name: string;
    type_id: number;
    file_id: number;
    customFields?: DynamicField[];
}

export interface Appointment {
    appointment_id: number;
    user_id: number;
    requested_date: Date | string;
    status: string;
}

export interface AppointmentExamDetail {
    detail_id: number;
    appointment_id: number;
    exam_id: number;
    patient_observations?: string;
}

export interface Result {
    result_id: number;
    appointment_detail_id: number;
    delivery_date: Date | string;
    data?: Record<string, any>; // Stores values for dynamic fields
}
