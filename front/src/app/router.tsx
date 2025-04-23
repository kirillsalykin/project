import { createBrowserRouter, redirect } from "react-router-dom";
import { Home } from './pages/Home';
import SignIn from './pages/Signin';
import SignUp from './pages/Signup';
import Root from './pages/Root';

export const appRouter = createBrowserRouter([
  {
    path: "/app",
    element: <Root />,
    children: [
      {
        // Parent route for all protected pages
        loader: async () => {
          const token = localStorage.getItem('authToken');
          if (!token) {
            return redirect('/app/sign-in');
          }
          return null;
        },
        children: [
          {
            path: "",
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