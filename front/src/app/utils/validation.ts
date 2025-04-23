export const messages = {
  auth: {
    invalidCredentials: 'Invalid email or password',
    unknown: 'An unexpected error occurred',
    networkError: 'Network error occurred'
  },
  email: {
    invalid: 'Please enter a valid email address'
  },
  password: {
    min: (min: number) => `Password must be at least ${min} characters long`
  }
}; 