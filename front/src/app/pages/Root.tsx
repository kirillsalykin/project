import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../components/Auth";
import { Button, Link } from "../../shared/components";

export default function Root() {
  const { getToken, signout } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!getToken();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/app" className="text-xl font-bold text-gray-900">
                  App
                </Link>
              </div>
            </div>
            {isAuthenticated && (
              <div className="flex items-center">
                <Button
                  variant="secondary"
                  onClick={() => {
                    signout();
                    navigate("/app/sign-in");
                  }}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}