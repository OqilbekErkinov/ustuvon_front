export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_creator_active: boolean
  bio: string
  avatar: string | null
  telegram_chat_id: string | null
  date_joined: string
  streak_days: number
}

export interface PublicProfile {
  id: number
  username: string
  first_name: string
  last_name: string
  bio: string
  avatar: string | null
  is_creator_active: boolean
  date_joined: string
  followers_count: number
  following_count: number
  is_following: boolean
  streak_days: number
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Lesson {
  id: number
  course: number
  title: string
  content: string
  video_url: string
  order: number
  duration_minutes: number
  is_free_preview: boolean
  created_at: string
  is_completed: boolean
  is_locked: boolean
  comments_count: number
}

export interface Review {
  id: number
  student: User
  course: number
  rating: number
  comment: string
  created_at: string
}

export interface LessonNote {
  id: number
  lesson: number
  body: string
  updated_at: string
}

export interface Comment {
  id: number
  lesson: number
  author: User
  parent: number | null
  body: string
  created_at: string
  replies: Comment[]
}

export interface Certificate {
  id: number
  code: string
  course: number
  course_title: string
  course_slug: string
  student_name: string
  pdf_file: string
  issued_at: string
}

export interface Course {
  id: number
  title: string
  subtitle: string
  slug: string
  description: string
  instructor: User
  category: Category | null
  cover_image: string | null
  level: 'beginner' | 'intermediate' | 'advanced'
  price: string
  original_price: string | null
  discount_percent: number
  is_published: boolean
  is_bestseller: boolean
  strict_sequential: boolean
  created_at: string
  students_count: number
  lessons_count: number
  is_enrolled: boolean
  is_wishlisted: boolean
  average_rating: number
  reviews_count: number
  total_duration_minutes: number
  lessons?: Lesson[]
  reviews?: Review[]
  what_you_will_learn_list?: string[]
  requirements_list?: string[]
}

export interface Enrollment {
  id: number
  student: User
  course: Course
  enrolled_at: string
  progress_percent: number
}

export interface Wishlist {
  id: number
  course: Course
  added_at: string
}

export interface CVProfile {
  full_name: string
  headline: string
  summary: string
  email: string
  phone: string
  location: string
  education: { institution: string; degree: string; start: string; end: string }[]
  experience: { company: string; role: string; start: string; end: string; description: string }[]
  skills: string[]
  links: { label: string; url: string }[]
  updated_at: string
}

export interface CourseAnalytics {
  id: number
  title: string
  slug: string
  students_count: number
  completion_rate: number
  average_rating: number
  reviews_count: number
  revenue: number
  is_published: boolean
}

export interface AnalyticsOverview {
  total_courses: number
  total_students: number
  total_revenue: number
  average_rating: number
  courses: CourseAnalytics[]
}

export interface LessonDropoff {
  lesson_id: number
  title: string
  order: number
  completed_count: number
  completion_rate: number
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
