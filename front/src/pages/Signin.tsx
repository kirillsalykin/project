import { useAuth } from '../components/auth';
import { AuthenticatedResponse, SignUpInput } from '../types/api';
import { api } from '../services/api';
import { Card, CardHeader, CardBody, CardFooter, Link } from '../components/UIComponents';
import { Form, FormInput, useFormWithApi, FormContainer } from '../components/FormComponents';

interface SignInFormValues {
  email: string;
  password: string;
}

const SignIn = () => {
  const { signin } = useAuth();

  // Handle successful signin
  const handleSignInSuccess = (data: AuthenticatedResponse) => {
    // TypeScript guarantees token exists per the type definition
    signin(data.token);
  };

  // Create form with API integration
  const { 
    methods, 
    isSubmitting, 
    globalError, 
    handleSubmit 
  } = useFormWithApi<SignInFormValues, AuthenticatedResponse>(
    // API method to call
    (data) => api.post<AuthenticatedResponse>('/membership/sign-in', {
      email: data.email,
      password: data.password
    } as SignUpInput),
    // Success handler
    handleSignInSuccess
  );

  // Get form functions
  const { register, formState: { errors } } = methods;

  return (
    <FormContainer>
      <Card>
        <CardHeader title="Sign in to your account" />
        <CardBody>
          <Form
            methods={methods}
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
              required
              register={register}
              error={errors.email}
              validation={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
            />
            
            <FormInput
              label="Password"
              id="password"
              type="password"
              required
              register={register}
              error={errors.password}
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