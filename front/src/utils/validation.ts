// Shared messages between client validation and server errors
export const messages = {
  email: {
    invalid: 'Please enter a valid email address'
  },
  password: {
    min: (length: number) => `Password must be at least ${length} character${length === 1 ? '' : 's'}`
  },
  auth: {
    alreadyExists: 'This account already exists.',
    invalidCredentials: 'Invalid email or password',
    networkError: 'Connection error. Please check your internet connection.',
    unknown: 'Something went wrong. Please try again later.'
  }
} as const;

// Client-side validation rules using the shared messages
export const validation = {
  email: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: messages.email.invalid
    }
  },
  password: {
    minLength: {
      value: 4,
      message: messages.password.min(4)
    }
  }
} as const; 