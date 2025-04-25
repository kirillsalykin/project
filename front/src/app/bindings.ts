export interface ErrorEntry {
  code: string;
  params: Record<string, any>;
}

export interface FieldsError {
  type: 'fields';
  data: Record<string, ErrorEntry>;
}

export interface GlobalError {
  type: 'global';
  data: ErrorEntry;
}

export type ValidationError = FieldsError | GlobalError;

export type ApiError =
  | { type: "UnprocessableEntity"; error: ValidationError }
  | { type: "Unauthorized" }
  | { type: "InternalError" };

export interface SignUpInput {
  email: string;
  password: string;
}

export interface AuthenticatedOutput {
  token: string;
}

export interface MeOutput {
  id: string;
  email: string;
}

export type Procedures = {
  "membership/sign-up": { kind: "mutation", input: SignUpInput; output: AuthenticatedOutput; error: ApiError };
  "membership/sign-in": { kind: "mutation", input: SignUpInput; output: AuthenticatedOutput; error: ApiError };
  "membership/me": { kind: "query", input: null; output: MeOutput; error: ApiError };
};
