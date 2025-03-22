import { useAuth } from '../components/Auth';
import { AuthenticatedResponse, SignUpInput } from '../types/api';
import { api } from '../services/api';
import { Card, CardHeader, CardBody, CardFooter, Link } from '../components/UIComponents';
import { Form, FormInput, useFormWithApi, FormContainer } from '../components/FormComponents';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validation } from '../utils/validation';

interface SignInFormValues {
  email: string;
  password: string;
}

const SignIn = () => {
  const { signin } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromUrl = searchParams.get('email');

  // Handle successful signin
  const handleSignInSuccess = (data: AuthenticatedResponse) => {
    // TypeScript guarantees token exists per the type definition
    signin(data.token);
    navigate('/');
  };

  // Create form with API integration
  const { 
    register,
    handleSubmit,
    formState: { errors },
    isSubmitting,
    globalError
  } = useFormWithApi<SignInFormValues, AuthenticatedResponse>(
    // API method to call
    (data) => api.post<AuthenticatedResponse>('/membership/sign-in', {
      email: data.email,
      password: data.password
    } as SignUpInput),
    // Success handler
    handleSignInSuccess,
    // Default values
    emailFromUrl ? { email: emailFromUrl } : undefined
  );

  return (
    <FormContainer>
      <Card>
        <CardHeader title="Sign in to your account" />
        <CardBody>
          <Form
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            globalError={globalError}
            submitText="Sign in"
          >
            <FormInput
              label="Email address"
              id="email"
              type="email"
              placeholder="kirill.salykin@gmail.com"
              register={register}
              error={errors.email}
              required
              validation={validation.email}
            />
            
            <FormInput
              label="Password"
              id="password"
              type="password"
              register={register}
              error={errors.password}
              required
              validation={validation.password}
            />
          </Form>
        </CardBody>
        
        <CardFooter>
          <p>
            Don't have an account?{' '}
            <Link to="/sign-up">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </FormContainer>
  );
};

export default SignIn;