export interface User {
    user_id: number;
    identity_card: string;
    first_name: string;
    last_name: string;
}

export interface ExamType {
    type_id: number;
    category_name: string;
    price: number;
}

export interface CustomFile {
    file_id: number;
    config_name: string;
    json_schema: string;
}

export interface Exam {
    exam_id: number;
    type_id: number;
    file_id: number;
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
}
