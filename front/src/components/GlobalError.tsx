import { ApiError, ErrorEntry } from '../bindings';

interface GlobalErrorProps {
  error: ApiError | null;
}

function isErrorEntry(error: any): error is ErrorEntry {
  return error && typeof error === 'object' && 'code' in error;
}

export function GlobalError({ error }: GlobalErrorProps) {
  if (!error) return null;

  if (error.type === 'InternalError') {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
        <p className="text-sm text-red-700">An internal error occurred</p>
      </div>
    );
  }

  if (error.type === 'UnprocessableEntity' && error.error.global) {
    const globalError = error.error.global;
    if (isErrorEntry(globalError)) {
      return (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-700">{globalError.code}</p>
        </div>
      );
    }
  }

  return null;
} 