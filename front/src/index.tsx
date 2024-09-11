import React, { useRef, useState } from "react";
import { useQuery, useMutation } from 'urql';

import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import { Client, Provider, cacheExchange, fetchExchange } from 'urql';

import App from './App';

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

function SignUp() {
  return (<div>Signup</div>)
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
