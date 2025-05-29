import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

import {
  Box,
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import Navbar from '@/components/Navbar';
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
        <MantineProvider forceColorScheme='dark'>
          <Navbar />
          <Box component='main' p={15}>{children}</Box>
        </MantineProvider>
      </body>
    </html>
  );
}
