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
  RingProgress,
  Center,
} from "@mantine/core";
import {
  IconNetwork,
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
  IconDatabase,
  IconActivity,
  IconShield,
} from "@tabler/icons-react";

interface NodeMetric {
  name: string;
  value: string | number;
  status: "healthy" | "warning" | "error";
  trend: "up" | "down" | "stable";
  change?: string;
  description: string;
}

interface BlockInfo {
  number: number;
  hash: string;
  timestamp: string;
  gasUsed: string;
  gasLimit: string;
  miner: string;
  transactions: number;
}

interface NetworkInfo {
  peerCount: number;
  networkId: string;
  chainId: string;
  protocolVersion: string;
  syncing: boolean;
  blockHeight: number;
  latestBlock: string;
}

const NodeStatusPage: React.FC = () => {
  const [nodeMetrics, setNodeMetrics] = useState<NodeMetric[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<BlockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodeStatus, setNodeStatus] = useState<"healthy" | "warning" | "error">(
    "healthy"
  );

  const loadNodeMetrics = async () => {
    try {
      // Check if Conflux node is responding
      const response = await fetch("http://localhost:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
      });

      const isHealthy = response.ok;
      setNodeStatus(isHealthy ? "healthy" : "error");

      // Mock metrics data
      setNodeMetrics([
        {
          name: "Block Height",
          value: "1,234,567",
          status: isHealthy ? "healthy" : "error",
          trend: "up",
          change: "+1,234",
          description: "Current block number",
        },
        {
          name: "Peer Count",
          value: isHealthy ? 8 : 0,
          status: isHealthy ? "healthy" : "error",
          trend: "stable",
          change: "+2",
          description: "Connected peers",
        },
        {
          name: "Network ID",
          value: "0x1",
          status: isHealthy ? "healthy" : "error",
          trend: "stable",
          description: "Network identifier",
        },
        {
          name: "Gas Price",
          value: "20 Gwei",
          status: isHealthy ? "healthy" : "error",
          trend: "down",
          change: "-2 Gwei",
          description: "Current gas price",
        },
        {
          name: "Sync Status",
          value: isHealthy ? "Synced" : "Not Synced",
          status: isHealthy ? "healthy" : "error",
          trend: "stable",
          description: "Blockchain sync status",
        },
        {
          name: "Uptime",
          value: isHealthy ? "15d 8h 23m" : "0m",
          status: isHealthy ? "healthy" : "error",
          trend: "up",
          description: "Node uptime",
        },
      ]);
    } catch (error) {
      console.error("Failed to load node metrics:", error);
      setNodeStatus("error");
    }
  };

  const loadNetworkInfo = async () => {
    try {
      const response = await fetch("http://localhost:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
      });

      if (response.ok) {
        setNetworkInfo({
          peerCount: 8,
          networkId: "0x1",
          chainId: "0x1",
          protocolVersion: "0x5f",
          syncing: false,
          blockHeight: 1234567,
          latestBlock: "0x12d687...",
        });
      }
    } catch (error) {
      console.error("Failed to load network info:", error);
    }
  };

  const loadRecentBlocks = async () => {
    // Mock recent blocks data
    setRecentBlocks([
      {
        number: 1234567,
        hash: "0x12d687...",
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        gasUsed: "21,000",
        gasLimit: "30,000,000",
        miner: "0xf39fd6...",
        transactions: 15,
      },
      {
        number: 1234566,
        hash: "0x8a4b2c...",
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        gasUsed: "18,500",
        gasLimit: "30,000,000",
        miner: "0xf39fd6...",
        transactions: 12,
      },
      {
        number: 1234565,
        hash: "0x3e7f9a...",
        timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
        gasUsed: "25,000",
        gasLimit: "30,000,000",
        miner: "0xf39fd6...",
        transactions: 18,
      },
      {
        number: 1234564,
        hash: "0x9b1c5d...",
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        gasUsed: "22,000",
        gasLimit: "30,000,000",
        miner: "0xf39fd6...",
        transactions: 14,
      },
      {
        number: 1234563,
        hash: "0x6f8e2a...",
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        gasUsed: "19,500",
        gasLimit: "30,000,000",
        miner: "0xf39fd6...",
        transactions: 11,
      },
    ]);
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadNodeMetrics(),
      loadNetworkInfo(),
      loadRecentBlocks(),
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

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={1} mb="sm">
              Conflux Node Status
            </Title>
            <Text c="dimmed" size="lg">
              Blockchain node health and network monitoring
            </Text>
          </Box>
          <Group>
            <Badge
              color={getStatusColor(nodeStatus)}
              leftSection={getStatusIcon(nodeStatus)}
              size="lg"
            >
              {nodeStatus.toUpperCase()}
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

      {/* Node Status Overview */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon
              color={getStatusColor(nodeStatus)}
              variant="light"
              size="lg"
            >
              <IconServer size={24} />
            </ThemeIcon>
            <Box>
              <Title order={3}>Node Status</Title>
              <Text size="sm" c="dimmed">
                {nodeStatus === "healthy" && "Node is operational and synced"}
                {nodeStatus === "warning" && "Node has some issues"}
                {nodeStatus === "error" && "Node is not responding"}
              </Text>
            </Box>
          </Group>
          <RingProgress
            size={80}
            thickness={8}
            sections={[
              {
                value:
                  nodeStatus === "healthy"
                    ? 100
                    : nodeStatus === "warning"
                      ? 70
                      : 0,
                color: getStatusColor(nodeStatus),
              },
            ]}
            label={
              <Center>
                <Text size="xs" fw={700}>
                  {nodeStatus === "healthy"
                    ? "100%"
                    : nodeStatus === "warning"
                      ? "70%"
                      : "0%"}
                </Text>
              </Center>
            }
          />
        </Group>
      </Card>

      {/* Node Metrics */}
      <Grid>
        {nodeMetrics.map((metric, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
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

      <Grid>
        {/* Network Information */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group mb="md">
              <ThemeIcon color="blue" variant="light" size="lg">
                <IconNetwork size={24} />
              </ThemeIcon>
              <Box>
                <Title order={3}>Network Information</Title>
                <Text size="sm" c="dimmed">
                  Blockchain network details
                </Text>
              </Box>
            </Group>

            {networkInfo ? (
              <Stack gap="md">
                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      Peer Count
                    </Text>
                    <Text size="sm" fw={500}>
                      {networkInfo.peerCount}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Connected peers
                  </Text>
                </Paper>

                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      Network ID
                    </Text>
                    <Code>{networkInfo.networkId}</Code>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Network identifier
                  </Text>
                </Paper>

                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      Chain ID
                    </Text>
                    <Code>{networkInfo.chainId}</Code>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Blockchain chain ID
                  </Text>
                </Paper>

                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      Protocol Version
                    </Text>
                    <Code>{networkInfo.protocolVersion}</Code>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Ethereum protocol version
                  </Text>
                </Paper>

                <Paper p="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      Sync Status
                    </Text>
                    <Badge
                      color={networkInfo.syncing ? "yellow" : "green"}
                      size="sm"
                    >
                      {networkInfo.syncing ? "Syncing" : "Synced"}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Blockchain synchronization
                  </Text>
                </Paper>
              </Stack>
            ) : (
              <Alert icon={<IconX size={16} />} color="red" variant="light">
                Unable to connect to the Conflux node. Please check if the node
                is running.
              </Alert>
            )}
          </Card>
        </Grid.Col>

        {/* Recent Blocks */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group mb="md">
              <ThemeIcon color="green" variant="light" size="lg">
                <IconDatabase size={24} />
              </ThemeIcon>
              <Box>
                <Title order={3}>Recent Blocks</Title>
                <Text size="sm" c="dimmed">
                  Latest blockchain blocks
                </Text>
              </Box>
            </Group>

            <ScrollArea h={400}>
              <Stack gap="sm">
                {recentBlocks.map((block, index) => (
                  <Paper key={index} p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm">
                        Block #{block.number}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(block.timestamp).toLocaleTimeString()}
                      </Text>
                    </Group>
                    <Code
                      style={{ display: "block", wordBreak: "break-all" }}
                      mb="xs"
                    >
                      {block.hash}
                    </Code>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" c="dimmed">
                        Gas: {block.gasUsed} / {block.gasLimit}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {block.transactions} txns
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Miner: {block.miner}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Node Actions */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Node Actions
        </Title>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={loadAllData}
            loading={loading}
          >
            Refresh Status
          </Button>
          <Button leftSection={<IconActivity size={16} />} variant="outline">
            View Logs
          </Button>
          <Button leftSection={<IconShield size={16} />} variant="outline">
            Restart Node
          </Button>
        </Group>
      </Card>
    </Stack>
  );
};

export default NodeStatusPage;
