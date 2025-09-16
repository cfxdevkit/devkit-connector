import type { Metadata } from "next";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import "./globals.css";

export const metadata: Metadata = {
  title: "Mantine Next.js Demo",
  description: "A demo application showcasing Mantine UI with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
