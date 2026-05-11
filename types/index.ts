export interface User {
    id_user: number;
    uid: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    id_role: number;
}

export interface ClassExam {
    id_class: number;
    class_name: string;
    exam_types?: ExamType[];
}

export interface ExamType {
    id_type: number;
    id_class?: number;
    category_name: string;
    detail: string;
    requirements?: string;
    class_exam?: ClassExam;
}

export interface CustomFile {
    id_file: number;
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
    id_exam: number;
    id_type: number;
    id_file: number;
    custom_files?: CustomFile;
    exam_type?: ExamType;
}

export interface Appointment {
    id_appointment: number;
    id_user: number;
    requested_date: string; // ISO String
    status: string;
    user?: User;
    exam_appointment_detail?: AppointmentExamDetail[];
}

export interface AppointmentExamDetail {
    id_detail: number;
    id_appointment: number;
    id_exam: number;
    patient_observations?: string;
    appointment?: Appointment;
    exam?: Exam;
}

export interface Result {
    id_result: number;
    id_appointment_detail: number;
    delivery_date: string; // ISO String
    result_data?: string; // JSON string
    exam_appointment_detail?: AppointmentExamDetail;
}
