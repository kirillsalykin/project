import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { Procedures } from '../bindings';
import React from 'react';
import { useAuth } from '../components/Auth';

const API_URL = 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async call<T extends keyof Procedures>(
    procedure: T,
    input: Procedures[T]['input'],
    token?: string | null
  ): Promise<Procedures[T]['output']> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/${procedure}`, {
      method: 'POST',
      headers,
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
  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: (input: Procedures[T]['input']) => client.call(procedure, input, getToken()),
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