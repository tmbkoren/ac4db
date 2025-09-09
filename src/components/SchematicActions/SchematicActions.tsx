'use client';

import { Button, Text, Modal, Stack } from '@mantine/core';
import LinkBtn from '@/components/LinkBtn/LinkBtn';
import { useState } from 'react';

export default function SchematicActions({
  schematicId,
}: {
  schematicId: string;
}) {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(schematicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title='How to use?'
      >
        {/* Placeholder for the guide */}
        <Text>
          This is a placeholder for the guide on how to use the schematic.
        </Text>
      </Modal>

      <Stack
        justify='space-around'
        align='center'
        gap='md'
      >
        <LinkBtn href={`/api/schematics/${schematicId}/download`}>
          Download schematic
        </LinkBtn>
        <Button
          onClick={handleCopy}
          variant='outline'
        >
          {copied ? 'Copied!' : 'Copy Schematic ID'}
        </Button>
        <Text
          mt='sm'
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => setOpened(true)}
        >
          How to use?
        </Text>
      </Stack>
    </>
  );
}
