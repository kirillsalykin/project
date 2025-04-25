import { useState } from 'react';
import { useForm, FieldValues, Path } from 'react-hook-form';
import { ApiError } from '../bindings';
import { useNavigate, useLocation } from 'react-router-dom';

export function useFormError<T extends FieldValues>() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { setError } = useForm<T>();
  const navigate = useNavigate();
  const location = useLocation();

  const handleError = (error: ApiError) => {
    setGlobalError(null);

    switch (error.type) {
      case 'UnprocessableEntity':
        if (error.error.type === 'fields') {
          Object.entries(error.error.data).forEach(([fieldName, errorEntry]) => {
            setError(fieldName as Path<T>, {
              type: 'manual',
              message: errorEntry.code
            });
          });
        } else if (error.error.type === 'global') {
          setGlobalError(error.error.data.code);
        }
        break;
      case 'InternalError':
        setGlobalError('Something went wrong. Please try again in a moment.');
        break;
      case 'Unauthorized':
        const returnTo = encodeURIComponent(location.pathname + location.search);
        navigate(`/sign-in?returnTo=${returnTo}`);
        break;
    }
  };

  return {
    globalError,
    setGlobalError,
    handleError
  };
} 