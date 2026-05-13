export interface ForumAuthor {
  id: number
  fullname: string
  avatar_url: string | null
}

export interface ForumFile {
  id: number
  url: string
  filename: string
  mime_type: string
  size_bytes: number
  created_at: string
}

export interface ForumPost {
  id: number
  title: string
  body: string
  specialization_id: string | null
  doctors_only: boolean
  author: ForumAuthor | null
  files: ForumFile[]
  answer_count: number
  like_count: number
  liked_by_me: boolean | null
  created_at: string
}

export interface ForumAnswer {
  id: number
  body: string
  author: ForumAuthor | null
  files: ForumFile[]
  created_at: string
}

export interface ForumPostsListResponse {
  data: ForumPost[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface ForumAnswersListResponse {
  data: ForumAnswer[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface ForumPostsQuery {
  search?: string
  page?: number
  per_page?: number
}

export interface ForumAnswersQuery {
  post_id?: number
  page?: number
  per_page?: number
}