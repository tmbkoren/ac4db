import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

import {
  Box,
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import Navbar from '@/components/Navbar';
import theme from '@/utils/theme/theme';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'ac4db',
  description: 'Schematic database for 4th generation Armored Core games',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Analytics />
        <MantineProvider
          forceColorScheme='dark'
          theme={theme}
        >
          <Navbar />
          <Box
            component='main'
            p={15}
          >
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
          </Box>
        </MantineProvider>
      </body>
    </html>
  );
}
