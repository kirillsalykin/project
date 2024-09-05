import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useQuery } from 'urql';

const DUMMY_QUERY = `
query {
  dummy {
    add(a: 5, b: 10)
  }
}
`
function App() {
   const [result, reexecuteQuery] = useQuery({
    query: DUMMY_QUERY,
  });

  const { data, fetching, error } = result;

  console.log("data", data);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
        {data.dummy.add}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
