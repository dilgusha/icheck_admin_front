export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  phone_number: string | null;
  address: string | null;
  birth_date: string;
  sex: "male" | "female" | null;
  photo: string | null;
  role: string;
  work_email: string | null;
  work_phone_number: string | null;
  work_address: string | null;
  doctor_boolean: boolean;
  location: any | null;
}

export interface CreateUserRequest {
  password: string;
  is_superuser: boolean;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  phone_number: string;
  address: string;
  birth_date: string;
  sex: string;
  role: string;
  work_email?: string | null;
  work_phone_number?: string | null;
  work_address?: string | null;
  doctor_boolean: boolean;
  location?: number | null;
  groups: number[];
  user_permissions: number[];
}

export interface GetUsersResponse {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export interface GetUsersParams {
  /** * Qeyri-aktiv istifadəçilər: inactive,
   * aktiv istifadəçilər: active,
   * leader: lider istifadəçilər
   */
  scope?: "active" | "inactive" | "leader";
  search?: string;
  ordering?: string;
  page?: number;
  per_page?: number;
}
