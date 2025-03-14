import { useAuth } from '../components/auth';
import { authService, AuthResult } from '../services/api';
import { Card, CardHeader, CardBody, CardFooter, Link } from '../components/UIComponents';
import { Form, FormInput, useApiForm, FormContainer } from '../components/FormComponents';

interface SignUpFormValues {
  email: string;
  password: string;
}

const SignUp = () => {
  const { signin } = useAuth();

  // Handle successful signup
  const handleSignUpSuccess = (data: any, result: AuthResult) => {
    if (result.token) {
      signin(result.token);
    }
  };

  // Create form with API integration
  const { 
    methods, 
    isSubmitting, 
    globalError, 
    handleSubmit 
  } = useApiForm<SignUpFormValues, any>(
    // API method to call
    (data) => authService.signUp(data.email, data.password),
    // Success handler
    handleSignUpSuccess
  );

  // Get form functions
  const { register, formState: { errors } } = methods;

  return (
    <FormContainer>
      <Card>
        <CardHeader title="Create a new account" />
        <CardBody>
          <Form
            methods={methods}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            globalError={globalError}
            submitText="Create account"
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
              validation={{
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              }}
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
    </FormContainer>
  );
};

export default SignUp;