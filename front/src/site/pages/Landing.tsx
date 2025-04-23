import { Card, CardHeader, CardBody } from '../../shared/components/UIComponents';

export default function Landing() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader title="Welcome to Our App" />
        <CardBody>
          <p className="text-lg mb-4">
            This is a static landing page that will be pre-rendered during build time.
          </p>
          <p className="text-lg">
            During development, it will be served as a regular React app.
          </p>
        </CardBody>
      </Card>
    </div>
  );
} 