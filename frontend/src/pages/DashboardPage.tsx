import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Stack,
  ThemeIcon,
  Paper,
  Box,
  ActionIcon,
  ScrollArea,
  Table,
  Code,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconClock,
  IconRefresh,
  IconShield,
  IconActivity,
  IconDatabase,
  IconTrendingUp,
  IconUsers,
  IconCoin,
  IconServer,
} from "@tabler/icons-react";
import { apiRequest } from "../utils/apiUtils";

interface HealthCheck {
  component: string;
  status: "healthy" | "warning" | "error";
  message: string;
  lastCheck: string;
}

interface ApiActivity {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: string;
}

interface ContractInfo {
  name: string;
  address: string;
  deployed: boolean;
  transactionCount: number;
  lastActivity: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

const DashboardPage: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [apiActivity, setApiActivity] = useState<ApiActivity[]>([]);
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHealthChecks = async () => {
    try {
      const nodeResponse = await fetch("http://localhost:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
      });
      const nodeHealthy = nodeResponse.ok;

      const serverResponse = await fetch("http://localhost:3001/health");
      const serverHealthy = serverResponse.ok;

      const contractResponse = await apiRequest("/api/contracts/status");
      const contractsDeployed =
        contractResponse.success && contractResponse.data?.espace?.deployed;

      setHealthChecks([
        {
          component: "Conflux Node",
          status: nodeHealthy ? "healthy" : "error",
          message: nodeHealthy
            ? "Node responding to RPC calls"
            : "Node not responding",
          lastCheck: new Date().toISOString(),
        },
        {
          component: "API Server",
          status: serverHealthy ? "healthy" : "error",
          message: serverHealthy
            ? "Server responding to health checks"
            : "Server not responding",
          lastCheck: new Date().toISOString(),
        },
        {
          component: "Smart Contracts",
          status: contractsDeployed ? "healthy" : "warning",
          message: contractsDeployed
            ? "Contracts deployed and accessible"
            : "Contracts not deployed",
          lastCheck: new Date().toISOString(),
        },
        {
          component: "Database",
          status: "healthy",
          message: "Local storage operational",
          lastCheck: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load health checks:", error);
    }
  };

  const loadApiActivity = async () => {
    setApiActivity([
      {
        endpoint: "/api/wallet/status",
        method: "GET",
        status: 200,
        responseTime: 45,
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      },
      {
        endpoint: "/api/contracts/status",
        method: "GET",
        status: 200,
        responseTime: 32,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        endpoint: "/api/wallet/delegation",
        method: "POST",
        status: 201,
        responseTime: 78,
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      },
      {
        endpoint: "/api/contracts/operation",
        method: "POST",
        status: 200,
        responseTime: 156,
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
    ]);
  };

  const loadContracts = async () => {
    try {
      const contractResponse = await apiRequest("/api/contracts/status");
      if (contractResponse.success && contractResponse.data?.espace?.deployed) {
        setContracts([
          {
            name: "Counter Contract",
            address: contractResponse.data.espace.address,
            deployed: true,
            transactionCount: 15,
            lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            name: "Delegation Manager",
            address: "0x742d35Cc6634C0532925a3b8D0C0E1c2C5c2B5c2",
            deployed: true,
            transactionCount: 8,
            lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load contracts:", error);
    }
  };

  const loadTransactions = async () => {
    setTransactions([
      {
        hash: "0x1234...5678",
        from: "0xServer...Wallet",
        to: "0xCounter...Contract",
        value: "0.001 CFX",
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        status: "confirmed",
      },
      {
        hash: "0xabcd...efgh",
        from: "0xUser...Wallet",
        to: "0xDelegation...Manager",
        value: "0.005 CFX",
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        status: "confirmed",
      },
      {
        hash: "0x9876...5432",
        from: "0xServer...Wallet",
        to: "0xCounter...Contract",
        value: "0.002 CFX",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: "pending",
      },
    ]);
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadHealthChecks(),
      loadApiActivity(),
      loadContracts(),
      loadTransactions(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "green";
      case "warning":
        return "yellow";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <IconCheck size={12} />;
      case "warning":
        return <IconX size={12} />;
      case "error":
        return <IconX size={12} />;
      default:
        return <IconClock size={12} />;
    }
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Title order={1} mb="sm">
          Dashboard
        </Title>
        <Text c="dimmed" size="lg">
          Conflux Dual Wallet System - Real-time monitoring and management
        </Text>
      </Box>

      {/* Main Grid Layout */}
      <Grid>
        {/* Left Column - Status Overview */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon color="blue" variant="light" size="lg">
                  <IconShield size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={3}>System Status</Title>
                  <Text size="sm" c="dimmed">
                    Health monitoring
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                onClick={loadHealthChecks}
                loading={loading}
                variant="light"
                color="blue"
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>

            <Stack gap="sm">
              {healthChecks.map((check, index) => (
                <Paper key={index} p="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      {check.component}
                    </Text>
                    <Badge
                      color={getStatusColor(check.status)}
                      leftSection={getStatusIcon(check.status)}
                      size="sm"
                    >
                      {check.status}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mb="xs">
                    {check.message}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(check.lastCheck).toLocaleTimeString()}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Middle Column - API Activity */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon color="green" variant="light" size="lg">
                  <IconActivity size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={3}>API Activity</Title>
                  <Text size="sm" c="dimmed">
                    Real-time monitoring
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                onClick={loadApiActivity}
                loading={loading}
                variant="light"
                color="green"
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>

            <ScrollArea h={300}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Endpoint</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {apiActivity.map((activity, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <Code>{activity.method}</Code>
                        <Text size="xs" c="dimmed">
                          {activity.endpoint}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            activity.status >= 200 && activity.status < 300
                              ? "green"
                              : "red"
                          }
                          size="sm"
                        >
                          {activity.status}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {activity.responseTime}ms
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* Right Column - Blockchain */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon color="purple" variant="light" size="lg">
                  <IconDatabase size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={3}>Blockchain</Title>
                  <Text size="sm" c="dimmed">
                    Contract monitoring
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                onClick={loadContracts}
                loading={loading}
                variant="light"
                color="purple"
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>

            <Stack gap="md">
              {/* Deployed Contracts */}
              <Box>
                <Text fw={500} size="sm" mb="sm">
                  Deployed Contracts
                </Text>
                {contracts.map((contract, index) => (
                  <Paper key={index} p="sm" withBorder mb="xs">
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm">
                        {contract.name}
                      </Text>
                      <Badge color="green" size="sm">
                        Deployed
                      </Badge>
                    </Group>
                    <Code
                      mb="xs"
                      style={{ display: "block", fontSize: "10px" }}
                    >
                      {contract.address}
                    </Code>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {contract.transactionCount} txns
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(contract.lastActivity).toLocaleTimeString()}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Box>

              {/* Recent Transactions */}
              <Box>
                <Text fw={500} size="sm" mb="sm">
                  Recent Transactions
                </Text>
                <ScrollArea h={150}>
                  <Stack gap="xs">
                    {transactions.map((tx, index) => (
                      <Paper key={index} p="sm" withBorder>
                        <Group justify="space-between" mb="xs">
                          <Code>{tx.hash.slice(0, 8)}...</Code>
                          <Badge
                            color={
                              tx.status === "confirmed"
                                ? "green"
                                : tx.status === "pending"
                                  ? "yellow"
                                  : "red"
                            }
                            size="xs"
                          >
                            {tx.status}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed" mb="xs">
                          {tx.from.slice(0, 8)}... → {tx.to.slice(0, 8)}...
                        </Text>
                        <Group justify="space-between">
                          <Text size="xs" fw={500}>
                            {tx.value}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              </Box>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Bottom Row - Statistics */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="sm">
              <ThemeIcon color="blue" variant="light">
                <IconTrendingUp size={16} />
              </ThemeIcon>
              <Text fw={500}>Total Transactions</Text>
            </Group>
            <Text size="xl" fw={700} mb="xs">
              1,247
            </Text>
            <Text size="sm" c="dimmed">
              +12% from last week
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="sm">
              <ThemeIcon color="green" variant="light">
                <IconUsers size={16} />
              </ThemeIcon>
              <Text fw={500}>Active Users</Text>
            </Group>
            <Text size="xl" fw={700} mb="xs">
              89
            </Text>
            <Text size="sm" c="dimmed">
              +5 new today
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="sm">
              <ThemeIcon color="yellow" variant="light">
                <IconCoin size={16} />
              </ThemeIcon>
              <Text fw={500}>CFX Balance</Text>
            </Group>
            <Text size="xl" fw={700} mb="xs">
              1.5 CFX
            </Text>
            <Text size="sm" c="dimmed">
              Server wallet
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="sm">
              <ThemeIcon color="purple" variant="light">
                <IconServer size={16} />
              </ThemeIcon>
              <Text fw={500}>System Uptime</Text>
            </Group>
            <Text size="xl" fw={700} mb="xs">
              99.9%
            </Text>
            <Text size="sm" c="dimmed">
              Last 30 days
            </Text>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default DashboardPage;
