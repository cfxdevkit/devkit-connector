'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Progress,
  Stack,
  Stepper,
  Text,
  Title,
} from '@mantine/core';
import {
  IconChecklist,
  IconDashboard,
  IconPlayerPlay,
  IconRefresh,
  IconRocket,
  IconSettings,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { contractApi, nodeApi, systemApi, walletApi } from '../services/api';
import type { ChecklistStep, DashboardState } from '../types/dashboard';

export default function DashboardContent() {
  const [loading, setLoading] = useState(false);
  const [serverWalletLoaded, setServerWalletLoaded] = useState(false);
  const [nodeRunning, setNodeRunning] = useState(false);
  const [contractsDeployed, setContractsDeployed] = useState(0);
  const [systemHealth, setSystemHealth] = useState<{
    status: string;
    timestamp?: string;
  } | null>(null);
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    balance?: string;
  } | null>(null);
  const [contractInfo, setContractInfo] = useState<{
    espace?: { deployed: boolean };
    core?: { deployed: boolean };
  } | null>(null);
  const [networkInfo, setNetworkInfo] = useState<{
    chainId?: string;
    healthy?: boolean;
    uptime?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Streamlined checklist steps
  const [checklistSteps, setChecklistSteps] = useState<ChecklistStep[]>([
    {
      id: 1,
      title: 'Check Server & Wallet Status',
      completed: false,
      description: 'Verify server is running and wallet is loaded',
    },
    {
      id: 2,
      title: 'Configure & Start Node',
      completed: false,
      description: 'Review node configuration and start Conflux node',
    },
    {
      id: 3,
      title: 'Deploy Smart Contracts',
      completed: false,
      description: 'Deploy contracts using Hardhat',
    },
  ]);

  const loadSystemStatus = useCallback(async () => {
    try {
      const health = await systemApi.healthCheck();
      setSystemHealth(health);

      // Get real node status
      try {
        const nodeStatus = await nodeApi.getNodeStatus();
        if (nodeStatus.success) {
          setNodeRunning(nodeStatus.data.running);
          setNetworkInfo({
            chainId: nodeStatus.data.chainId,
            healthy: nodeStatus.data.healthy,
            uptime: nodeStatus.data.uptime,
          });
        }
      } catch (_nodeErr) {
        setNodeRunning(false);
      }
    } catch (err) {
      console.error('Failed to load system status:', err);
      setNodeRunning(false);
    }
  }, []);

  const checkWalletStatus = useCallback(async () => {
    try {
      const walletResult = await walletApi.getWalletInfo();
      if (walletResult.success && walletResult.data) {
        setServerWalletLoaded(true);
        setWalletInfo(walletResult.data);
      } else {
        setServerWalletLoaded(false);
      }
    } catch (_err) {
      setServerWalletLoaded(false);
    }
  }, []);

  const checkContractStatus = useCallback(async () => {
    try {
      const status = await contractApi.getStatus();
      if (status.success && status.data) {
        setContractInfo(status.data);
        const deployedCount =
          (status.data.espace?.deployed ? 1 : 0) +
          (status.data.core?.deployed ? 1 : 0);
        setContractsDeployed(deployedCount);
      }
    } catch (err) {
      console.error('Failed to check contract status:', err);
    }
  }, []);

  const handleLoadServerWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await walletApi.loadWallet();
      if (result.success) {
        setServerWalletLoaded(true);
        setWalletInfo(result.data);
        setSuccess('Server wallet loaded successfully');
      } else {
        setError(result.error || 'Failed to load wallet');
      }
    } catch (_err) {
      setError('Failed to load server wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data and auto-load server wallet
  useEffect(() => {
    const initializeSystem = async () => {
      await loadSystemStatus();
      await checkWalletStatus();
      await checkContractStatus();

      // Auto-load server wallet if not already loaded
      if (!serverWalletLoaded) {
        await handleLoadServerWallet();
      }
    };

    initializeSystem();
  }, [
    checkContractStatus,
    checkWalletStatus,
    handleLoadServerWallet,
    loadSystemStatus,
    serverWalletLoaded,
  ]);

  // Update checklist progress based on current state
  const updateChecklistProgress = useCallback(() => {
    setChecklistSteps((prev: ChecklistStep[]) =>
      prev.map((step: ChecklistStep, index: number) => {
        switch (index) {
          case 0: // Check Server & Wallet Status
            return {
              ...step,
              completed:
                serverWalletLoaded && systemHealth?.status === 'healthy',
            };
          case 1: // Configure & Start Node
            return { ...step, completed: nodeRunning && serverWalletLoaded };
          case 2: // Deploy Smart Contracts
            return { ...step, completed: contractsDeployed > 0 };
          default:
            return step;
        }
      })
    );
  }, [
    serverWalletLoaded,
    systemHealth?.status,
    nodeRunning,
    contractsDeployed,
  ]);

  // Auto-advance to step 2 when server wallet is loaded
  useEffect(() => {
    if (
      serverWalletLoaded &&
      systemHealth?.status === 'healthy' &&
      activeStep === 0
    ) {
      setActiveStep(1);
    }
  }, [serverWalletLoaded, systemHealth, activeStep]);

  // Auto-advance to step 3 when node is running
  useEffect(() => {
    if (nodeRunning && serverWalletLoaded && activeStep === 1) {
      setActiveStep(2);
    }
  }, [nodeRunning, serverWalletLoaded, activeStep]);

  // Update checklist progress when relevant state changes
  useEffect(() => {
    updateChecklistProgress();
  }, [updateChecklistProgress]);

  const handleStartNode = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await nodeApi.startNode();
      if (result.success) {
        setNodeRunning(true);
        setSuccess('Conflux node started successfully');
        await loadSystemStatus(); // Refresh status
      } else {
        setError(result.error || 'Failed to start node');
      }
    } catch (_err) {
      setError('Failed to start Conflux node');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contractApi.deployContracts();
      if (result.success) {
        setContractsDeployed(1);
        setSuccess('Contracts deployed successfully');
        await checkContractStatus(); // Refresh status
      } else {
        setError(result.error || 'Failed to deploy contracts');
      }
    } catch (_err) {
      setError('Failed to deploy contracts');
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadSystemStatus();
      await checkWalletStatus();
      await checkContractStatus();
      setSuccess('System diagnostics completed');
    } catch (_err) {
      setError('Diagnostics failed');
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = checklistSteps.filter((step) => step.completed).length;
  const totalSteps = checklistSteps.length;

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={1} c="blue">
              <IconDashboard size={32} style={{ marginRight: 8 }} />
              Conflux DevKit Dashboard
            </Title>
            <Text c="dimmed" size="sm">
              Development environment setup and management
            </Text>
          </div>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={runDiagnostics}
            loading={loading}
            variant="light"
          >
            Refresh Status
          </Button>
        </Group>

        {/* Error/Success Messages */}
        {error && (
          <Alert
            color="red"
            title="Error"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            color="green"
            title="Success"
            withCloseButton
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        {/* Status Overview */}
        <Card withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Setup Progress</Title>
              <Badge
                color={completedSteps === totalSteps ? 'green' : 'blue'}
                size="lg"
              >
                {completedSteps}/{totalSteps} Steps Complete
              </Badge>
            </Group>

            <Progress
              value={(completedSteps / totalSteps) * 100}
              size="lg"
              radius="md"
              color={completedSteps === totalSteps ? 'green' : 'blue'}
            />

            <Text size="sm" c="dimmed">
              {completedSteps} of {totalSteps} setup steps completed
            </Text>
          </Stack>
        </Card>

        {/* Stepper Checklist */}
        <Card withBorder>
          <Stack gap="md">
            <Group>
              <IconChecklist size={20} />
              <Title order={3}>Development Setup Checklist</Title>
            </Group>

            <Stepper active={activeStep} breakpoint="sm">
              {checklistSteps.map((step, index) => (
                <Stepper.Step
                  key={step.id}
                  label={step.title}
                  description={step.description}
                  completed={step.completed}
                  loading={loading && activeStep === index}
                >
                  <Stack gap="md" mt="md">
                    <Text size="sm" c="dimmed">
                      {step.description}
                    </Text>

                    {index === 0 && (
                      <Group>
                        <Button
                          onClick={handleLoadServerWallet}
                          loading={loading}
                          disabled={serverWalletLoaded}
                        >
                          {serverWalletLoaded
                            ? 'Wallet Loaded'
                            : 'Load Server Wallet'}
                        </Button>
                      </Group>
                    )}

                    {index === 1 && (
                      <Group>
                        <Button
                          onClick={handleStartNode}
                          loading={loading}
                          disabled={nodeRunning}
                        >
                          {nodeRunning ? 'Node Running' : 'Start Conflux Node'}
                        </Button>
                      </Group>
                    )}

                    {index === 2 && (
                      <Group>
                        <Button
                          onClick={handleDeployContracts}
                          loading={loading}
                          disabled={contractsDeployed > 0}
                        >
                          {contractsDeployed > 0
                            ? 'Contracts Deployed'
                            : 'Deploy Contracts'}
                        </Button>
                      </Group>
                    )}
                  </Stack>
                </Stepper.Step>
              ))}
            </Stepper>
          </Stack>
        </Card>

        {/* System Information */}
        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>System Status</Title>
            <Group grow>
              <div>
                <Text size="sm" c="dimmed">
                  Node Status
                </Text>
                <Badge color={nodeRunning ? 'green' : 'red'}>
                  {nodeRunning ? 'Running' : 'Stopped'}
                </Badge>
                {networkInfo && (
                  <Text size="xs" c="dimmed" mt={4}>
                    Chain ID: {networkInfo.chainId || 'N/A'}
                  </Text>
                )}
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Server Wallet
                </Text>
                <Badge color={serverWalletLoaded ? 'green' : 'yellow'}>
                  {serverWalletLoaded ? 'Loaded' : 'Not Loaded'}
                </Badge>
                {walletInfo && (
                  <Text size="xs" c="dimmed" mt={4}>
                    Address: {walletInfo.address?.slice(0, 8)}...
                  </Text>
                )}
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Contracts
                </Text>
                <Badge color={contractsDeployed > 0 ? 'green' : 'yellow'}>
                  {contractsDeployed} Deployed
                </Badge>
                {contractInfo && (
                  <Text size="xs" c="dimmed" mt={4}>
                    Core: {contractInfo.core?.deployed ? '✓' : '✗'} | Espace:{' '}
                    {contractInfo.espace?.deployed ? '✓' : '✗'}
                  </Text>
                )}
              </div>
            </Group>
          </Stack>
        </Card>

        {/* Quick Actions */}
        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>Quick Actions</Title>
            <Group>
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                variant="filled"
                disabled={completedSteps !== totalSteps}
                onClick={() => setSuccess('Development environment ready!')}
              >
                Start Development
              </Button>
              <Button
                leftSection={<IconRocket size={16} />}
                variant="light"
                disabled={!nodeRunning}
                onClick={handleDeployContracts}
              >
                Deploy Contracts
              </Button>
              <Button
                leftSection={<IconSettings size={16} />}
                variant="outline"
                onClick={() => setSuccess('Configuration panel coming soon!')}
              >
                Configure
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
