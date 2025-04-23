import { createBrowserRouter, createMemoryRouter } from "react-router-dom";
import Landing from './pages/Landing';
import About from './pages/About';

export const routes = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/about",
    element: <About />,
  },
];

// Use createMemoryRouter for server-side rendering and createBrowserRouter for client-side
export const siteRouter = typeof window === 'undefined'
  ? createMemoryRouter(routes)
  : createBrowserRouter(routes); 