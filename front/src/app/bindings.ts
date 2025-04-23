export interface ErrorEntry {
  code: string;
  params: Record<string, any>;
}

export interface ValidationError {
  global?: ErrorEntry[];
  [key: string]: ErrorEntry[] | undefined;
}

export type ApiError = 
  | { type: 'UnprocessableEntity'; error: ValidationError }
  | { type: 'Unauthorized' }
  | { type: 'InternalError' }; 