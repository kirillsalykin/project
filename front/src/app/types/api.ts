// Generated from OpenAPI schema

import type { ApiError, ApiResult } from '../services/api';

export interface SignUpInput {
  email: string;
  password: string;
}

export interface AuthenticatedResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export type { ApiError, ApiResult }; 