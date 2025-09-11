'use client';

import { Button, Text, Modal, Stack, Anchor, Code } from '@mantine/core';
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
          To use the schematic you need to download the{' '}
          <Anchor
            href='https://github.com/tmbkoren/ACFA_Schematic_Tool/releases/latest'
            target='_blank'
            rel='noopener noreferrer'
          >
            {' '}
            ACFA Schematic Tool
          </Anchor>
          .
        </Text>
        <br />
        <Text>
          1. Place the .exe file in your `PCFA` folder, next to your `EMULATOR`
          folder.
        </Text>
        <Code block>
          -- PCFA/
          <br />
          ---- ACFA_Schematic_Tool.exe
          <br />
          ---- EMULATOR/
        </Code>
        <br />
        <Text>
          2. Run the tool, it should automatically detect your schematic data.
          <br />
          Otherwise, select or drag-and-drop your DESDOC.DAT file, which is
          located in <br />
          <i>EMULATOR/dev_hdd0/home/00000001/savedata<br />/BLUS30187ASSMBLY064</i>
        </Text>
        <br />
        <Text>
          3. If you downloaded the schematic, press <b>Import from .ac4a</b> in the tool and select the .ac4a file.
        </Text>
        <br />
        <Text>
          Otherwise, copy the schematic ID above and press <b>Import from ac4db</b> in the tool.
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
