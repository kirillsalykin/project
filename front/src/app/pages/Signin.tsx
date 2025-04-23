import { useAuth } from '../components/Auth';
import { Card, CardHeader, CardBody, CardFooter, Link } from '../../shared/components/UIComponents';
import { Form, FormInput, FormContainer } from '../components/FormComponents';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Procedures } from '../bindings';
import { useProcedure } from '../lib/api';

type SignInFormValues = Procedures['sign_in']['input'];

const SignIn = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>();

  const { mutate: signIn, isPending } = useProcedure('signIn', {
    onSuccess: (data) => {
      signin(data.token);
      navigate('/app');
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
              placeholder="kirill.salykin@gmail.com"
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
            <Link to="/app/sign-up">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </FormContainer>
  );
};

export default SignIn;