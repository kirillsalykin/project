import React, { useRef,  ReactNode } from "react";
import { useMutation, } from 'urql';
import { useAuth } from '../components/auth'


const SignUp: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [signupResult, execute] = useMutation(`
    mutation SignUp($email: String!, $password: String!) {
      membership {
        signUp(email: $email, password: $password)
      }
    }
  `);

  const { signin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    const { data, error } = await execute({ email, password });

     if (error) {
      console.error('Error during sign up:', error.message);
    } else if (data && data.membership && data.membership.signUp) {
      signin(data.membership.signUp);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" ref={emailRef} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" ref={passwordRef} required />
        </div>
        <button type="submit">Sign Up</button>
      </form>

      {signupResult.fetching && <p>Signing up...</p>}
      {signupResult.error && <p>Error: {signupResult.error.message}</p>}
      {signupResult.data && signupResult.data.membership && signupResult.data.membership.signUp && (
        <p>Token: {signupResult.data.membership.signUp}</p>
      )}
    </div>
  );
};

export default SignUp;

