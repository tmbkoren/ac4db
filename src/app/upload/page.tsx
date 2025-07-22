'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container,
  Stack,
  Textarea,
  Button,
  Group,
  Text,
  Title,
  LoadingOverlay,
  Alert,
  Accordion,
  Anchor,
  Code,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import { sendSchematic } from '@/app/upload/actions';
import Image from 'next/image';
import { notifications } from '@mantine/notifications';
import { Buffer } from 'buffer';

import { parseSchematicHeader } from '@/utils/lib/parseAc4a';

export default function PrivatePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [schematicFile, setSchematicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schematicName, setSchematicName] = useState<string | null>(null);
  const [designerName, setDesignerName] = useState<string | null>(null);

  const imageInputRef = useRef<() => void>(null);
  const schematicInputRef = useRef<() => void>(null);

  const handleImageDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setImageFile(files[0]);
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
    }
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items || []).find((i) =>
        i.type.startsWith('image/')
      );
      if (item) {
        const file = item.getAsFile();
        if (file) {
          handleImageDrop([file]);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleImageDrop]);

  const handleSchematicDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setSchematicFile(files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const buffer = Buffer.from(event.target.result as ArrayBuffer);
          const { name, designer } = parseSchematicHeader(buffer);
          setSchematicName(name);
          setDesignerName(designer);
        }
      };
      reader.readAsArrayBuffer(files[0]);
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!schematicFile) {
        setError('A schematic file is required.');
        return;
      }

      setLoading(true);
      setError(null);

      const formData = new FormData(event.currentTarget);
      if (imageFile) formData.set('image', imageFile);
      if (schematicFile) formData.set('schematic', schematicFile);

      try {
        await sendSchematic(formData);
        notifications.show({
          title: 'Upload Successful',
          message: 'Your schematic has been uploaded and is being processed.',
          color: 'green',
        });
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        notifications.show({
          title: 'Upload Failed',
          message: errorMessage,
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    },
    [imageFile, schematicFile]
  );

  return (
    <Container
      size='md'
      style={{ marginTop: '2rem', position: 'relative' }}
    >
      <LoadingOverlay
        visible={loading}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Title
        order={2}
        style={{ marginBottom: '2rem', textAlign: 'center' }}
      >
        Upload Your ACFA schematic
      </Title>

      <Accordion style={{ marginBottom: '2rem' }}>
        <Accordion.Item value='instructions'>
          <Accordion.Control>
            How to get your .ac4a schematic file
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Text>
                To get your schematic file, you need to use the ACFA Schematic
                Tool, a standalone desktop application. You can download it from
                <Anchor
                  href='https://github.com/tmbkoren/ACFA_Schematic_Tool/releases/latest'
                  style={{ marginLeft: '5px' }}
                  rel='noopener noreferrer'
                >
                  Github
                </Anchor>
                .
              </Text>
              <Text>
                1. Place the .exe file in your `PCFA` folder, next to
                your `EMULATOR` folder.
              </Text>
              <Code block>
                -- PCFA/
                <br />
                ---- ACFA_Schematic_Tool.exe
                <br />
                ---- EMULATOR/
              </Code>
              <Text>
                2. Run the tool to extract the schematic file; if you put the
                .exe file correctly, it should automatically detect your
                schematics.
                <br />
                Otherwise, select or drag-and-drop your DESDOC.DAT file, which
                is located in <br />
                <i>
                  EMULATOR/dev_hdd0/home/00000001/savedata/BLUS30187ASSMBLY064
                </i>
              </Text>
              <Text>
                3. Select the desired schematic and press{' '}
                <b>Export to .ac4a</b>
              </Text>
              <Text>
                4. Once extracted, upload the <b>.ac4a</b> file here.
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <form onSubmit={handleSubmit}>
        <Stack style={{ marginTop: '1rem' }}>
          {error && (
            <Alert
              title='Upload Error'
              color='red'
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Dropzone
            onDrop={handleImageDrop}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={5 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
            openRef={imageInputRef}
          >
            <Group
              justify='center'
              gap='xl'
              mih={220}
              style={{ pointerEvents: 'none' }}
            >
              <Dropzone.Accept>
                <FiUpload size='3.2rem' />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <FiX size='3.2rem' />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <FiImage size='3.2rem' />
              </Dropzone.Idle>

              <div>
                <Text
                  size='xl'
                  inline
                >
                  Drag an image here or click to select a file
                </Text>
                <Text
                  size='sm'
                  c='dimmed'
                  inline
                  mt={7}
                >
                  Attach a screenshot of your AC. Pasting from the clipboard is
                  also supported.
                </Text>
              </div>
            </Group>
          </Dropzone>
          {previewUrl && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Image
                src={previewUrl}
                alt='Pasted Screenshot Preview'
                width={400}
                height={225}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </div>
          )}

          <Dropzone
            onDrop={handleSchematicDrop}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={1 * 1024 ** 2} // 1MB limit for schematic
            accept={{ 'application/octet-stream': ['.ac4a'] }}
            openRef={schematicInputRef}
          >
            <Group
              justify='center'
              gap='xl'
              mih={100}
              style={{ pointerEvents: 'none' }}
            >
              <Dropzone.Accept>
                <FiUpload size='3.2rem' />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <FiX size='3.2rem' />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <FiUpload size='3.2rem' />
              </Dropzone.Idle>
              <div>
                <Text
                  size='xl'
                  inline
                >
                  Drag your .ac4a file here or click to select
                </Text>
                {schematicFile && (
                  <Text
                    size='sm'
                    c='dimmed'
                    mt={7}
                  >
                    Selected: {schematicFile.name}
                  </Text>
                )}
              </div>
            </Group>
          </Dropzone>

          {schematicName && designerName && (
            <Stack gap="xs" style={{ marginTop: '1rem' }}>
              <Text><strong>Schematic:</strong> {schematicName}</Text>
              <Text><strong>Designer:</strong> {designerName}</Text>
            </Stack>
          )}

          <Textarea
            label='Description (optional)'
            name='description'
            autosize
            minRows={2}
            maxRows={4}
          />
          <Button
            type='submit'
            loading={loading}
          >
            Upload
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
