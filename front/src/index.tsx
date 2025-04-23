import React from "react";
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  redirect
} from "react-router-dom";

import { AuthProvider } from './components/Auth';

import Root from './pages/Root';
import SignUp from './pages/Signup';
import SignIn from './pages/Signin';
import { Home } from './pages/Home';

import './index.css';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        // Parent route for all protected pages
        loader: async () => {
          const token = localStorage.getItem('authToken');
          if (!token) {
            return redirect('/sign-in');
          }
          return null;
        },
        children: [
          {
            path: "/",
            element: <Home />,
          },
          // Add other protected routes here
        ]
      },
      // Public routes
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "sign-up",
        element: <SignUp />,
      }
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
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