'use client';

import {
  Alert,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { updatePassword } from './actions';

export default function UpdatePasswordPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  return (
    <Container size="xs" my={40}>
      <Title ta="center">Update Password</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Enter your new password below.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form action={updatePassword}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            {message && <Alert color="green">{message}</Alert>}
            <PasswordInput
              label="New Password"
              placeholder="Your new password"
              name="password"
              required
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              name="confirmPassword"
              required
            />
            <Button type="submit" fullWidth mt="xl">
              Update Password
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
