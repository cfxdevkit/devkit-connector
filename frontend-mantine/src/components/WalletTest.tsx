import React, { useState } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Grid,
  Alert,
  Badge,
  ScrollArea,
  Code,
  ActionIcon,
  Paper,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconServer,
  IconWorld,
  IconCheck,
  IconX,
  IconClock,
  IconTrash,
  IconApi,
  IconRefresh,
} from "@tabler/icons-react";
import { useServerWallet } from "../hooks/useServerWallet";
import { useBrowserWallet } from "../hooks/useBrowserWallet";

const WalletTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Server wallet hook
  const serverWallet = useServerWallet();
  const {
    mode: serverMode,
    eSpaceAddress: serverESpaceAddress,
    coreAddress: serverCoreAddress,
    isLoading: serverLoading,
    error: serverError,
    isConnected: serverConnected,
    loadWallet: loadServerWallet,
    createDelegationSession,
  } = serverWallet;

  // Browser wallet hook
  const {
    wallet: browserWallet,
    isLoading: browserLoading,
    error: browserError,
    connect: connectBrowserWallet,
    delegateToServer,
  } = useBrowserWallet();

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testServerWallet = async () => {
    setIsLoading(true);
    addResult("🔄 Testing server wallet connection...");

    try {
      await loadServerWallet();
      addResult("✅ Server wallet connected successfully!");
      addResult(`📍 eSpace Address: ${serverESpaceAddress}`);
      addResult(`📍 Core Address: ${serverCoreAddress}`);
      addResult(`🆔 Wallet ID: ${serverWallet.walletId || "N/A"}`);
    } catch (error) {
      addResult(
        `❌ Server wallet failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    setIsLoading(false);
  };

  const testBrowserWallet = async () => {
    setIsLoading(true);
    addResult("🔄 Testing browser wallet connection...");

    try {
      await connectBrowserWallet();
      addResult("✅ Browser wallet connected successfully!");
      if (browserWallet) {
        addResult(`📍 Address: ${browserWallet.address}`);
        addResult(`🔗 Chain ID: ${browserWallet.chainId}`);
        addResult(`🔌 Connector: ${browserWallet.connector || "Unknown"}`);
      }
    } catch (error) {
      addResult(
        `❌ Browser wallet failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    setIsLoading(false);
  };

  const testBrowserDelegation = async () => {
    if (!browserWallet?.address) {
      addResult("❌ Connect browser wallet first");
      return;
    }

    if (!serverESpaceAddress) {
      addResult("❌ Server wallet not available. Load server wallet first.");
      return;
    }

    setIsLoading(true);
    addResult("🔄 Testing browser wallet delegation...");
    addResult(`🎯 Delegating to server address: ${serverESpaceAddress}`);

    try {
      const sessionId = await delegateToServer(serverESpaceAddress, {
        limit: "1000000000000000000", // 1 ETH
        sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
        allowedOperations: ["sign_transaction", "sign_message"],
      });
      addResult(`✅ Browser wallet delegated! Session: ${sessionId}`);
      addResult(`🔗 Delegation active for 24 hours`);
    } catch (error) {
      addResult(
        `❌ Browser delegation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    setIsLoading(false);
  };

  const getStatusBadge = (
    loading: boolean,
    connected: boolean,
    error: string | null
  ) => {
    if (loading) {
      return (
        <Badge color="yellow" leftSection={<IconClock size={12} />}>
          Loading
        </Badge>
      );
    }
    if (connected) {
      return (
        <Badge color="green" leftSection={<IconCheck size={12} />}>
          Connected
        </Badge>
      );
    }
    if (error) {
      return (
        <Badge color="red" leftSection={<IconX size={12} />}>
          Error
        </Badge>
      );
    }
    return <Badge color="gray">Not Connected</Badge>;
  };

  return (
    <Stack gap="xl">
      {/* Header Section */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Box>
            <Title order={2}>Wallet Connection Test</Title>
            <Text c="dimmed" size="sm">
              Test and verify wallet connections for both server and browser
              patterns
            </Text>
          </Box>
          <Group>
            <Button
              onClick={() => {
                testServerWallet();
                testBrowserWallet();
              }}
              loading={isLoading}
              leftSection={<IconRefresh size={16} />}
              variant="outline"
            >
              Test All
            </Button>
            <Button
              onClick={clearResults}
              leftSection={<IconTrash size={16} />}
              variant="outline"
              color="red"
            >
              Clear Results
            </Button>
          </Group>
        </Group>
      </Card>

      {/* Wallet Status Overview */}
      <Grid>
        <Grid.Col span={6}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="blue" variant="light" size="lg">
                <IconServer size={20} />
              </ThemeIcon>
              <Box>
                <Title order={3}>Server Wallet</Title>
                <Text size="sm" c="dimmed">
                  Server-managed wallet for Pattern A
                </Text>
              </Box>
            </Group>

            <Stack gap="md">
              {/* Status Row */}
              <Group justify="space-between">
                <Text fw={500}>Connection Status</Text>
                {getStatusBadge(serverLoading, serverConnected, serverError)}
              </Group>

              {/* Wallet Details - Always Visible */}
              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Mode
                    </Text>
                    <Badge color="blue" variant="light">
                      {serverMode || "Not Set"}
                    </Badge>
                  </Group>

                  {serverESpaceAddress ? (
                    <>
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          eSpace Address
                        </Text>
                        <Code block>{serverESpaceAddress}</Code>
                      </div>
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Core Address
                        </Text>
                        <Code block>{serverCoreAddress}</Code>
                      </div>
                    </>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No wallet loaded
                    </Text>
                  )}
                </Stack>
              </Paper>

              {/* Error Display */}
              {serverError && (
                <Alert
                  color="red"
                  title="Connection Error"
                  icon={<IconX size={16} />}
                >
                  {serverError}
                </Alert>
              )}

              {/* Action Button - Always Visible */}
              <Button
                onClick={testServerWallet}
                loading={isLoading || serverLoading}
                fullWidth
                color="blue"
                leftSection={<IconServer size={16} />}
              >
                {serverConnected
                  ? "Reconnect Server Wallet"
                  : "Connect Server Wallet"}
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="green" variant="light" size="lg">
                <IconWorld size={20} />
              </ThemeIcon>
              <Box>
                <Title order={3}>Browser Wallet</Title>
                <Text size="sm" c="dimmed">
                  User-controlled wallet for Pattern B
                </Text>
              </Box>
            </Group>

            <Stack gap="md">
              {/* Status Row */}
              <Group justify="space-between">
                <Text fw={500}>Connection Status</Text>
                {getStatusBadge(browserLoading, !!browserWallet, browserError)}
              </Group>

              {/* Wallet Details - Always Visible */}
              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Connector
                    </Text>
                    <Badge color="green" variant="light">
                      {browserWallet?.connector || "Not Connected"}
                    </Badge>
                  </Group>

                  {browserWallet ? (
                    <>
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Address
                        </Text>
                        <Code block>{browserWallet.address}</Code>
                      </div>
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Chain ID
                        </Text>
                        <Text size="sm">{browserWallet.chainId}</Text>
                      </div>
                    </>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No wallet connected
                    </Text>
                  )}
                </Stack>
              </Paper>

              {/* Error Display */}
              {browserError && (
                <Alert
                  color="red"
                  title="Connection Error"
                  icon={<IconX size={16} />}
                >
                  {browserError}
                </Alert>
              )}

              {/* Action Buttons - Always Visible */}
              <Stack gap="sm">
                <Button
                  onClick={testBrowserWallet}
                  loading={isLoading || browserLoading}
                  fullWidth
                  color="green"
                  leftSection={<IconWorld size={16} />}
                >
                  {browserWallet
                    ? "Reconnect Browser Wallet"
                    : "Connect Browser Wallet"}
                </Button>

                {browserWallet && serverESpaceAddress && (
                  <Button
                    onClick={testBrowserDelegation}
                    loading={isLoading}
                    fullWidth
                    color="violet"
                    variant="outline"
                  >
                    Test Delegation to Server
                  </Button>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Test Results - Always Visible */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Test Results</Title>
          <Badge color="blue" variant="light">
            {testResults.length} tests
          </Badge>
        </Group>

        <Paper
          p="md"
          style={{
            backgroundColor: "#1a1a1a",
            color: "#00ff00",
            fontFamily: "monospace",
            fontSize: "12px",
            minHeight: "200px",
          }}
        >
          <ScrollArea h={200}>
            {testResults.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No tests run yet. Click "Test All" or individual test buttons
                above.
              </Text>
            ) : (
              testResults.map((result, index) => (
                <Text key={index} size="xs" style={{ marginBottom: "4px" }}>
                  {result}
                </Text>
              ))
            )}
          </ScrollArea>
        </Paper>
      </Card>

      {/* System Health - Always Visible */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group mb="md">
          <ThemeIcon color="yellow" variant="light" size="lg">
            <IconApi size={20} />
          </ThemeIcon>
          <Box>
            <Title order={3}>System Health</Title>
            <Text size="sm" c="dimmed">
              Check API connectivity and system status
            </Text>
          </Box>
        </Group>

        <Group>
          <Button
            onClick={() => {
              addResult("🔄 Testing API connection...");
              fetch("http://localhost:3001/health")
                .then((response) => response.json())
                .then((data) =>
                  addResult(`✅ API Health: ${JSON.stringify(data)}`)
                )
                .catch((error) => addResult(`❌ API Error: ${error.message}`));
            }}
            color="yellow"
            variant="outline"
            leftSection={<IconApi size={16} />}
          >
            Test API Connection
          </Button>
        </Group>
      </Card>
    </Stack>
  );
};

export default WalletTest;
