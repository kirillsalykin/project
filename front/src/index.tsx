import React from "react";
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

import { AuthProvider, TokenFunction, useAuth } from './components/auth';

import Root from './pages/Root';
import SignUp from './pages/Signup';
import SignIn from './pages/Signin';
import Dummy from './pages/Dummy';

import './index.css';
import './main.css';


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
