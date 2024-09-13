import React, { useRef, useState,  createContext, useContext, ReactNode } from "react";
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import {
  Client,
  Provider,
  useQuery,
  useMutation,
  cacheExchange,
  fetchExchange
} from 'urql';

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

interface AuthContextType {
  signin: (token: string) => void;
  signout: () => void;
  getToken: () => string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] =  useState<string | null>(null);

  const signin = (token: string) => {
    console.log("TOKEN", token);
    setToken(token);
    localStorage.setItem('authToken', token);
  };

  const signout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const getToken = () => {
    // read it from the localStorage as well
    console.log("RETURN TOKEN", token);
    return token;
  };


  return (
    <AuthContext.Provider value={{ getToken, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type TokenFunction = () => string | null;

export const createUrqlClient = (getToken: TokenFunction): Client => {
  return new Client({
   url: "http://localhost:8000/api",
   exchanges: [cacheExchange, fetchExchange],
   fetchOptions: () => {
     const token = getToken();
     return {
       headers: { authorization: token ? `Bearer ${token}` : '' },
     };
   }
})
};


const App: React.FC = () => {
  const { getToken } = useAuth();
  const urqlClient = createUrqlClient(getToken);

  return (
      <Provider value={urqlClient}>
        <RouterProvider router={router} />
       </Provider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App/>
    </AuthProvider>
  </React.StrictMode>
);
