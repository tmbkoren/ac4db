'use client';

import { Button, Paper, Stack, Text, Title, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { signOut, deleteUser } from './actions';
import SchematicGrid from '@/components/SchematicGrid';

export default function ProfileClient({ user, schematics }) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Confirm Account Deletion">
        <Text>
          Are you sure you want to delete your account? This action is
          irreversible and all your data will be lost.
        </Text>
        <form action={deleteUser}>
          <Button type="submit" color="red" mt="md" fullWidth>
            Yes, delete my account
          </Button>
        </form>
        <Button onClick={close} variant="default" mt="sm" fullWidth>
          Cancel
        </Button>
      </Modal>

      <Stack>
        <Paper p="md" shadow="xs">
          <Title order={2}>Profile</Title>
          <Text>Email: {user.email}</Text>
          <Text>Joined: {new Date(user.created_at).toLocaleDateString()}</Text>
          <form action={signOut}>
            <Button type="submit" mt="md">
              Logout
            </Button>
          </form>
          <Button onClick={open} mt="md" color="red">
            Delete Account
          </Button>
        </Paper>
        <SchematicGrid schematics={schematics || []} />
      </Stack>
    </>
  );
}
