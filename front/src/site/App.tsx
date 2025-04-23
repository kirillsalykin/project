import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { siteRouter } from './router';

export default function App() {
  return <RouterProvider router={siteRouter} />;
} 