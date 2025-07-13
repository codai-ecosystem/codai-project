export interface AppConfig {
  name: string
  version: string
  description: string
  port: number
}

export interface AppUser {
  id: string
  name: string
  email: string
  role: string
}

export interface AppApiResponse<T = any> {
  data: T
  message: string
  success: boolean
}