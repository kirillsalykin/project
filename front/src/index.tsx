import React, { useRef, useState, useCallback, useMemo, createContext, useContext, ReactNode } from "react";
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Link,
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
import './main.css';

function Root() {
  return (<div>
    <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
    <div>
                  <Link to={`sign-up`}>Sign up</Link>
                  <Link to={`sign-in`}>Sign in</Link>
                  <Link to={`dummy`}>Dummy</Link>
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

type TokenFunction = () => string | null;

interface AuthContextType {
  signin: (token: string) => void;
  signout: () => void;
  getToken: TokenFunction;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    console.log("USE AUTH_PROVIDER")

  const [token, setToken] =  useState<string | null>(null);

  const signin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
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

 const value = { getToken, signin, signout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  console.log("USE AUTH")
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const createUrqlClient = (getToken: TokenFunction): Client => {
  console.log("CREATE URQL");
  return new Client({
   url: "http://localhost:8000/api",
   exchanges: [cacheExchange, fetchExchange],
   fetchOptions: () => {
     console.log("FETCH_OPTIONS");
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

  console.log("RENDER_APP")

  return (
      <Provider value={urqlClient}>
        <RouterProvider router={router} />
       </Provider>
  );
};


const App2: React.FC = () => {
return (    <AuthProvider>
      <App/>
    </AuthProvider>
);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // <React.StrictMode>
  <App2/>
  // </React.StrictMode>
);
