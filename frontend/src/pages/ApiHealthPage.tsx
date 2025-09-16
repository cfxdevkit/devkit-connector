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
  Button,
  Alert,
  Tabs,
  Divider,
} from "@mantine/core";
import {
  IconActivity,
  IconRefresh,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconInfoCircle,
  IconServer,
  IconNetwork,
  IconDatabase,
} from "@tabler/icons-react";
import { apiRequest } from "../utils/apiUtils";

interface ApiEndpoint {
  name: string;
  url: string;
  method: string;
  status: number;
  responseTime: number;
  lastCall: string;
  successRate: number;
  totalCalls: number;
  errorCount: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
}

interface ApiMetric {
  name: string;
  value: string | number;
  trend: "up" | "down" | "stable";
  change?: string;
  description: string;
}

const ApiHealthPage: React.FC = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [metrics, setMetrics] = useState<ApiMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallHealth, setOverallHealth] = useState<
    "healthy" | "warning" | "error"
  >("healthy");

  const loadApiEndpoints = async () => {
    try {
      // Mock API endpoints data
      const mockEndpoints: ApiEndpoint[] = [
        {
          name: "Wallet Status",
          url: "/api/wallet/status",
          method: "GET",
          status: 200,
          responseTime: 45,
          lastCall: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          successRate: 99.2,
          totalCalls: 1247,
          errorCount: 10,
          avgResponseTime: 42,
          minResponseTime: 15,
          maxResponseTime: 156,
        },
        {
          name: "Contract Status",
          url: "/api/contracts/status",
          method: "GET",
          status: 200,
          responseTime: 32,
          lastCall: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          successRate: 98.8,
          totalCalls: 892,
          errorCount: 11,
          avgResponseTime: 35,
          minResponseTime: 12,
          maxResponseTime: 89,
        },
        {
          name: "Create Delegation",
          url: "/api/wallet/delegation",
          method: "POST",
          status: 201,
          responseTime: 78,
          lastCall: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          successRate: 97.5,
          totalCalls: 156,
          errorCount: 4,
          avgResponseTime: 72,
          minResponseTime: 45,
          maxResponseTime: 234,
        },
        {
          name: "Contract Operation",
          url: "/api/contracts/operation",
          method: "POST",
          status: 200,
          responseTime: 156,
          lastCall: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          successRate: 96.3,
          totalCalls: 89,
          errorCount: 3,
          avgResponseTime: 142,
          minResponseTime: 67,
          maxResponseTime: 456,
        },
        {
          name: "Health Check",
          url: "/api/health",
          method: "GET",
          status: 200,
          responseTime: 15,
          lastCall: new Date(Date.now() - 1000 * 30).toISOString(),
          successRate: 99.9,
          totalCalls: 2341,
          errorCount: 2,
          avgResponseTime: 12,
          minResponseTime: 5,
          maxResponseTime: 28,
        },
        {
          name: "Wallet Load",
          url: "/api/wallet/load",
          method: "POST",
          status: 200,
          responseTime: 67,
          lastCall: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          successRate: 98.1,
          totalCalls: 234,
          errorCount: 4,
          avgResponseTime: 61,
          minResponseTime: 23,
          maxResponseTime: 123,
        },
      ];

      setEndpoints(mockEndpoints);

      // Calculate overall health
      const avgSuccessRate =
        mockEndpoints.reduce((sum, ep) => sum + ep.successRate, 0) /
        mockEndpoints.length;
      const hasErrors = mockEndpoints.some((ep) => ep.errorCount > 0);

      if (avgSuccessRate < 95) {
        setOverallHealth("error");
      } else if (avgSuccessRate < 98 || hasErrors) {
        setOverallHealth("warning");
      } else {
        setOverallHealth("healthy");
      }
    } catch (error) {
      console.error("Failed to load API endpoints:", error);
    }
  };

  const loadMetrics = async () => {
    setMetrics([
      {
        name: "Total Requests",
        value: "4,959",
        trend: "up",
        change: "+12%",
        description: "Requests in last 24 hours",
      },
      {
        name: "Average Response Time",
        value: "52ms",
        trend: "down",
        change: "-8ms",
        description: "Mean response time",
      },
      {
        name: "Error Rate",
        value: "1.2%",
        trend: "down",
        change: "-0.3%",
        description: "Failed requests percentage",
      },
      {
        name: "Success Rate",
        value: "98.8%",
        trend: "up",
        change: "+0.5%",
        description: "Successful requests percentage",
      },
      {
        name: "Peak Response Time",
        value: "456ms",
        trend: "down",
        change: "-23ms",
        description: "Slowest response time",
      },
      {
        name: "Active Endpoints",
        value: endpoints.length,
        trend: "stable",
        description: "Monitored endpoints",
      },
    ]);
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadApiEndpoints(), loadMetrics()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "green";
    if (status >= 300 && status < 400) return "yellow";
    return "red";
  };

  const getHealthColor = (health: string) => {
    switch (health) {
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

  const getHealthIcon = (health: string) => {
    switch (health) {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <IconTrendingUp size={12} color="green" />;
      case "down":
        return <IconTrendingDown size={12} color="red" />;
      case "stable":
        return <IconMinus size={12} color="blue" />;
      default:
        return null;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99) return "green";
    if (rate >= 95) return "yellow";
    return "red";
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={1} mb="sm">
              API Health Monitoring
            </Title>
            <Text c="dimmed" size="lg">
              Real-time API performance and health metrics
            </Text>
          </Box>
          <Group>
            <Badge
              color={getHealthColor(overallHealth)}
              leftSection={getHealthIcon(overallHealth)}
              size="lg"
            >
              {overallHealth.toUpperCase()}
            </Badge>
            <ActionIcon
              onClick={loadAllData}
              loading={loading}
              variant="light"
              color="blue"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* API Metrics */}
      <Grid>
        {metrics.map((metric, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm">
                  {metric.name}
                </Text>
                {getTrendIcon(metric.trend)}
              </Group>
              <Text size="xl" fw={700} mb="xs">
                {metric.value}
              </Text>
              <Text size="xs" c="dimmed" mb="xs">
                {metric.description}
              </Text>
              {metric.change && (
                <Text
                  size="xs"
                  c={
                    metric.trend === "up"
                      ? "green"
                      : metric.trend === "down"
                        ? "red"
                        : "blue"
                  }
                >
                  {metric.change}
                </Text>
              )}
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* API Endpoints Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon color="blue" variant="light" size="lg">
              <IconActivity size={24} />
            </ThemeIcon>
            <Box>
              <Title order={3}>API Endpoints</Title>
              <Text size="sm" c="dimmed">
                {endpoints.length} monitored endpoints
              </Text>
            </Box>
          </Group>
          <ActionIcon
            onClick={loadApiEndpoints}
            loading={loading}
            variant="light"
            color="blue"
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
                <Table.Th>Total Calls</Table.Th>
                <Table.Th>Last Call</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {endpoints.map((endpoint, index) => (
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
                    <Badge color={getStatusColor(endpoint.status)} size="sm">
                      {endpoint.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{endpoint.responseTime}ms</Text>
                    <Text size="xs" c="dimmed">
                      avg: {endpoint.avgResponseTime}ms
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Progress
                        value={endpoint.successRate}
                        size="sm"
                        color={getSuccessRateColor(endpoint.successRate)}
                        style={{ width: 60 }}
                      />
                      <Text size="sm">{endpoint.successRate}%</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {endpoint.totalCalls.toLocaleString()}
                    </Text>
                    {endpoint.errorCount > 0 && (
                      <Text size="xs" c="red">
                        {endpoint.errorCount} errors
                      </Text>
                    )}
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

      {/* Response Time Distribution */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group mb="md">
              <ThemeIcon color="green" variant="light" size="lg">
                <IconTrendingUp size={24} />
              </ThemeIcon>
              <Box>
                <Title order={3}>Response Time Distribution</Title>
                <Text size="sm" c="dimmed">
                  Performance breakdown by endpoint
                </Text>
              </Box>
            </Group>

            <Stack gap="sm">
              {endpoints.map((endpoint, index) => (
                <Paper key={index} p="sm" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      {endpoint.name}
                    </Text>
                    <Text size="sm" fw={500}>
                      {endpoint.avgResponseTime}ms
                    </Text>
                  </Group>
                  <Progress
                    value={(endpoint.avgResponseTime / 200) * 100}
                    size="sm"
                    color={
                      endpoint.avgResponseTime < 50
                        ? "green"
                        : endpoint.avgResponseTime < 100
                          ? "yellow"
                          : "red"
                    }
                  />
                  <Group justify="space-between" mt="xs">
                    <Text size="xs" c="dimmed">
                      Min: {endpoint.minResponseTime}ms
                    </Text>
                    <Text size="xs" c="dimmed">
                      Max: {endpoint.maxResponseTime}ms
                    </Text>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group mb="md">
              <ThemeIcon color="purple" variant="light" size="lg">
                <IconServer size={24} />
              </ThemeIcon>
              <Box>
                <Title order={3}>Error Analysis</Title>
                <Text size="sm" c="dimmed">
                  Error patterns and trends
                </Text>
              </Box>
            </Group>

            <Stack gap="sm">
              {endpoints
                .filter((ep) => ep.errorCount > 0)
                .map((endpoint, index) => (
                  <Paper key={index} p="sm" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm">
                        {endpoint.name}
                      </Text>
                      <Badge color="red" size="sm">
                        {endpoint.errorCount} errors
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mb="xs">
                      {endpoint.url}
                    </Text>
                    <Progress
                      value={(endpoint.errorCount / endpoint.totalCalls) * 100}
                      size="sm"
                      color="red"
                    />
                    <Text size="xs" c="dimmed" mt="xs">
                      Error rate:{" "}
                      {(
                        (endpoint.errorCount / endpoint.totalCalls) *
                        100
                      ).toFixed(2)}
                      %
                    </Text>
                  </Paper>
                ))}

              {endpoints.filter((ep) => ep.errorCount > 0).length === 0 && (
                <Alert
                  icon={<IconCheck size={16} />}
                  color="green"
                  variant="light"
                >
                  No errors detected in any endpoints!
                </Alert>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default ApiHealthPage;
