import { createBrowserRouter, redirect } from "react-router-dom";
import { Home } from './pages/Home';
import SignIn from './pages/Signin';
import SignUp from './pages/Signup';
import Root from './pages/Root';
import { client } from './lib/api';

export const appRouter = createBrowserRouter([
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
            path: "",
            element: <Home />,
            loader: async () => {
              const token = localStorage.getItem('authToken');
              if (!token) {
                return redirect('/sign-in');
              }
              try {
                const userData = await client.call('membership/me', null, token);
                return { userData };
              } catch (error) {
                return redirect('/sign-in');
              }
            }
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
  }
], {
  basename: '/app'
}); 