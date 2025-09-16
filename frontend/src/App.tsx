import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MantineProvider, AppShell, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import "./styles/global.css";
import { WalletProvider } from "./context/WalletContext";
import ErrorBoundary from "./components/ErrorBoundary";
import DevelopmentHelper from "./components/DevelopmentHelper";
import { NavbarSimple } from "./components/NavbarSimple";
import WalletTestPage from "./pages/WalletTestPage";
import DashboardPage from "./pages/DashboardPage";
import PatternAPage from "./pages/PatternA";
import PatternBPage from "./pages/PatternB";
import SystemPage from "./pages/SystemPage";
import SettingsPage from "./pages/SettingsPage";
import ContractsPage from "./pages/ContractsPage";
import StatusPage from "./pages/StatusPage";
import ApiHealthPage from "./pages/ApiHealthPage";
import NodeStatusPage from "./pages/NodeStatusPage";
import DocsPage from "./pages/DocsPage";

// Create a dark theme
const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  headings: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33",
      "#25262b",
      "#1A1B23",
      "#141517",
      "#101113",
    ],
  },
});

const App: React.FC = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <ModalsProvider>
        <ErrorBoundary>
          <WalletProvider>
            <Router>
              <AppShell navbar={{ width: 300, breakpoint: "sm" }} padding="md">
                <AppShell.Navbar>
                  <NavbarSimple />
                </AppShell.Navbar>

                <AppShell.Main>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/wallet" element={<WalletTestPage />} />
                    <Route path="/pattern-a" element={<PatternAPage />} />
                    <Route path="/pattern-b" element={<PatternBPage />} />
                    <Route path="/system" element={<SystemPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/contracts" element={<ContractsPage />} />
                    <Route path="/status" element={<StatusPage />} />
                    <Route path="/api-health" element={<ApiHealthPage />} />
                    <Route path="/node-status" element={<NodeStatusPage />} />
                    <Route path="/docs" element={<DocsPage />} />
                  </Routes>
                  <DevelopmentHelper />
                </AppShell.Main>
              </AppShell>
            </Router>
          </WalletProvider>
        </ErrorBoundary>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default App;
