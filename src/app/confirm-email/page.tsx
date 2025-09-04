
import { Container, Title, Text } from '@mantine/core';

export default function ConfirmEmailPage() {
  return (
    <Container size="xs" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <Title order={2}>Check your email</Title>
      <Text mt="md">
        We've sent a verification link to your email address. Please click the link to complete your registration.
      </Text>
    </Container>
  );
}
