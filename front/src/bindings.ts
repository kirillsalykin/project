export interface ErrorEntry {
    code: string;
    params: Record<string, any>;
  }
  
  export type Error =
    | { [key: string]: Error }
    | { [index: number]: Error }
    | ErrorEntry;
  
  export interface ValidationError {
    fields?: Error;
    global?: Error;
  }
  
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
    sign_up: { input: SignUpInput; output: AuthenticatedOutput; error: ApiError };
    sign_in: { input: SignUpInput; output: AuthenticatedOutput; error: ApiError };
    me: { input: null; output: MeOutput; error: ApiError };
  };
  