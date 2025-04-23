import { createBrowserRouter, createMemoryRouter } from "react-router-dom";
import Landing from './pages/Landing';
import About from './pages/About';

export const routes = [
  {
    path: "/",
    element: <Landing />,
    title: "Home | Your Site Name"
  },
  {
    path: "/about",
    element: <About />,
    title: "About | Your Site Name"
  },
];

// Use createMemoryRouter for server-side rendering and createBrowserRouter for client-side
export const siteRouter = typeof window === 'undefined'
  ? createMemoryRouter(routes)
  : createBrowserRouter(routes); 