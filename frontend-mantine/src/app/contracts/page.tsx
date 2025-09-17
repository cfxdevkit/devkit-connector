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
  Select,
  Alert,
  Code,
  Table,
  ActionIcon,
  Loader,
  Checkbox,
  Divider,
} from "@mantine/core";
import {
  IconDatabase,
  IconUpload,
  IconRefresh,
  IconEye,
  IconTrash,
  IconCopy,
  IconCheck,
  IconX,
  IconFileCode,
  IconRocket,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { hardhatApi } from "../../services/api";

export default function ContractsPage() {
  const [deploying, setDeploying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hardhat Ignition state
  const [ignitionModules, setIgnitionModules] = useState<any[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<any[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Deployment console state
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [showDeploymentConsole, setShowDeploymentConsole] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadIgnitionModules();
    loadDeploymentHistory();
  }, []);

  const loadIgnitionModules = async () => {
    try {
      const result = await hardhatApi.getModules();
      if (result.success && result.data) {
        setIgnitionModules(result.data);
        if (result.data.length > 0 && !selectedModule) {
          setSelectedModule(result.data[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to load Ignition modules:", err);
    }
  };

  const loadDeploymentHistory = async () => {
    try {
      const result = await hardhatApi.getDeployments();
      if (result.success && result.data) {
        setDeploymentHistory(result.data);
      }
    } catch (err) {
      console.error("Failed to load deployment history:", err);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDeploymentLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setDeploymentLogs([]);
  };

  const handleDeploy = async () => {
    if (selectedModules.length === 0) {
      setError("Please select at least one module to deploy");
      return;
    }

    setDeploying(true);
    setError(null);
    setSuccess(null);
    clearLogs();
    setShowDeploymentConsole(true);

    addLog(`🚀 Starting deployment of ${selectedModules.length} module(s)...`);
    addLog(`📡 Connecting to Conflux node at localhost:8545...`);

    let successCount = 0;
    let failCount = 0;

    try {
      for (const moduleName of selectedModules) {
        addLog(`🔨 Deploying ${moduleName} module...`);
        
        const result = await hardhatApi.deployModule(
          moduleName,
          "confluxESpaceLocal"
        );

        if (result.success && result.data) {
          addLog(`✅ ${moduleName} deployment successful!`);
          addLog(`📋 Deployed contracts:`);

          if (result.data.contracts && result.data.contracts.length > 0) {
            result.data.contracts.forEach((contract: any) => {
              addLog(`  • ${contract.name}: ${contract.address}`);
              if (contract.transactionHash) {
                addLog(`    Transaction: ${contract.transactionHash}`);
              }
            });
          }
          successCount++;
        } else {
          addLog(`❌ ${moduleName} deployment failed: ${result.error || "Unknown error"}`);
          if (result.details) {
            addLog(`📝 Details: ${result.details}`);
          }
          failCount++;
        }
      }

      // Refresh deployment history
      addLog(`🔄 Refreshing deployment history...`);
      await loadDeploymentHistory();
      addLog(`✅ Deployment process complete!`);

      if (successCount > 0) {
        setSuccess(`Successfully deployed ${successCount} module(s)${failCount > 0 ? `, ${failCount} failed` : ''}`);
        setTimeout(() => setSuccess(null), 10000);
      }

      if (failCount > 0) {
        setError(`${failCount} module(s) failed to deploy`);
      }

      // Clear selections after deployment
      setSelectedModules([]);

    } catch (err: any) {
      addLog(`❌ Deployment error: ${err.message || "Unknown error"}`);
      setError("Failed to deploy contracts");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">
        Contract Deployment
      </Title>
      <Text c="dimmed" mb="xl">
        Deploy and manage smart contracts using Hardhat Ignition
      </Text>

      {/* Error/Success Messages */}
      {error && (
        <Alert
          color="red"
          mb="md"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          color="green"
          mb="md"
          onClose={() => setSuccess(null)}
          withCloseButton
        >
          {success}
        </Alert>
      )}

      <Grid>
        {/* Available Ignition Modules */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md" h="100%">
            <Group mb="md">
              <IconFileCode size={24} />
              <Title order={3}>Available Modules</Title>
              <Badge color="blue" size="sm">
                {ignitionModules.length} modules
              </Badge>
            </Group>
            <Text mb="md">Select an Ignition module to deploy</Text>

            <Stack gap="sm">
              {ignitionModules.map((module) => (
                <Card key={module.name} withBorder p="sm" bg="blue.0">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">
                        {module.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {module.description}
                      </Text>
                    </div>
                    <Badge color="blue" size="sm">
                      {module.contracts.length} contract(s)
                    </Badge>
                  </Group>
                </Card>
              ))}

              {ignitionModules.length === 0 && (
                <Alert color="yellow" icon={<IconFileCode size={16} />}>
                  No Ignition modules found. Make sure your contracts are
                  properly configured.
                </Alert>
              )}
            </Stack>

            <Divider my="md" />
            
            <Text fw={500} size="sm" mb="sm">
              Select modules to deploy:
            </Text>
            
            <Stack gap="sm">
              {ignitionModules.map((module) => (
                <Card key={module.name} withBorder p="sm">
                  <Group justify="space-between">
                    <Checkbox
                      checked={selectedModules.includes(module.name)}
                      onChange={(event) => {
                        if (event.currentTarget.checked) {
                          setSelectedModules([...selectedModules, module.name]);
                        } else {
                          setSelectedModules(selectedModules.filter(m => m !== module.name));
                        }
                      }}
                      label={
                        <div>
                          <Text fw={500} size="sm">
                            {module.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {module.description}
                          </Text>
                        </div>
                      }
                    />
                    <Badge color="blue" size="sm">
                      {module.contracts.length} contract(s)
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>

            <Button
              leftSection={<IconRocket size={16} />}
              onClick={handleDeploy}
              disabled={selectedModules.length === 0 || deploying}
              loading={deploying}
              fullWidth
              mt="md"
            >
              {deploying ? "Deploying..." : `Deploy ${selectedModules.length} Module(s)`}
            </Button>
          </Card>
        </Grid.Col>

        {/* Deployment Status */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md" h="100%">
            <Group mb="md">
              <IconDatabase size={24} />
              <Title order={3}>Deployment Status</Title>
              <Button
                leftSection={<IconRefresh size={16} />}
                variant="outline"
                size="sm"
                onClick={loadDeploymentHistory}
                loading={loading}
              >
                Refresh
              </Button>
            </Group>
            <Text mb="md">Recent deployment activities</Text>

            <Stack gap="sm">
              {deploymentHistory.length > 0 ? (
                deploymentHistory.slice(0, 5).map((deployment, idx) => (
                  <Card key={idx} withBorder p="sm">
                    <Group justify="space-between">
                      <div>
                        <Text fw={500} size="sm">
                          {deployment.contract}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Module: {deployment.module}
                        </Text>
                        <Code size="xs">{deployment.address}</Code>
                      </div>
                      <Badge color="green" size="sm">
                        Deployed
                      </Badge>
                    </Group>
                  </Card>
                ))
              ) : (
                <Alert color="blue" icon={<IconDatabase size={16} />}>
                  No deployments yet. Deploy your first module to get started.
                </Alert>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Deployment History Table */}
        <Grid.Col span={12}>
          <Card withBorder p="md">
            <Group mb="md">
              <IconDatabase size={24} />
              <Title order={3}>Deployment History</Title>
              <Badge color="blue" size="sm">
                {deploymentHistory.length} deployments
              </Badge>
              <Button
                leftSection={<IconRefresh size={16} />}
                variant="outline"
                size="sm"
                onClick={loadDeploymentHistory}
                loading={loading}
              >
                Refresh
              </Button>
            </Group>

            {deploymentHistory.length > 0 ? (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Contract</Table.Th>
                    <Table.Th>Module</Table.Th>
                    <Table.Th>Address</Table.Th>
                    <Table.Th>Transaction</Table.Th>
                    <Table.Th>Chain ID</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {deploymentHistory.map((deployment, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>
                        <Text fw={500}>{deployment.contract}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="blue" size="sm">
                          {deployment.module}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Code size="xs">{deployment.address}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code size="xs">{deployment.transactionHash}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="green" size="sm">
                          {deployment.chainId}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon variant="subtle" size="sm">
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" size="sm">
                            <IconCopy size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Alert color="blue" icon={<IconDatabase size={16} />}>
                No deployments found. Deploy your first module to get started.
              </Alert>
            )}
          </Card>
        </Grid.Col>
      </Grid>

    </Container>
  );
}
