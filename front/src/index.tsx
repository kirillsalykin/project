import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { Client, Provider, cacheExchange, fetchExchange } from 'urql';

const client = new Client({
  url: "http://localhost:8000/api",
  exchanges: [cacheExchange, fetchExchange],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>
);
