import { useAuth } from '../components/Auth';
import { AuthenticatedResponse, SignUpInput } from '../types/api';
import { api } from '../services/api';
import { Card, CardHeader, CardBody, CardFooter, Link } from '../components/UIComponents';
import { Form, FormInput, useFormWithApi, FormContainer } from '../components/FormComponents';
import { useNavigate } from 'react-router-dom';
import { validation } from '../utils/validation';

interface SignUpFormValues {
  email: string;
  password: string;
}

const SignUp = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();

  // Success handler
  const handleSignUpSuccess = (data: AuthenticatedResponse) => {
    // TypeScript guarantees token exists per the type definition
    signin(data.token);
    navigate('/');
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    isSubmitting,
    globalError
  } = useFormWithApi<SignUpFormValues, AuthenticatedResponse>(
    // API method to call
    (data) => api.post<AuthenticatedResponse>('/membership/sign-up', {
      email: data.email,
      password: data.password
    } as SignUpInput),
    // Success handler
    handleSignUpSuccess,
    undefined,
    (error, formData) => {
      if (error.code === 'already_exists') {
        return {
          ...error,
          action: {
            label: 'Sign in instead',
            to: `/sign-in?email=${encodeURIComponent(formData.email)}`
          }
        };
      }
      return error;
    }
  );

  return (
    <FormContainer>
      <Card>
        <CardHeader title="Create a new account" />
        <CardBody>
          <Form
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            globalError={globalError}
            submitText="Create account"
          >
            <FormInput
              id="email"
              label="Email address"
              type="email"
              placeholder="kirill.salykin@gmail.com"
              register={register}
              error={errors.email}
              required
              validation={validation.email}
            />
            <FormInput
              id="password"
              label="Password"
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
            Already have an account?{' '}
            <Link to="/sign-in">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </FormContainer>
  );
};

export default SignUp;