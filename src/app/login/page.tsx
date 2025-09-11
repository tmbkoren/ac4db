'use client';

import {
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Alert,
  Text,
  Flex,
} from '@mantine/core';
import {
  loginWithDiscord,
  loginWithEmail,
  resendVerificationEmail,
} from './actions';
import { useSearchParams } from 'next/navigation';
import LinkBtn from '@/components/LinkBtn/LinkBtn';
import { FaDiscord } from 'react-icons/fa';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const email = searchParams.get('email');

  return (
    <Stack
      style={{ marginTop: '2rem' }}
      align='center'
    >
      <Title
        order={2}
        style={{ marginBottom: '2rem', textAlign: 'center' }}
      >
        Sign in to your account
      </Title>
      <Stack style={{ width: '300px' }}>
        {error && error !== 'email_not_confirmed' && (
          <Alert
            color='red'
            title='Login Error'
          >
            {error}
          </Alert>
        )}
        {error === 'email_not_confirmed' && (
          <Alert
            color='orange'
            title='Email Not Confirmed'
          >
            <Text>
              Your email address has not been confirmed. Please check your inbox
              for a verification link.
            </Text>
            <form
              action={resendVerificationEmail}
              style={{ marginTop: '1rem' }}
            >
              <input
                type='hidden'
                name='email'
                value={email || ''}
              />
              <Button
                type='submit'
                variant='light'
                fullWidth
              >
                Resend verification email
              </Button>
            </form>
          </Alert>
        )}
        <form action={loginWithEmail}>
          <Stack>
            <TextInput
              required
              label='Email'
              name='email'
              placeholder='you@example.com'
              type='email'
              defaultValue={email || ''}
            />
            <PasswordInput
              required
              label='Password'
              name='password'
              placeholder='Your password'
            />
            <Button type='submit'>Sign in</Button>
          </Stack>
        </form>
        <Stack align='center'>
          <Flex gap={'md'}>
            <LinkBtn
              href='/signup'
              size='sm'
            >
              Sign up
            </LinkBtn>
            <LinkBtn
              href='/reset-password'
              size='sm'
            >
              Forgot Password?
            </LinkBtn>
          </Flex>
          <Text>Or</Text>
          <form
            action={loginWithDiscord}
            style={{ marginTop: '1rem' }}
          >
            <Button type='submit'><FaDiscord /><Text ml={5}>Sign in with Discord</Text></Button>
          </form>
        </Stack>
      </Stack>
    </Stack>
  );
}
