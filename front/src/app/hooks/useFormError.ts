import { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { ApiError, Error } from '../bindings';

export function useFormError<T extends FieldValues>() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { setError } = useForm<T>();

  const handleError = (error: ApiError) => {
    setGlobalError(null);

    if (error.type === 'UnprocessableEntity') {
      // Handle field errors
      if (error.error.fields) {
        Object.entries(error.error.fields).forEach(([field, fieldError]) => {
          setError(field as keyof T, {
            type: 'manual',
            message: getErrorMessage(fieldError)
          });
        });
      }
      // Handle global errors
      if (error.error.global) {
        setGlobalError(getErrorMessage(error.error.global));
      }
    } else if (error.type === 'InternalError') {
      setGlobalError('Something went wrong. Please try again later.');
    }
  };

  return {
    globalError,
    setGlobalError,
    handleError
  };
}

function getErrorMessage(error: Error): string {
  if (typeof error === 'string') return error;
  if ('code' in error) return error.code;
  return 'Invalid value';
} 