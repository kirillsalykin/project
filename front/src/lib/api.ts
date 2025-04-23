import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { Procedures, ApiError } from '../bindings';

const API_URL = 'http://localhost:8000';

type ProcedureName = keyof Procedures;
type ProcedureInput<T extends ProcedureName> = Procedures[T]['input'];
type ProcedureOutput<T extends ProcedureName> = Procedures[T]['output'];

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async call<T extends ProcedureName>(
    procedure: T,
    input: ProcedureInput<T>
  ): Promise<ProcedureOutput<T>> {
    const response = await fetch(`${this.baseUrl}/api/${procedure}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error as ApiError;
    }

    return response.json();
  }
}

const api = new ApiClient(API_URL);

export function useProcedure<T extends ProcedureName>(
  procedure: T,
  options?: Omit<UseMutationOptions<ProcedureOutput<T>, ApiError, ProcedureInput<T>>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: (input: ProcedureInput<T>) => api.call(procedure, input),
    ...options,
  });
} 