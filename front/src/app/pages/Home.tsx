import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/Auth';
import { useQuery } from '../lib/api';

export const Home = () => {
  const { signout } = useAuth();
  const navigate = useNavigate();
  const { data: userData, isLoading } = useQuery('membership/me');

  const handleSignOut = () => {
    signout();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                {isLoading ? (
                  <div className="space-y-2">
                    <p>Loading...</p>
                  </div>
                ) : !userData ? (
                  <div className="space-y-2">
                    <p>Error loading user data</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
                      <p><span className="font-medium">Email:</span> {userData.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 