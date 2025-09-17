import { createTheme, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import type { Metadata } from 'next';
import { AppLayout } from '../components/AppLayout';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Conflux DevKit Dashboard',
  description: 'Conflux blockchain development dashboard with Mantine UI',
};

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />
            <AppLayout>{children}</AppLayout>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
