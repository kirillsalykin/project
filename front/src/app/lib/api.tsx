import { QueryClient, QueryClientProvider, useMutation as useReactQueryMutation, useQuery as useReactQuery } from '@tanstack/react-query';
import { Procedures } from '../bindings';
import React from 'react';
import { useAuth } from '../hooks/Auth';
import { config } from '../config';

const API_URL = config.apiUrl;

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

export const client = new ApiClient(API_URL);

type Query = {
  [K in keyof Procedures]: Procedures[K]['kind'] extends 'query' ? K : never
}[keyof Procedures];

type Mutation = {
  [K in keyof Procedures]: Procedures[K]['kind'] extends 'mutation' ? K : never
}[keyof Procedures];

export function useQuery<T extends Query>(
  procedure: T
) {
  const { getToken } = useAuth();
  const token = getToken();

  return useReactQuery({
    queryKey: [procedure, token],
    queryFn: () => client.call(procedure, null, token),
    enabled: !!token
  });
}

export function useMutation<T extends Mutation>(
  procedure: T
) {
  const { getToken } = useAuth();
  const token = getToken();

  return useReactQueryMutation({
    mutationFn: (input: Procedures[T]['input']) => client.call(procedure, input, token)
  });
}

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}; 