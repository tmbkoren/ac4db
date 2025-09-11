'use client';

import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from './actions';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  return (
    <Container size="xs" my={40}>
      <Title ta="center">Reset Password</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Enter your email to receive a password reset link.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form action={resetPassword}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            {message && <Alert color="green">{message}</Alert>}
            <TextInput
              label="Email"
              placeholder="you@example.com"
              name="email"
              required
              type="email"
            />
            <Button type="submit" fullWidth mt="xl">
              Send Reset Link
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
