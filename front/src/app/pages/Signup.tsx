import { useAuth } from '../hooks/Auth';
import { Card, CardHeader, CardBody, CardFooter, Link, Alert } from '../../shared/components';
import { Form, FormInput, FormContainer } from '../components/FormComponents';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Procedures, ApiError } from '../bindings';
import { useMutation } from '../lib/api';
import { useFormError } from '../hooks/useFormError';

type SignUpFormValues = Procedures['membership/sign-up']['input'];

const SignUp = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const { globalError, handleError } = useFormError<SignUpFormValues>();

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>();

  const { mutate: signUp, isPending } = useMutation('membership/sign-up');

  const onSubmit = handleSubmit((data) => {
    signUp(data, {
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
        <CardHeader title="Create a new account" />
        <CardBody>
          {globalError && (
            <Alert type="error" message={globalError} className="mb-4" />
          )}
          <Form
            onSubmit={onSubmit}
            isSubmitting={isPending}
            submitText="Create account"
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
            Already have an account?{' '}
            <Link to="/sign-in">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </FormContainer>
  );
};

export default SignUp;