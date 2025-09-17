import type { Metadata } from "next";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
// import "@mantine/modals/styles.css"; // Not available in this version
import "./globals.css";

// Import providers
import { WalletProvider } from "../components/WalletProvider";
import ErrorBoundary from "../components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Conflux Development Frontend",
  description: "Conflux blockchain development frontend with Mantine UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="dark">
          <Notifications />
          <ModalsProvider>
            <ErrorBoundary>
              <WalletProvider>{children}</WalletProvider>
            </ErrorBoundary>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
