import { useAuth } from '../components/Auth';
import { Card, CardHeader, CardBody, CardFooter, Link } from '../../shared/components';
import { Form, FormInput, FormContainer } from '../components/FormComponents';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Procedures } from '../bindings';
import { useProcedure } from '../lib/api';

type SignUpFormValues = Procedures['membership/sign-up']['input'];

const SignUp = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>();

  const { mutate: signUp, isPending } = useProcedure('membership/sign-up', {
    onSuccess: (data) => {
      signin(data.token);
      navigate('/');
    }
  });

  const onSubmit = handleSubmit((data) => {
    signUp(data);
  });

  return (
    <FormContainer>
      <Card>
        <CardHeader title="Create a new account" />
        <CardBody>
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