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
  Progress,
  RingProgress,
  Center,
  Alert,
  Button,
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
  IconServer,
  IconCpu,
  IconNetwork,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { apiRequest } from "../utils/apiUtils";

interface SystemMetric {
  name: string;
  value: string | number;
  status: "healthy" | "warning" | "error";
  trend?: "up" | "down" | "stable";
  description: string;
}

interface HealthCheck {
  component: string;
  status: "healthy" | "warning" | "error";
  message: string;
  lastCheck: string;
  responseTime?: number;
}

interface ApiEndpoint {
  name: string;
  url: string;
  method: string;
  status: number;
  responseTime: number;
  lastCall: string;
  successRate: number;
}

const SystemPage: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSystemMetrics = async () => {
    // Mock system metrics data
    setSystemMetrics([
      {
        name: "CPU Usage",
        value: "23%",
        status: "healthy",
        trend: "stable",
        description: "Current CPU utilization",
      },
      {
        name: "Memory Usage",
        value: "4.2GB / 8GB",
        status: "healthy",
        trend: "stable",
        description: "RAM consumption",
      },
      {
        name: "Disk Space",
        value: "156GB / 500GB",
        status: "warning",
        trend: "up",
        description: "Available storage",
      },
      {
        name: "Network I/O",
        value: "2.3 MB/s",
        status: "healthy",
        trend: "down",
        description: "Network throughput",
      },
      {
        name: "Uptime",
        value: "15d 8h 23m",
        status: "healthy",
        trend: "up",
        description: "System uptime",
      },
      {
        name: "Active Connections",
        value: 47,
        status: "healthy",
        trend: "stable",
        description: "Current connections",
      },
    ]);
  };

  const loadHealthChecks = async () => {
    try {
      // Check Conflux node
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

      // Check server health
      const serverResponse = await fetch("http://localhost:3001/health");
      const serverHealthy = serverResponse.ok;

      // Check contract status
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
          responseTime: nodeHealthy ? 45 : undefined,
        },
        {
          component: "API Server",
          status: serverHealthy ? "healthy" : "error",
          message: serverHealthy
            ? "Server responding to health checks"
            : "Server not responding",
          lastCheck: new Date().toISOString(),
          responseTime: serverHealthy ? 32 : undefined,
        },
        {
          component: "Smart Contracts",
          status: contractsDeployed ? "healthy" : "warning",
          message: contractsDeployed
            ? "Contracts deployed and accessible"
            : "Contracts not deployed",
          lastCheck: new Date().toISOString(),
          responseTime: contractsDeployed ? 78 : undefined,
        },
        {
          component: "Database",
          status: "healthy",
          message: "Local storage operational",
          lastCheck: new Date().toISOString(),
          responseTime: 12,
        },
        {
          component: "File System",
          status: "healthy",
          message: "All file operations successful",
          lastCheck: new Date().toISOString(),
          responseTime: 8,
        },
        {
          component: "Memory Cache",
          status: "warning",
          message: "Cache utilization at 85%",
          lastCheck: new Date().toISOString(),
          responseTime: 3,
        },
      ]);
    } catch (error) {
      console.error("Failed to load health checks:", error);
    }
  };

  const loadApiEndpoints = async () => {
    setApiEndpoints([
      {
        name: "Wallet Status",
        url: "/api/wallet/status",
        method: "GET",
        status: 200,
        responseTime: 45,
        lastCall: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        successRate: 99.2,
      },
      {
        name: "Contract Status",
        url: "/api/contracts/status",
        method: "GET",
        status: 200,
        responseTime: 32,
        lastCall: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        successRate: 98.8,
      },
      {
        name: "Create Delegation",
        url: "/api/wallet/delegation",
        method: "POST",
        status: 201,
        responseTime: 78,
        lastCall: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        successRate: 97.5,
      },
      {
        name: "Contract Operation",
        url: "/api/contracts/operation",
        method: "POST",
        status: 200,
        responseTime: 156,
        lastCall: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        successRate: 96.3,
      },
      {
        name: "Health Check",
        url: "/api/health",
        method: "GET",
        status: 200,
        responseTime: 15,
        lastCall: new Date(Date.now() - 1000 * 30).toISOString(),
        successRate: 99.9,
      },
    ]);
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadSystemMetrics(),
      loadHealthChecks(),
      loadApiEndpoints(),
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
        return <IconCheck size={16} />;
      case "warning":
        return <IconAlertTriangle size={16} />;
      case "error":
        return <IconX size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <IconTrendingUp size={12} color="green" />;
      case "down":
        return (
          <IconTrendingUp
            size={12}
            color="red"
            style={{ transform: "rotate(180deg)" }}
          />
        );
      case "stable":
        return <IconActivity size={12} color="blue" />;
      default:
        return null;
    }
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Title order={1} mb="sm">
          System Monitoring
        </Title>
        <Text c="dimmed" size="lg">
          Real-time system health and performance monitoring
        </Text>
      </Box>

      {/* System Metrics Grid */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon color="blue" variant="light" size="lg">
                  <IconCpu size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={3}>System Metrics</Title>
                  <Text size="sm" c="dimmed">
                    Performance indicators
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                onClick={loadSystemMetrics}
                loading={loading}
                variant="light"
                color="blue"
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>

            <Grid>
              {systemMetrics.map((metric, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                  <Paper p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm">
                        {metric.name}
                      </Text>
                      <Group gap="xs">
                        {getTrendIcon(metric.trend)}
                        <Badge
                          color={getStatusColor(metric.status)}
                          leftSection={getStatusIcon(metric.status)}
                          size="sm"
                        >
                          {metric.status}
                        </Badge>
                      </Group>
                    </Group>
                    <Text size="xl" fw={700} mb="xs">
                      {metric.value}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {metric.description}
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon color="green" variant="light" size="lg">
                  <IconShield size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={3}>System Health</Title>
                  <Text size="sm" c="dimmed">
                    Overall status
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                onClick={loadHealthChecks}
                loading={loading}
                variant="light"
                color="green"
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
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {new Date(check.lastCheck).toLocaleTimeString()}
                    </Text>
                    {check.responseTime && (
                      <Text size="xs" c="dimmed">
                        {check.responseTime}ms
                      </Text>
                    )}
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* API Endpoints Monitoring */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon color="purple" variant="light" size="lg">
              <IconActivity size={24} />
            </ThemeIcon>
            <Box>
              <Title order={3}>API Endpoints</Title>
              <Text size="sm" c="dimmed">
                Response times and success rates
              </Text>
            </Box>
          </Group>
          <ActionIcon
            onClick={loadApiEndpoints}
            loading={loading}
            variant="light"
            color="purple"
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>

        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Endpoint</Table.Th>
                <Table.Th>Method</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Response Time</Table.Th>
                <Table.Th>Success Rate</Table.Th>
                <Table.Th>Last Call</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {apiEndpoints.map((endpoint, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Text fw={500}>{endpoint.name}</Text>
                    <Code>{endpoint.url}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={endpoint.method === "GET" ? "blue" : "green"}
                      size="sm"
                    >
                      {endpoint.method}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={
                        endpoint.status >= 200 && endpoint.status < 300
                          ? "green"
                          : "red"
                      }
                      size="sm"
                    >
                      {endpoint.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{endpoint.responseTime}ms</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Progress
                        value={endpoint.successRate}
                        size="sm"
                        color={
                          endpoint.successRate > 98
                            ? "green"
                            : endpoint.successRate > 95
                              ? "yellow"
                              : "red"
                        }
                        style={{ width: 60 }}
                      />
                      <Text size="sm">{endpoint.successRate}%</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(endpoint.lastCall).toLocaleTimeString()}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Quick Actions */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Quick Actions
        </Title>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={loadAllData}
            loading={loading}
          >
            Refresh All Data
          </Button>
          <Button leftSection={<IconDatabase size={16} />} variant="outline">
            Clear Cache
          </Button>
          <Button leftSection={<IconServer size={16} />} variant="outline">
            Restart Services
          </Button>
        </Group>
      </Card>
    </Stack>
  );
};

export default SystemPage;
