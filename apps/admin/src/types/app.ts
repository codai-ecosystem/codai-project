export interface AppConfig {
  name: string
  version: string
  description: string
  port: number
}

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface ApiResponse<T = any> {
  data: T
  message: string
  success: boolean
}