'use client';

import {
  Container,
  Stack,
  TextInput,
  Button,
  Title,
  Alert,
} from '@mantine/core';
import { updateProfile } from './actions';
import { useSearchParams } from 'next/navigation';

export default function CompleteProfilePage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <Container size="xs" style={{ marginTop: '2rem' }}>
      <Title order={2} style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Complete Your Profile
      </Title>
      <form action={updateProfile}>
        <Stack>
          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}
          <TextInput
            required
            label="Username"
            name="username"
            placeholder="Your username"
          />
          <Button type="submit">Save</Button>
        </Stack>
      </form>
    </Container>
  );
}
