"use client";

import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Button,
  Stack,
  Badge,
  Grid,
  TextInput,
  Alert,
  Code,
  Divider,
} from "@mantine/core";
import {
  IconWallet,
  IconShield,
  IconActivity,
  IconCheck,
  IconX,
  IconRefresh,
  IconCopy,
  IconKey,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useState } from "react";

export default function WalletTestPage() {
  const [serverWalletLoaded, setServerWalletLoaded] = useState(false);
  const [browserWalletConnected, setBrowserWalletConnected] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">
        Wallet Control Center
      </Title>
      <Text c="dimmed" mb="xl">
        Manage server and browser wallets for Conflux development
      </Text>

      <Grid>
        {/* Server Wallet */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md" h="100%">
            <Group mb="md">
              <IconShield size={24} />
              <Title order={3}>Server Wallet</Title>
              <Badge color={serverWalletLoaded ? "green" : "red"} size="sm">
                {serverWalletLoaded ? "Loaded" : "Not Loaded"}
              </Badge>
            </Group>
            <Text mb="md">Server-managed wallet for backend operations</Text>

            <Stack gap="md">
              <Group>
                <Button
                  leftSection={<IconKey size={16} />}
                  onClick={() => setServerWalletLoaded(!serverWalletLoaded)}
                  color={serverWalletLoaded ? "red" : "green"}
                >
                  {serverWalletLoaded ? "Unload Wallet" : "Load Wallet"}
                </Button>
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="outline"
                >
                  Refresh
                </Button>
              </Group>

              {serverWalletLoaded && (
                <Stack gap="sm">
                  <TextInput
                    label="Wallet Address"
                    value="0x1234...5678"
                    readOnly
                    rightSection={<IconCopy size={16} />}
                  />
                  <TextInput
                    label="Private Key"
                    type={showPrivateKey ? "text" : "password"}
                    value="0xabcd...efgh"
                    readOnly
                    rightSection={
                      <Group gap="xs">
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? (
                            <IconEyeOff size={16} />
                          ) : (
                            <IconEye size={16} />
                          )}
                        </Button>
                        <IconCopy size={16} />
                      </Group>
                    }
                  />
                  <Alert color="green" icon={<IconCheck size={16} />}>
                    Server wallet is ready for operations
                  </Alert>
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Browser Wallet */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md" h="100%">
            <Group mb="md">
              <IconWallet size={24} />
              <Title order={3}>Browser Wallet</Title>
              <Badge color={browserWalletConnected ? "green" : "red"} size="sm">
                {browserWalletConnected ? "Connected" : "Not Connected"}
              </Badge>
            </Group>
            <Text mb="md">
              User-controlled browser wallet for frontend operations
            </Text>

            <Stack gap="md">
              <Group>
                <Button
                  leftSection={<IconWallet size={16} />}
                  onClick={() =>
                    setBrowserWalletConnected(!browserWalletConnected)
                  }
                  color={browserWalletConnected ? "red" : "green"}
                >
                  {browserWalletConnected ? "Disconnect" : "Connect Wallet"}
                </Button>
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="outline"
                >
                  Refresh
                </Button>
              </Group>

              {browserWalletConnected && (
                <Stack gap="sm">
                  <TextInput
                    label="Connected Address"
                    value="0x9876...5432"
                    readOnly
                    rightSection={<IconCopy size={16} />}
                  />
                  <Text size="sm" c="dimmed">
                    Network: Conflux eSpace (Testnet)
                  </Text>
                  <Alert color="green" icon={<IconCheck size={16} />}>
                    Browser wallet is connected and ready
                  </Alert>
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Wallet Operations */}
        <Grid.Col span={12}>
          <Card withBorder p="md">
            <Group mb="md">
              <IconActivity size={24} />
              <Title order={3}>Wallet Operations</Title>
            </Group>
            <Text mb="md">Test wallet operations and interactions</Text>

            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="sm">
                  <Title order={4}>Server Operations</Title>
                  <Button variant="outline" fullWidth>
                    Get Balance
                  </Button>
                  <Button variant="outline" fullWidth>
                    Send Transaction
                  </Button>
                  <Button variant="outline" fullWidth>
                    Deploy Contract
                  </Button>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="sm">
                  <Title order={4}>Browser Operations</Title>
                  <Button variant="outline" fullWidth>
                    Request Account
                  </Button>
                  <Button variant="outline" fullWidth>
                    Sign Message
                  </Button>
                  <Button variant="outline" fullWidth>
                    Send Transaction
                  </Button>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="sm">
                  <Title order={4}>Delegation</Title>
                  <Button variant="outline" fullWidth>
                    Create Session
                  </Button>
                  <Button variant="outline" fullWidth>
                    Delegate Operations
                  </Button>
                  <Button variant="outline" fullWidth>
                    Revoke Session
                  </Button>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

        {/* Wallet Status */}
        <Grid.Col span={12}>
          <Card withBorder p="md">
            <Title order={3} mb="md">
              Wallet Status
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="sm">
                  <Text fw={500}>Server Wallet Status</Text>
                  <Code block>
                    {JSON.stringify(
                      {
                        loaded: serverWalletLoaded,
                        address: serverWalletLoaded ? "0x1234...5678" : null,
                        balance: serverWalletLoaded ? "1.5 CFX" : "N/A",
                        network: "Conflux eSpace (Testnet)",
                      },
                      null,
                      2
                    )}
                  </Code>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="sm">
                  <Text fw={500}>Browser Wallet Status</Text>
                  <Code block>
                    {JSON.stringify(
                      {
                        connected: browserWalletConnected,
                        address: browserWalletConnected
                          ? "0x9876...5432"
                          : null,
                        balance: browserWalletConnected ? "0.8 CFX" : "N/A",
                        network: "Conflux eSpace (Testnet)",
                      },
                      null,
                      2
                    )}
                  </Code>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
