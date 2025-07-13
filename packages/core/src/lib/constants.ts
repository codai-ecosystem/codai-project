export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  WORKSPACES: '/api/workspaces',
  PROJECTS: '/api/projects',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
} as const;

export const DEFAULT_LIMITS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;