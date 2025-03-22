// Generated from OpenAPI schema

export type Email = string;
export type PlainTextPassword = string;
export type SessionToken = string;

export interface SignUpInput {
  email: Email;
  password: PlainTextPassword;
}

export interface AuthenticatedResponse {
  token: SessionToken;
}

// API Error Responses
export interface ApiError {
  status: number;
  message: string;
}

// Validation error response (typically for 400 status codes)
export interface ValidationError {
  detail: string | ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// API Result types
export interface ApiSuccess<T> {
  type: 'success';
  data: T;
}

export interface ApiError {
  type: 'error';
  error: string;
  fieldErrors?: Record<string, string>;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;