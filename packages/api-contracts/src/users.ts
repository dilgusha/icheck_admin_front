// List-dən gələn sadə format
export interface UserListItem {
  id: number
  permissions: string[]
  username: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  phone_number: string | null
  address: string | null
  birth_date: string | null
  sex: string | null
  photo: string | null
  role: string
  work_email: string | null
  work_phone_number: string | null
  work_address: string | null
  doctor_boolean: boolean
  location: number | null
}

// Detail-dən gələn tam format
export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  phone_number: string | null
  address: string | null
  birth_date: string | null
  sex: string | null
  photo: string | null
  role: string
  work_email: string | null
  work_phone_number: string | null
  work_address: string | null
  doctor_boolean: boolean
  location: number | null
  permissions: string[]
}

export interface CreateUserRequest {
  password: string
  is_superuser?: boolean
  username: string
  first_name: string
  last_name: string
  email: string
  is_staff?: boolean
  is_active?: boolean
  phone_number?: string | null
  address?: string | null
  birth_date?: string | null
  sex?: string | null
  role: string
  work_email?: string | null
  work_phone_number?: string | null
  work_address?: string | null
  doctor_boolean?: boolean
  location?: number | null
  groups?: number[]
  user_permissions?: number[]
}


export interface GetUsersResponse {
  data: UserListItem[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface GetUsersParams {
  scope?: 'active' | 'inactive' | 'leader'
  search?: string
  ordering?: string
  page?: number
  per_page?: number
}