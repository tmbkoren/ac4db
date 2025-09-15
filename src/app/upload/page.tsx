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
  Select,
  Checkbox,
  Flex,
  Paper,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import { sendSchematic } from '@/app/upload/actions';
import Image from 'next/image';
import { notifications } from '@mantine/notifications';
import { Buffer } from 'buffer';
import { getRegulations } from '@/app/actions';
import { parseSchematicHeader } from '@/utils/lib/parseAc4a';
import { Regulation } from '@/utils/types/global.types';



const usageTypes = ['PvP', 'PvE', 'Meme'];

export default function UploadPage() {
  // --- Component State ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [schematicFile, setSchematicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schematicName, setSchematicName] = useState<string | null>(null);
  const [designerName, setDesignerName] = useState<string | null>(null);

  // --- Fetched Data State ---
  const [regulations, setRegulations] = useState<Regulation[]>([]);

  // --- Form State ---
  const [selectedRegulationFamily, setSelectedRegulationFamily] = useState<string | null>('1.99');
  const [selectedRegulationId, setSelectedRegulationId] = useState<string | null>(null);
  const [usage, setUsage] = useState<string[]>(['PvP']);

  // --- Refs ---
  const imageInputRef = useRef<() => void>(null);
  const schematicInputRef = useRef<() => void>(null);

  // --- Data Fetching ---
  useEffect(() => {
    async function fetchRegulations() {
      const regs = await getRegulations();
      setRegulations(regs);

      // Set default regulation to the latest one (highest sort_order)
      if (regs.length > 0) {
        const latest199 = regs
          .filter((r) => r.family === '1.99')
          .sort((a, b) => b.sort_order - a.sort_order)[0];
        if (latest199) {
          setSelectedRegulationId(latest199.id);
        }
      }
    }
    fetchRegulations();
  }, []);

  // --- Derived data for UI ---
  const regulationFamilies = regulations
    .map((r) => r.family)
    .filter((value, index, self) => self.indexOf(value) === index)
    .map((family) => ({ value: family, label: family }));

  const regulationVersions = regulations
    .filter((r) => r.family === selectedRegulationFamily)
    .map((r) => ({ value: r.id, label: r.name }));

  // --- Event Handlers ---
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

  const handleRegulationFamilyChange = (family: string | null) => {
    setSelectedRegulationFamily(family);
    // If family changes, reset the specific version unless it's 1.99
    if (family !== '1.99') {
      const reg = regulations.find(r => r.family === family);
      setSelectedRegulationId(reg ? reg.id : null);
    } else {
      // Default to latest 1.99
      const latest199 = regulations
        .filter((r) => r.family === '1.99')
        .sort((a, b) => b.sort_order - a.sort_order)[0];
      setSelectedRegulationId(latest199 ? latest199.id : null);
    }
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!schematicFile) {
        setError('A schematic file is required.');
        return;
      }
      if (!selectedRegulationId) {
        setError('A regulation must be selected.');
        return;
      }
      if (usage.length === 0) {
        setError('At least one usage type must be selected.');
        return;
      }

      setLoading(true);
      setError(null);

      const formData = new FormData(event.currentTarget);
      if (imageFile) formData.set('image', imageFile);
      if (schematicFile) formData.set('schematic', schematicFile);
      formData.set('regulation_id', selectedRegulationId);
      usage.forEach(u => formData.append('usage_type', u));


      try {
        await sendSchematic(formData);
        notifications.show({
          title: 'Upload Successful',
          message: 'Your schematic has been uploaded.',
          color: 'green',
        });
        // Consider redirecting the user after successful upload
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
    [imageFile, schematicFile, selectedRegulationId, usage]
  );

  return (
    <Container size="md" style={{ marginTop: '2rem', position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />
      <Title order={2} style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Upload Your ACFA Schematic
      </Title>

      {/* --- Instructions Accordion --- */}
      <Accordion style={{ marginBottom: '2rem' }}>
        <Accordion.Item value="instructions">
          <Accordion.Control>How to get your .ac4a schematic file</Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Text>
                To get your schematic file, you need to use the ACFA Schematic
                Tool, a standalone desktop application. You can download it from
                <Anchor
                  href="https://github.com/tmbkoren/ACFA_Schematic_Tool/releases/latest"
                  style={{ marginLeft: '5px' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Anchor>
                .
              </Text>
              <Text>
                1. Place the .exe file in your `PCFA` folder, next to your `EMULATOR` folder.
              </Text>
              <Code block>
                {`-- PCFA/
   |-- ACFA_Schematic_Tool.exe
   |-- EMULATOR/`}
              </Code>
              <Text>
                2. Run the tool. It should automatically detect your schematics.
                If not, select or drag-and-drop your DESDOC.DAT file, located in: <br />
                <i>EMULATOR/dev_hdd0/home/00000001/savedata/BLUS30187ASSMBLY064</i>
              </Text>
              <Text>3. Select the desired schematic and press <b>Export to .ac4a</b>.</Text>
              <Text>4. Upload the generated <b>.ac4a</b> file here.</Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <form onSubmit={handleSubmit}>
        <Stack style={{ marginTop: '1rem' }} gap="xl">
          {error && (
            <Alert title="Upload Error" color="red" withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* --- File Dropzones --- */}
          <Dropzone
            onDrop={handleImageDrop}
            maxSize={5 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
            openRef={imageInputRef}
          >
            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
              <Dropzone.Accept><FiUpload size="3.2rem" /></Dropzone.Accept>
              <Dropzone.Reject><FiX size="3.2rem" /></Dropzone.Reject>
              <Dropzone.Idle><FiImage size="3.2rem" /></Dropzone.Idle>
              <div>
                <Text size="xl" inline>Drag an image here or click to select</Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  Attach a screenshot. Pasting from clipboard is also supported.
                </Text>
              </div>
            </Group>
          </Dropzone>
          {previewUrl && (
            <div style={{ textAlign: 'center' }}>
              <Image
                src={previewUrl}
                alt="Screenshot Preview"
                width={400}
                height={225}
                style={{ border: '1px solid #ccc', borderRadius: '4px', maxWidth: '100%', height: 'auto' }}
              />
            </div>
          )}

          <Dropzone
            onDrop={handleSchematicDrop}
            maxSize={1 * 1024 ** 2}
            accept={{ 'application/octet-stream': ['.ac4a'] }}
            openRef={schematicInputRef}
          >
            <Group justify="center" gap="xl" mih={100} style={{ pointerEvents: 'none' }}>
              <Dropzone.Idle><FiUpload size="3.2rem" /></Dropzone.Idle>
              <div>
                <Text size="xl" inline>Drag your .ac4a file here or click to select</Text>
                {schematicFile && (
                  <Text size="sm" c="dimmed" mt={7}>Selected: {schematicFile.name}</Text>
                )}
              </div>
            </Group>
          </Dropzone>

          {schematicName && designerName && (
            <Paper withBorder p="sm" radius="md">
              <Text><strong>Schematic:</strong> {schematicName}</Text>
              <Text><strong>Designer:</strong> {designerName}</Text>
            </Paper>
          )}

          {/* --- Regulation and Usage --- */}
          <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
            <Stack style={{ flex: 1 }}>
              <Title order={5}>Regulation</Title>
              <Flex gap="md">
                <Select
                  data={regulationFamilies}
                  value={selectedRegulationFamily}
                  onChange={handleRegulationFamilyChange}
                  style={{ flex: 1 }}
                />
                {selectedRegulationFamily === '1.99' && (
                  <Select
                    data={regulationVersions}
                    value={selectedRegulationId}
                    onChange={setSelectedRegulationId}
                    style={{ flex: 1 }}
                  />
                )}
              </Flex>
            </Stack>
            <Stack style={{ flex: 1 }}>
              <Title order={5}>Usage Type</Title>
              <Checkbox.Group value={usage} onChange={setUsage}>
                <Group mt="xs">
                  {usageTypes.map((type) => (
                    <Checkbox key={type} value={type} label={type} />
                  ))}
                </Group>
              </Checkbox.Group>
            </Stack>
          </Flex>

          <Textarea
            label="Description (optional)"
            name="description"
            autosize
            minRows={2}
            maxRows={4}
          />
          <Button type="submit" loading={loading} fullWidth>
            Upload
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
