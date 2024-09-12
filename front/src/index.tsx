import React, { useRef, useState } from "react";
import { useQuery, useMutation } from 'urql';

import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import { Client, Provider, cacheExchange, fetchExchange } from 'urql';

import './index.css';

function Root() {
  return (<div>
    <div>
    <a href="/sign-up">Sign up</a>
    <a href="/sign-in">Sign in</a>
    <a href="/dummy">Dummy</a>
    </div>
    ROOT
    <Outlet />
  </div>)
};

function SignIn() {
  return (<div>Signin</div>)
};


const dummyMutationQ = `
mutation ($a: Int!, $b: Int!) {
    dummy {
      add(a: $a, b: $b)
    }
  }
`;


function Dummy() {
  const aRef = useRef<HTMLInputElement>(null);
  const bRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<number | null>(null);
  const [dummyMutationResult, dummyMutation] = useMutation(dummyMutationQ);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const a = aRef.current?.valueAsNumber || 0;
    const b = bRef.current?.valueAsNumber || 0;

    const { data, error } = await dummyMutation({ a, b });

    if (data && data.dummy && data.dummy.add !== undefined) {
      setResult(data.dummy.add);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="a">Number A:</label>
          <input id="a" type="number" ref={aRef} />
        </div>
        <div>
          <label htmlFor="b">Number B:</label>
          <input id="b" type="number" ref={bRef} />
        </div>
        <button type="submit">Submit</button>
      </form>

      {result !== null && (
        <div>
          <h2>Result: {result}</h2>
        </div>
      )}
    </div>
  );
};


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    const { data, error } = await execute({ email, password });

     if (error) {
      console.error('Error during sign up:', error.message);
    } else if (data && data.membership && data.membership.signUp) {
      console.log('Signup Result (Token):', data.membership.signUp);
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "dummy",
        element: <Dummy />,
      },

    ],
  },
]);

const client = new Client({
  url: "http://localhost:8000/api",
  exchanges: [cacheExchange, fetchExchange],
});


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>

    <Provider value={client}>
      <RouterProvider router={router} />
    </Provider>

  </React.StrictMode>
);
