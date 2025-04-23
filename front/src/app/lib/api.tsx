import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { Procedures } from '../bindings';
import React from 'react';

const API_URL = 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async call<T extends keyof Procedures>(
    procedure: T,
    input: Procedures[T]['input']
  ): Promise<Procedures[T]['output']> {
    const response = await fetch(`${this.baseUrl}/api/${procedure}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error as Procedures[T]['error'];
    }

    return response.json();
  }
}

const client = new ApiClient(API_URL);
const queryClient = new QueryClient();

export function useProcedure<T extends keyof Procedures>(
  procedure: T,
  options?: { 
    input?: Procedures[T]['input'];
    onSuccess?: (data: Procedures[T]['output']) => void;
  }
) {
  const mutation = useMutation({
    mutationFn: (input: Procedures[T]['input']) => client.call(procedure, input),
    onSuccess: options?.onSuccess
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending
  };
}

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}; 