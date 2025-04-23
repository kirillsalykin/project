import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { siteRouter } from './router';
import '../index.css';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <RouterProvider router={siteRouter} />
    </React.StrictMode>
  );
}

// Export for static generation
export { siteRouter }; 