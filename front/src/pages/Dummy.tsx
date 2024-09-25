import React, { useRef, useState, useCallback, useMemo, createContext, useContext, ReactNode } from "react";
import { useMutation, } from 'urql';

const dummyMutationQ = `
mutation ($a: Int!, $b: Int!) {
    dummy {
      add(a: $a, b: $b)
    }
  }
`;


function Dummy() {
  const aRef = useRef<HTMLInputElement>(null);
  const bRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<number | null>(null);
  const [dummyMutationResult, dummyMutation] = useMutation(dummyMutationQ);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const a = aRef.current?.valueAsNumber || 0;
    const b = bRef.current?.valueAsNumber || 0;

    const { data, error } = await dummyMutation({ a, b });

    if (data && data.dummy && data.dummy.add !== undefined) {
      setResult(data.dummy.add);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="a">Number A:</label>
          <input id="a" type="number" ref={aRef} />
        </div>
        <div>
          <label htmlFor="b">Number B:</label>
          <input id="b" type="number" ref={bRef} />
        </div>
        <button type="submit">Submit</button>
      </form>

      {result !== null && (
        <div>
          <h2>Result: {result}</h2>
        </div>
      )}
    </div>
  );
};

export default Dummy;

