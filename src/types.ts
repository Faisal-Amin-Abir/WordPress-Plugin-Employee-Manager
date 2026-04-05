
export interface Employee {
    id?: number;
    full_name: string;
    email: string;
    phone?: string;
    department?: string;
    job_title?: string;
    salary?: number;
    date_joined?: string;
    profile_photo_id?: number;
    profile_photo_url?: string | null;
    status: 'active' | 'inactive';
}