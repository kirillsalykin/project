import { useAuth } from '../components/Auth';
import { Card, CardHeader, CardBody } from '../components/UIComponents';

const Home = () => {
  const { getToken } = useAuth();
  const token = getToken();

  return (
    <div className="max-w-3xl mx-auto w-full">
      <Card>
        <CardHeader title="Home" />
        <CardBody>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Current Session Token</h2>
              <p className="mt-2 text-sm text-gray-500 break-all font-mono">{token}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Home; 