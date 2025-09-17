"use client";

import {
  Text,
  Group,
  Stack,
  Box,
  AppShell,
  Burger,
  NavLink,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome,
  IconSettings,
  IconDatabase,
  IconWallet,
  IconServer,
} from "@tabler/icons-react";
import { useState } from "react";

// Import page components
import DashboardPage from "./dashboard/page";
import WalletTestPage from "./wallet/page";
import ContractsPage from "./contracts/page";
import NodeStatusPage from "./node-status/page";

export default function HomePage() {
  const [opened, { toggle }] = useDisclosure();
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "wallet-control":
        return <WalletTestPage />;
      case "node-management":
        return <NodeStatusPage />;
      case "contract-deployment":
        return <ContractsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text size="lg" fw={700}>
            Conflux Development
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Box p="md">
          <Group mb="xl">
            <Text size="lg" fw={700} c="blue">
              Conflux
            </Text>
          </Group>

          <Stack gap="xs">
            <NavLink
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
              label="Dashboard"
              leftSection={<IconHome size={16} />}
            />
            <NavLink
              active={activeTab === "wallet-control"}
              onClick={() => setActiveTab("wallet-control")}
              label="Wallet Control"
              leftSection={<IconWallet size={16} />}
              disabled
            />
            <NavLink
              active={activeTab === "node-management"}
              onClick={() => setActiveTab("node-management")}
              label="Node Management"
              leftSection={<IconServer size={16} />}
            />
            <NavLink
              active={activeTab === "contract-deployment"}
              onClick={() => setActiveTab("contract-deployment")}
              label="Contract Deployment"
              leftSection={<IconDatabase size={16} />}
            />
          </Stack>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>{renderContent()}</AppShell.Main>
    </AppShell>
  );
}
