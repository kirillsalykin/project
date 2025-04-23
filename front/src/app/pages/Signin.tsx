import { useAuth } from '../components/Auth';
import { Card, CardHeader, CardBody, CardFooter, Link } from '../../shared/components';
import { Form, FormInput, FormContainer } from '../components/FormComponents';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Procedures } from '../bindings';
import { useProcedure } from '../lib/api';

type SignInFormValues = Procedures['membership/sign-in']['input'];

const SignIn = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>();

  const { mutate: signIn, isPending } = useProcedure('membership/sign-in', {
    onSuccess: (data) => {
      signin(data.token);
      navigate('/');
    }
  });

  const onSubmit = handleSubmit((data) => {
    signIn(data);
  });

  return (
    <FormContainer>
      <Card>
        <CardHeader title="Sign in to your account" />
        <CardBody>
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