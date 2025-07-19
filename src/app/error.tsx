'use client';

import { useEffect } from 'react';
import { Paper, Title, Text, Button, Container } from '@mantine/core';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container pt="xl">
      <Paper p="xl" withBorder>
        <Title order={3}>Something went wrong!</Title>
        <Text c="dimmed" mb="md">
          {error.message || 'An unexpected error occurred.'}
        </Text>
        <Button
          onClick={
            () => reset()
          }
        >
          Try again
        </Button>
      </Paper>
    </Container>
  );
}
