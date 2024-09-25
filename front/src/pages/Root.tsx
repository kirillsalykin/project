import { Link, Outlet } from "react-router-dom";

export default function Root() {
  return (<div>
    <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
    <div>
                  <Link to={`sign-up`}>Sign up</Link>
                  <Link to={`sign-in`}>Sign in</Link>
                  <Link to={`dummy`}>Dummy</Link>
    </div>
    ROOT
    <Outlet />
  </div>)
};

