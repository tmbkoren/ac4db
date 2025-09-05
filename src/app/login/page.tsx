'use client';

import {
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Alert,
  Text,
} from '@mantine/core';
import {
  loginWithDiscord,
  loginWithEmail,
  resendVerificationEmail,
} from './actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const email = searchParams.get('email');

  return (
    <Stack style={{ marginTop: '2rem' }} align="center">
      <Title order={2} style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Login
      </Title>
      <Stack style={{ width: '300px' }}>
        {error && error !== 'email_not_confirmed' && (
          <Alert color="red" title="Login Error">
            {error}
          </Alert>
        )}
        {error === 'email_not_confirmed' && (
          <Alert color="orange" title="Email Not Confirmed">
            <Text>
              Your email address has not been confirmed. Please check your
              inbox for a verification link.
            </Text>
            <form action={resendVerificationEmail} style={{ marginTop: '1rem' }}>
              <input type="hidden" name="email" value={email || ''} />
              <Button type="submit" variant="light" fullWidth>
                Resend verification email
              </Button>
            </form>
          </Alert>
        )}
        <form action={loginWithEmail}>
          <Stack>
            <TextInput
              required
              label="Email"
              name="email"
              placeholder="you@example.com"
              type="email"
              defaultValue={email || ''}
            />
            <PasswordInput
              required
              label="Password"
              name="password"
              placeholder="Your password"
            />
            <Button type="submit">Login</Button>
            <Button component={Link} href="/signup" variant="outline">
              Sign up
            </Button>
          </Stack>
        </form>
        <form action={loginWithDiscord} style={{ marginTop: '1rem' }}>
          <Button type="submit">Login with Discord</Button>
        </form>
      </Stack>
    </Stack>
  );
}
