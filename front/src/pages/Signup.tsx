import { useAuth } from '../components/Auth';
import { Card, CardHeader, CardBody, CardFooter, Link } from '../components/UIComponents';
import { Form, FormInput, FormContainer } from '../components/FormComponents';
import { useNavigate } from 'react-router-dom';
import { validation } from '../utils/validation';
import { useProcedure } from '../lib/api';
import { useForm } from 'react-hook-form';
import { GlobalError } from '../components/GlobalError';

interface SignUpFormValues {
  email: string;
  password: string;
}

const SignUp = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<SignUpFormValues>();

  const { mutate: signUp, isPending, error } = useProcedure('sign_up', {
    onSuccess: (data) => {
      signin(data.token);
      navigate('/');
    },
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
            globalError={null}
            submitText="Create account"
          >
            <GlobalError error={error} />
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