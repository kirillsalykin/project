import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth';
import { useProcedure } from '../lib/api';
import { Procedures } from '../bindings';

type UserData = Procedures['membership/me']['output'];

export const Home = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { signout } = useAuth();
  const navigate = useNavigate();

  const { mutate: fetchMe } = useProcedure('membership/me', {
    onSuccess: (data) => {
      setUserData(data);
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchMe(null);
  }, [fetchMe]);

  const handleSignOut = () => {
    signout();
    navigate('/sign-in');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {userData?.email}</p>
                  <p><span className="font-medium">ID:</span> {userData?.id}</p>
                  {/* Add other user data fields as needed */}
                </div>
                <button
                  onClick={handleSignOut}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 