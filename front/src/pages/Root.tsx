import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../components/Auth";
import { Button, ButtonLink, Link, Alert } from "../components/UIComponents";

export default function Root() {
  const { getToken, signout } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!getToken();

  const handleSignOut = () => {
    signout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-primary">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.12C6.23 17.78 5.96 17.28 5.96 16.76C5.96 14.97 7.39 13.5 9.13 13.5H14.88C16.61 13.5 18.04 14.97 18.04 16.76C18.04 17.28 17.77 17.78 17.34 18.12C15.9 19.33 14.03 20 12 20Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Auth Demo
              </span>
            </div>
            
            <div className="flex items-center">
              {isAuthenticated ? (
                <Button
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/sign-in">Sign In</Link>
                  <ButtonLink to="/sign-up">Sign Up</ButtonLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {!isAuthenticated && (
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to the Auth Demo
              </h1>
              <p className="text-sm text-gray-500">
                Please sign in or create an account to continue
              </p>
            </div>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
}