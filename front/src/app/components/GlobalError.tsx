import React from 'react';
import { ApiError as BindingsApiError } from '../bindings';
import { ApiError as ServiceApiError, getErrorMessage } from '../services/api';

type Props = {
  error: BindingsApiError | ServiceApiError;
};

export function GlobalError({ error }: Props) {
  const message = getErrorMessage(error);
  return message ? <div className="error-message">{message}</div> : null;
} 