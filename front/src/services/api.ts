// Simple auth service

export interface AuthResult {
  token: string | null;
  error: string | null;
}

// Generate a random token using only URL-safe characters
const generateToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Auth service
export const authService = {
  // Check if email is kirill.salykin@gmail.com
  authenticate: async (email: string): Promise<AuthResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'kirill.salykin@gmail.com') {
          resolve({
            token: generateToken(),
            error: null
          });
        } else {
          resolve({
            token: null,
            error: 'Only kirill.salykin@gmail.com is allowed'
          });
        }
      }, 300);
    });
  }
};