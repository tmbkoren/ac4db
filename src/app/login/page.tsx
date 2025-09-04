'use client';

import { 
  Stack, 
  TextInput, 
  PasswordInput, 
  Button, 
  Title, 
  Alert,
} from '@mantine/core';
import { loginWithDiscord, loginWithEmail } from './actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <Stack
      style={{ marginTop: '2rem' }}
      align='center'
    >
      <Title
        order={2}
        style={{ marginBottom: '2rem', textAlign: 'center' }}
      >
        Login
      </Title>
      <form>
        <Stack style={{ width: '300px' }}>
          {error && (
            <Alert
              color='red'
              title='Login Error'
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
          <Button
            type='submit'
            formAction={loginWithEmail}
          >
            Login
          </Button>
          <Button
            component={Link}
            href='/signup'
            variant='outline'
          >
            Sign up
          </Button>
        </Stack>
      </form>
      <form>
        <Button
          type='submit'
          formAction={loginWithDiscord}
        >
          Login with Discord
        </Button>
      </form>
    </Stack>
  );
}
