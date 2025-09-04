'use client';

import { Button, Paper, Stack, Text, Title, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { signOut, deleteUser } from './actions';
import SchematicGrid from '@/components/SchematicGrid';
import { User } from '@supabase/supabase-js';
import { Database } from '../../../database.types';

type Schematic = Database['public']['Tables']['schematics']['Row'];

interface ProfileClientProps {
  user: User;
  schematics: Schematic[];
}

export default function ProfileClient({
  user,
  schematics,
}: ProfileClientProps) {
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
