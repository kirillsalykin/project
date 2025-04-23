import { createBrowserRouter } from "react-router-dom";
import Landing from './pages/Landing';
import About from './pages/About';

export const siteRouter = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/about",
    element: <About />,
  },
]); 