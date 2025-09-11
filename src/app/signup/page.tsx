'use client';

import { 
  Container, 
  Stack, 
  TextInput, 
  PasswordInput, 
  Button, 
  Title, 
  Alert 
} from '@mantine/core';
import { signup } from './actions';
import { useSearchParams } from 'next/navigation';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <Container
      size='xs'
      style={{ marginTop: '2rem' }}
    >
      <Title
        order={2}
        style={{ marginBottom: '2rem', textAlign: 'center' }}
      >
        Create an Account
      </Title>
      <form action={signup}>
        <Stack>
          {error && (
            <Alert
              color='red'
              title='Signup Error'
            >
              {error}
            </Alert>
          )}
          <TextInput
            required
            label='Email'
            name='email'
            placeholder='you@example.com'
            type='email'
          />
          <PasswordInput
            required
            label='Password'
            name='password'
            placeholder='Your password'
          />
          <PasswordInput
            required
            label='Confirm Password'
            name='confirm_password'
            placeholder='Your password'
          />
          <Button type='submit'>Sign up</Button>
        </Stack>
      </form>
    </Container>
  );
}
