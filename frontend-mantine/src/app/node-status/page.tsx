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
  Alert,
  Progress,
  Code,
  Divider,
  ScrollArea,
  Loader,
} from "@mantine/core";
import {
  IconServer,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconActivity,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { nodeApi } from "../../services/api";

export default function NodeStatusPage() {
  const [nodeRunning, setNodeRunning] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<any>(null);
  const [nodeLogs, setNodeLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadNodeStatus();
    loadNodeLogs();
  }, []);

  const loadNodeStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await nodeApi.getNodeStatus();
      if (result.success) {
        setNodeStatus(result.data);
        setNodeRunning(result.data.running);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load node status");
    } finally {
      setLoading(false);
    }
  };

  const loadNodeLogs = async () => {
    try {
      const result = await nodeApi.getNodeLogs(100);
      if (result.success) {
        setNodeLogs(result.data.logs);
      }
    } catch (err) {
      console.error("Failed to load node logs:", err);
    }
  };

  const handleStartNode = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await nodeApi.startNode();
      if (result.success) {
        setSuccess(result.message || "Node started successfully");
        setTimeout(() => setSuccess(null), 3000);
        await loadNodeStatus();
        await loadNodeLogs();
      } else {
        setError(result.message || "Failed to start node");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to start node");
    } finally {
      setLoading(false);
    }
  };

  const handleStopNode = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await nodeApi.stopNode();
      if (result.success) {
        setSuccess(result.message || "Node stopped successfully");
        setTimeout(() => setSuccess(null), 3000);
        await loadNodeStatus();
        await loadNodeLogs();
      } else {
        setError(result.message || "Failed to stop node");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to stop node");
    } finally {
      setLoading(false);
    }
  };

  const handleRestartNode = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await nodeApi.restartNode();
      if (result.success) {
        setSuccess(result.message || "Node restart initiated");
        setTimeout(() => setSuccess(null), 3000);
        setTimeout(async () => {
          await loadNodeStatus();
          await loadNodeLogs();
        }, 3000);
      } else {
        setError(result.message || "Failed to restart node");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to restart node");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">
        Node Management
      </Title>
      <Text c="dimmed" mb="xl">
        Start, stop, and monitor your Conflux node
      </Text>

      {/* Status Messages */}
      {error && (
        <Alert color="red" icon={<IconX size={16} />} mb="md">
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="green" icon={<IconCheck size={16} />} mb="md">
          {success}
        </Alert>
      )}

      <Grid>
        {/* Node Control */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md" h="100%">
            <Group mb="md">
              <IconServer size={24} />
              <Title order={3}>Node Control</Title>
              <Badge color={nodeRunning ? "green" : "red"} size="sm">
                {nodeRunning ? "Running" : "Stopped"}
              </Badge>
            </Group>
            <Text mb="md">Control your Conflux node instance</Text>

            <Stack gap="md">
              <Group>
                <Button
                  leftSection={<IconPlayerPlay size={16} />}
                  color="green"
                  onClick={handleStartNode}
                  disabled={nodeRunning || loading}
                  loading={loading}
                >
                  Start Node
                </Button>
                <Button
                  leftSection={<IconPlayerStop size={16} />}
                  color="red"
                  onClick={handleStopNode}
                  disabled={!nodeRunning || loading}
                  loading={loading}
                >
                  Stop Node
                </Button>
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="outline"
                  onClick={handleRestartNode}
                  disabled={loading}
                  loading={loading}
                >
                  Restart
                </Button>
              </Group>

              {nodeRunning && (
                <Alert color="green" icon={<IconCheck size={16} />}>
                  Node is running and accepting connections
                </Alert>
              )}

              {!nodeRunning && (
                <Alert color="red" icon={<IconX size={16} />}>
                  Node is stopped. Start it to begin operations.
                </Alert>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Node Health */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md" h="100%">
            <Group mb="md">
              <IconActivity size={24} />
              <Title order={3}>Node Health</Title>
              <Badge
                color={nodeStatus?.healthy ? "green" : "red"}
                size="sm"
              >
                {nodeStatus?.healthy ? "Healthy" : "Unhealthy"}
              </Badge>
            </Group>
            <Text mb="md">Monitor node performance and health</Text>

            <Stack gap="md">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Status</Text>
                  <Text size="sm" fw={500}>
                    {nodeStatus?.running ? "Running" : "Stopped"}
                  </Text>
                </Group>
                <Progress
                  value={nodeStatus?.running ? 100 : 0}
                  color={nodeStatus?.running ? "green" : "red"}
                />
              </div>

              <Button
                leftSection={<IconRefresh size={16} />}
                variant="outline"
                fullWidth
                onClick={loadNodeStatus}
                loading={loading}
              >
                Refresh Health Check
              </Button>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Chain ID: {nodeStatus?.chainId || "Unknown"}
                </Text>
                <Text size="sm" c="dimmed">
                  Health: <Text span c={nodeStatus?.healthy ? "green" : "red"} fw={500}>
                    {nodeStatus?.healthy ? "Healthy" : "Unhealthy"}
                  </Text>
                </Text>
                <Text size="sm" c="dimmed">
                  Uptime: {nodeStatus?.uptime || "Unknown"}
                </Text>
                <Text size="sm" c="dimmed">
                  Process ID: {nodeStatus?.processId || "N/A"}
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Network Status */}
        <Grid.Col span={12}>
          <Card withBorder p="md">
            <Title order={3} mb="md">
              Network Status
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Title order={4}>eSpace (Port 8545)</Title>
                  <Group>
                    <Badge color="green" size="sm">
                      Connected
                    </Badge>
                    <Text size="sm" c="dimmed">
                      RPC Endpoint
                    </Text>
                  </Group>
                  <Code block>
                    {JSON.stringify(
                      {
                        network: "Conflux eSpace",
                        port: 8545,
                        chainId: 71,
                        status: "connected",
                        peers: 12,
                        blockNumber: 12345678,
                        gasPrice: "1000000000",
                      },
                      null,
                      2
                    )}
                  </Code>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Title order={4}>Core Space (Port 12537)</Title>
                  <Group>
                    <Badge color="green" size="sm">
                      Connected
                    </Badge>
                    <Text size="sm" c="dimmed">
                      RPC Endpoint
                    </Text>
                  </Group>
                  <Code block>
                    {JSON.stringify(
                      {
                        network: "Conflux Core",
                        port: 12537,
                        chainId: 1029,
                        status: "connected",
                        peers: 8,
                        epochNumber: 1234567,
                        gasPrice: "1000000000",
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

        {/* Node Logs */}
        <Grid.Col span={12}>
          <Card withBorder p="md">
            <Group mb="md">
              <IconActivity size={24} />
              <Title order={3}>Node Logs</Title>
              <Button
                leftSection={<IconRefresh size={16} />}
                variant="outline"
                size="sm"
                onClick={loadNodeLogs}
                loading={loading}
              >
                Refresh Logs
              </Button>
            </Group>
            <Text mb="md">Recent node activity and logs</Text>

            <ScrollArea h={300}>
              <Code block>
                {nodeLogs.length > 0 ? nodeLogs.join('\n') : 'No logs available. Start the node to see logs.'}
              </Code>
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
