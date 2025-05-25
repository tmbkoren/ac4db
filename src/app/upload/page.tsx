'use client';

import { useEffect, useRef, useState } from 'react';
import { Container, Stack } from '@mantine/core';
import { sendSchematic } from '@/app/upload/actions';
import Image from 'next/image';

export default function PrivatePage() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items || []).find((i) =>
        i.type.startsWith('image/')
      );
      if (item) {
        const file = item.getAsFile();
        if (file && imageInputRef.current) {
          // Set file into the input using DataTransfer
          const dt = new DataTransfer();
          dt.items.add(file);
          imageInputRef.current.files = dt.files;

          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <Container
      size='md'
      style={{ marginTop: '2rem' }}
    >
      <form
        action={sendSchematic}
      >
        <Stack style={{ marginTop: '1rem' }}>
          <label htmlFor='image'>Image (optional):</label>
          <input
            ref={imageInputRef}
            type='file'
            name='image'
            accept='image/*'
          />
          {previewUrl && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
                marginTop: '1rem',
              }}
            >
              <Image
                src={previewUrl}
                alt='Pasted Screenshot Preview'
                layout='responsive'
                width={800}
                height={450}
                style={{ border: '1px solid #ccc' }}
              />
            </div>
          )}

          <label htmlFor='schematic'>Schematic File:</label>
          <input
            type='file'
            name='schematic'
            accept='.ac4a'
            required
          />
          <button type='submit'>Upload</button>
        </Stack>
      </form>
    </Container>
  );
}
