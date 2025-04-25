import { useAuth } from '../hooks/Auth';
import { Card, CardHeader, CardBody, CardFooter, Link, Alert } from '../../shared/components';
import { Form, FormInput, FormContainer } from '../components/FormComponents';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Procedures, ApiError } from '../bindings';
import { useMutation } from '../lib/api';
import { useFormError } from '../hooks/useFormError';

type SignInFormValues = Procedures['membership/sign-in']['input'];

const SignIn = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const { globalError, handleError } = useFormError<SignInFormValues>();

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>();

  const { mutate: signIn, isPending } = useMutation('membership/sign-in');

  const onSubmit = handleSubmit((data) => {
    signIn(data, {
      onSuccess: (response) => {
        signin(response.token);
        navigate('/');
      },
      onError: (error: ApiError) => {
        handleError(error);
      }
    });
  });

  return (
    <FormContainer>
      <Card>
        <CardHeader title="Sign in to your account" />
        <CardBody>
          {globalError && (
            <Alert type="error" message={globalError} className="mb-4" />
          )}
          <Form
            onSubmit={onSubmit}
            isSubmitting={isPending}
            submitText="Sign in"
          >
            <FormInput
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              register={register}
              error={errors.email}
              required
            />
            <FormInput
              id="password"
              label="Password"
              type="password"
              register={register}
              error={errors.password}
              required
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