'use client';

import { Button, Container, Text, Title, Card, Group, Stack, Box, AppShell, Burger, NavLink, Table, Badge, Timeline, Switch, TextInput, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome, IconSettings, IconUser, IconDatabase, IconActivity, IconWallet, IconCreditCard, IconShield, IconFileCode, IconPlus, IconEye, IconClock, IconCheck, IconX, IconBell, IconPalette } from '@tabler/icons-react';
import { useState } from 'react';

export default function HomePage() {
  const [opened, { toggle }] = useDisclosure();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <Container size="xl" py="xl">
            <Title order={1} mb="md">
              Wallet Management
            </Title>
            <Text c="dimmed" mb="xl">
              Manage your digital wallets and cryptocurrency assets.
            </Text>

            <Stack gap="xl">
              <Card withBorder p="md">
                <Group mb="md">
                  <IconWallet size={24} />
                  <Title order={3}>Connected Wallets</Title>
                </Group>
                <Text mb="md">
                  View and manage your connected wallet accounts.
                </Text>
                <Group>
                  <Button>Connect Wallet</Button>
                  <Button variant="outline">Import Wallet</Button>
                </Group>
              </Card>

              <Card withBorder p="md">
                <Group mb="md">
                  <IconCreditCard size={24} />
                  <Title order={3}>Payment Methods</Title>
                </Group>
                <Text mb="md">
                  Manage your payment methods and billing information.
                </Text>
                <Button>Add Payment Method</Button>
              </Card>

              <Card withBorder p="md">
                <Group mb="md">
                  <IconShield size={24} />
                  <Title order={3}>Security Settings</Title>
                </Group>
                <Text mb="md">
                  Configure security settings and two-factor authentication.
                </Text>
                <Button color="red">Enable 2FA</Button>
              </Card>
            </Stack>
          </Container>
        );

      case 'contracts':
        return (
          <Container size="xl" py="xl">
            <Title order={1} mb="md">
              Smart Contracts
            </Title>
            <Text c="dimmed" mb="xl">
              Deploy and manage your smart contracts on the blockchain.
            </Text>

            <Stack gap="xl">
              <Card withBorder p="md">
                <Group mb="md">
                  <IconFileCode size={24} />
                  <Title order={3}>Deployed Contracts</Title>
                </Group>
                <Text mb="md">
                  View all your deployed smart contracts and their status.
                </Text>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Contract Name</Table.Th>
                      <Table.Th>Address</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>Counter Contract</Table.Td>
                      <Table.Td>0x1234...5678</Table.Td>
                      <Table.Td><Badge color="green">Active</Badge></Table.Td>
                      <Table.Td>
                        <Button size="xs" variant="outline">
                          <IconEye size={14} />
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Token Contract</Table.Td>
                      <Table.Td>0xabcd...efgh</Table.Td>
                      <Table.Td><Badge color="yellow">Pending</Badge></Table.Td>
                      <Table.Td>
                        <Button size="xs" variant="outline">
                          <IconEye size={14} />
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Card>

              <Card withBorder p="md">
                <Group mb="md">
                  <IconPlus size={24} />
                  <Title order={3}>Deploy New Contract</Title>
                </Group>
                <Text mb="md">
                  Deploy a new smart contract to the blockchain.
                </Text>
                <Group>
                  <Button>Deploy Contract</Button>
                  <Button variant="outline">Upload ABI</Button>
                </Group>
              </Card>
            </Stack>
          </Container>
        );

      case 'activity':
        return (
          <Container size="xl" py="xl">
            <Title order={1} mb="md">
              Activity Feed
            </Title>
            <Text c="dimmed" mb="xl">
              Track your recent transactions and activities.
            </Text>

            <Stack gap="xl">
              <Card withBorder p="md">
                <Group mb="md">
                  <IconActivity size={24} />
                  <Title order={3}>Recent Activity</Title>
                </Group>
                <Timeline active={2} bulletSize={24} lineWidth={2}>
                  <Timeline.Item
                    bullet={<IconCheck size={12} />}
                    title="Transaction Confirmed"
                    c="green"
                  >
                    <Text c="dimmed" size="sm">
                      Contract deployment completed successfully
                    </Text>
                    <Text size="xs" mt={4} c="dimmed">
                      2 minutes ago
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item
                    bullet={<IconClock size={12} />}
                    title="Transaction Pending"
                    c="yellow"
                  >
                    <Text c="dimmed" size="sm">
                      Token transfer is being processed
                    </Text>
                    <Text size="xs" mt={4} c="dimmed">
                      5 minutes ago
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item
                    bullet={<IconX size={12} />}
                    title="Transaction Failed"
                    c="red"
                  >
                    <Text c="dimmed" size="sm">
                      Contract call failed due to insufficient gas
                    </Text>
                    <Text size="xs" mt={4} c="dimmed">
                      10 minutes ago
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Card>

              <Card withBorder p="md">
                <Group mb="md">
                  <Title order={3}>Quick Stats</Title>
                </Group>
                <Group>
                  <Box>
                    <Text size="sm" c="dimmed">Total Transactions</Text>
                    <Text size="xl" fw={700}>1,234</Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed">Success Rate</Text>
                    <Text size="xl" fw={700} c="green">98.5%</Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed">Gas Used</Text>
                    <Text size="xl" fw={700}>45.2 ETH</Text>
                  </Box>
                </Group>
              </Card>
            </Stack>
          </Container>
        );

      case 'settings':
        return (
          <Container size="xl" py="xl">
            <Title order={1} mb="md">
              Settings
            </Title>
            <Text c="dimmed" mb="xl">
              Configure your application preferences and account settings.
            </Text>

            <Stack gap="xl">
              <Card withBorder p="md">
                <Group mb="md">
                  <IconBell size={24} />
                  <Title order={3}>Notifications</Title>
                </Group>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Box>
                      <Text fw={500}>Email Notifications</Text>
                      <Text size="sm" c="dimmed">Receive email updates about your transactions</Text>
                    </Box>
                    <Switch defaultChecked />
                  </Group>
                  <Group justify="space-between">
                    <Box>
                      <Text fw={500}>Push Notifications</Text>
                      <Text size="sm" c="dimmed">Get real-time updates on your device</Text>
                    </Box>
                    <Switch />
                  </Group>
                  <Group justify="space-between">
                    <Box>
                      <Text fw={500}>SMS Alerts</Text>
                      <Text size="sm" c="dimmed">Receive text messages for important events</Text>
                    </Box>
                    <Switch />
                  </Group>
                </Stack>
              </Card>

              <Card withBorder p="md">
                <Group mb="md">
                  <IconShield size={24} />
                  <Title order={3}>Security</Title>
                </Group>
                <Stack gap="md">
                  <TextInput
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                  />
                  <TextInput
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                  />
                  <TextInput
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                  <Button>Update Password</Button>
                </Stack>
              </Card>

              <Card withBorder p="md">
                <Group mb="md">
                  <IconPalette size={24} />
                  <Title order={3}>Appearance</Title>
                </Group>
                <Stack gap="md">
                  <Select
                    label="Theme"
                    placeholder="Select theme"
                    data={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'auto', label: 'Auto' },
                    ]}
                    defaultValue="auto"
                  />
                  <Select
                    label="Language"
                    placeholder="Select language"
                    data={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                      { value: 'fr', label: 'French' },
                    ]}
                    defaultValue="en"
                  />
                  <Button>Save Preferences</Button>
                </Stack>
              </Card>
            </Stack>
          </Container>
        );

      default: // dashboard
        return (
          <Container size="xl" py="xl">
            <Title order={1} mb="md">
              Welcome to Mantine with Next.js
            </Title>
            <Text c="dimmed" mb="xl">
              This is a comprehensive demo showcasing Mantine UI components in a Next.js application.
            </Text>

            <Stack gap="xl">
              <Card withBorder p="md">
                <Title order={2} mb="sm">
                  Basic Components
                </Title>
                <Text mb="md">
                  Here are some basic Mantine components in action:
                </Text>
                <Group>
                  <Button>Primary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button color="red">Danger Button</Button>
                </Group>
              </Card>

              <Card withBorder p="md">
                <Title order={2} mb="sm">
                  Layout Components
                </Title>
                <Text mb="md">
                  Mantine provides powerful layout components for building responsive designs.
                </Text>
                <Box p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
                  <Text size="sm">
                    This is a Box component with custom styling.
                  </Text>
                </Box>
              </Card>

              <Card withBorder p="md">
                <Title order={2} mb="sm">
                  Typography
                </Title>
                <Stack gap="sm">
                  <Text size="xs">Extra small text</Text>
                  <Text size="sm">Small text</Text>
                  <Text size="md">Medium text (default)</Text>
                  <Text size="lg">Large text</Text>
                  <Text size="xl">Extra large text</Text>
                </Stack>
              </Card>
            </Stack>
          </Container>
        );
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
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <Text size="lg" fw={700}>
            Mantine Next.js Demo
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Box p="md">
          <Group mb="xl">
            <Text size="lg" fw={700} c="blue">
              Mantine
            </Text>
          </Group>

          <Stack gap="xs">
            <NavLink
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              label="Dashboard"
              leftSection={<IconHome size={16} />}
            />
            <NavLink
              active={activeTab === 'wallet'}
              onClick={() => setActiveTab('wallet')}
              label="Wallet"
              leftSection={<IconUser size={16} />}
            />
            <NavLink
              active={activeTab === 'contracts'}
              onClick={() => setActiveTab('contracts')}
              label="Contracts"
              leftSection={<IconDatabase size={16} />}
            />
            <NavLink
              active={activeTab === 'activity'}
              onClick={() => setActiveTab('activity')}
              label="Activity"
              leftSection={<IconActivity size={16} />}
            />
            <NavLink
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              label="Settings"
              leftSection={<IconSettings size={16} />}
            />
          </Stack>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        {renderContent()}
      </AppShell.Main>
    </AppShell>
  );
}
