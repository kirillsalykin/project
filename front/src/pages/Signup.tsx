import { useState, FormEvent } from "react";
import { useAuth } from '../components/auth';
import { authService } from '../services/api';
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Alert, Link, Form } from '../components/UIComponents';
import { layoutStyles } from '../styles';

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signin } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.authenticate(email);
      
      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        signin(result.token);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={layoutStyles.formContainer}>
      <Card>
        <CardHeader title="Create a new account" />
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Input
              label="Email address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kirill.salykin@gmail.com"
              required
            />
            
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button 
              type="submit" 
              isLoading={isLoading}
            >
              Create account
            </Button>
            
            {error && <Alert type="error" message={error} />}
            
            <Alert 
              type="info" 
              message="For this demo, only kirill.salykin@gmail.com will work."
            />
          </Form>
        </CardBody>
        
        <CardFooter>
          <p>
            Already have an account?{' '}
            <Link to="/sign-in">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;