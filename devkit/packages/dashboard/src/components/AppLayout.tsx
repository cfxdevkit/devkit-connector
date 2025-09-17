'use client';

import {
  Anchor,
  AppShell,
  Button,
  Code,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconActivity,
  IconDatabase,
  IconGauge,
  IconHome2,
  IconWallet,
} from '@tabler/icons-react';
import Link from 'next/link';

const navigationItems = [
  { link: '/', label: 'Dashboard', icon: IconHome2 },
  { link: '/wallet', label: 'Wallet Test', icon: IconWallet },
  { link: '/contracts', label: 'Contracts', icon: IconDatabase },
  { link: '/status', label: 'Health Status', icon: IconGauge },
  { link: '/node-status', label: 'Node Status', icon: IconActivity },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <div
              style={{
                width: 28,
                height: 28,
                backgroundColor: 'var(--mantine-color-blue-6)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              CF
            </div>
            <Text fw={700} size="lg">
              Conflux DevKit
            </Text>
          </Group>
          <Code fw={700}>v1.0.0</Code>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navigationItems.map((item) => (
            <Anchor
              key={item.label}
              component={Link}
              href={item.link}
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="subtle"
                leftSection={<item.icon size={16} />}
                justify="flex-start"
                fullWidth
              >
                {item.label}
              </Button>
            </Anchor>
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
