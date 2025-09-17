"use client";

import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Button,
  Badge,
  Alert,
  Stepper,
  Progress,
  Modal,
  TextInput,
  Select,
  Code,
  Checkbox,
  Loader,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconRefresh,
  IconCheck,
  IconX,
  IconChecklist,
  IconSettings,
  IconRocket,
  IconDashboard,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import {
  walletApi,
  contractApi,
  systemApi,
  nodeApi,
  hardhatApi,
} from "../../services/api";
// Removed wallet connection imports - focusing on server wallet only

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [serverWalletLoaded, setServerWalletLoaded] = useState(false);
  const [nodeRunning, setNodeRunning] = useState(true);
  const [contractsDeployed, setContractsDeployed] = useState(0);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hardhat Ignition state
  const [ignitionModules, setIgnitionModules] = useState<any[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [deploymentInProgress, setDeploymentInProgress] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Removed wagmi hooks - using server wallet only

  // Checklist state
  const [activeStep, setActiveStep] = useState(0);
  const [checklistSteps, setChecklistSteps] = useState([
    {
      id: 1,
      title: "Check Server & Wallet Status",
      completed: false,
      description: "Verify server is running and wallet is loaded",
    },
    {
      id: 2,
      title: "Configure & Start Node",
      completed: false,
      description: "Review node configuration and start Conflux node",
    },
    {
      id: 3,
      title: "Deploy Smart Contracts",
      completed: false,
      description:
        "Deploy contracts using Hardhat (implementation to be reviewed)",
    },
  ]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [contractName, setContractName] = useState("");
  const [contractType, setContractType] = useState("");

  // Load initial data and auto-load server wallet
  useEffect(() => {
    const initializeSystem = async () => {
      await loadSystemStatus();
      await checkWalletStatus();
      await checkContractStatus();
      await loadIgnitionModules();
      await loadDeploymentHistory();

      // Auto-load server wallet if not already loaded
      if (!serverWalletLoaded) {
        await handleLoadServerWallet();
      }
    };

    initializeSystem();
  }, []); // Empty dependency array - only run once on mount

  // Auto-advance to step 2 when server wallet is loaded
  useEffect(() => {
    if (
      serverWalletLoaded &&
      systemHealth?.status === "healthy" &&
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
  }, [serverWalletLoaded, systemHealth, nodeRunning, contractsDeployed]);

  // Update checklist progress based on current state
  const updateChecklistProgress = () => {
    setChecklistSteps((prev: any[]) =>
      prev.map((step: any, index: number) => {
        switch (index) {
          case 0: // Check Server & Wallet Status
            return {
              ...step,
              completed:
                serverWalletLoaded && systemHealth?.status === "healthy",
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
  };

  const loadSystemStatus = async () => {
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
      } catch (nodeErr) {
        setNodeRunning(false);
      }
    } catch (err) {
      console.error("Failed to load system status:", err);
      setNodeRunning(false);
    }
  };

  const checkWalletStatus = async () => {
    try {
      // Check if server wallet is loaded by trying to load it
      const walletResult = await walletApi.loadWallet();
      if (walletResult.success && walletResult.data) {
        setServerWalletLoaded(true);
        // Store wallet info for display
        setWalletInfo(walletResult.data);
      } else {
        setServerWalletLoaded(false);
      }
    } catch (err) {
      setServerWalletLoaded(false);
    }
  };

  const checkContractStatus = async () => {
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
      console.error("Failed to check contract status:", err);
    }
  };

  const loadIgnitionModules = async () => {
    try {
      const result = await hardhatApi.getModules();
      if (result.success && result.data) {
        setIgnitionModules(result.data);
        if (result.data.length > 0) {
          // Select all modules by default
          setSelectedModules(result.data.map((module: any) => module.name));
          if (!selectedModule) {
            setSelectedModule(result.data[0].name);
          }
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
        setContractsDeployed(result.data.length);
      }
    } catch (err) {
      console.error("Failed to load deployment history:", err);
    }
  };

  const handleLoadServerWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await walletApi.loadWallet();
      if (result.success) {
        setServerWalletLoaded(true);
        setWalletInfo(result.data);
        // Server wallet loaded successfully
        setSuccess("Server wallet loaded successfully");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Failed to load server wallet");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load server wallet");
    } finally {
      setLoading(false);
    }
  };

  // Removed browser wallet connection - using server wallet only

  const handleStartNode = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await nodeApi.startNode();
      if (result.success) {
        setNodeRunning(true);
        setSuccess(result.message || "Node started successfully");
        setTimeout(() => setSuccess(null), 3000);
        // Refresh status after starting
        await loadSystemStatus();
        // Auto-advance to contract deployment step
        setActiveStep(2);
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
        setNodeRunning(false);
        setSuccess(result.message || "Node stopped successfully");
        setTimeout(() => setSuccess(null), 3000);
        // Refresh status after stopping
        await loadSystemStatus();
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
        // Refresh status after restart
        setTimeout(async () => {
          await loadSystemStatus();
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

  const handleRefreshAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadSystemStatus(),
        checkWalletStatus(),
        checkContractStatus(),
      ]);
      setSuccess("All systems refreshed");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError("Failed to refresh some systems");
    } finally {
      setLoading(false);
    }
  };

  // Checklist action functions

  const handleDeployContract = async () => {
    if (!selectedModule) {
      setError("Please select a module to deploy");
      return;
    }

    setDeploymentInProgress(true);
    setError(null);
    try {
      const result = await hardhatApi.deployModule(
        selectedModule,
        "confluxESpaceLocal"
      );
      if (result.success && result.data) {
        setSuccess(`Successfully deployed ${selectedModule} module`);
        setTimeout(() => setSuccess(null), 5000);
        setShowDeployModal(false);
        // Refresh deployment history
        await loadDeploymentHistory();
      } else {
        setError(result.error || "Failed to deploy contract");
      }
    } catch (err) {
      setError("Failed to deploy contract");
    } finally {
      setDeploymentInProgress(false);
    }
  };

  const handleDeploySelectedModules = async () => {
    if (selectedModules.length === 0 || !nodeRunning) return;

    setDeploymentInProgress(true);
    setError(null);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const moduleName of selectedModules) {
        try {
          const result = await hardhatApi.deployModule(
            moduleName,
            "confluxESpaceLocal"
          );
          if (result.success) {
            successCount++;
            console.log(`✅ Deployed ${moduleName}:`, result.data);
          } else {
            errorCount++;
            console.error(`❌ Failed to deploy ${moduleName}:`, result.error);
          }
        } catch (err) {
          errorCount++;
          console.error(`❌ Error deploying ${moduleName}:`, err);
        }
      }

      if (successCount > 0) {
        setSuccess(`Successfully deployed ${successCount} module(s)`);
        setTimeout(() => setSuccess(null), 5000);
        // Refresh deployment history
        await loadDeploymentHistory();
        // Mark deployment step as completed
        updateChecklistProgress();
      }

      if (errorCount > 0) {
        setError(
          `Failed to deploy ${errorCount} module(s). Check console for details.`
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Deployment failed");
    } finally {
      setDeploymentInProgress(false);
    }
  };

  // Removed test contract function - not needed for current workflow

  const getStepIcon = (step: any, index: number) => {
    if (step.completed) {
      return <IconCheck size={16} />;
    }
    if (index === activeStep) {
      return <IconSettings size={16} />;
    }
    return <IconChecklist size={16} />;
  };

  const getStepColor = (step: any, index: number) => {
    if (step.completed) return "green";
    if (index === activeStep) return "blue";
    return "gray";
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">
        Conflux Development Workflow
      </Title>
      <Text c="dimmed" mb="xl">
        Follow the step-by-step checklist to set up your Conflux development
        environment
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

      {/* Main Checklist */}
      <Card withBorder p="md">
        <Group mb="md">
          <IconChecklist size={24} />
          <Title order={3}>Development Workflow</Title>
          <Badge color="blue" size="sm">
            {checklistSteps.filter((step) => step.completed).length} of{" "}
            {checklistSteps.length} completed
          </Badge>
        </Group>

        <Progress
          value={
            (checklistSteps.filter((step) => step.completed).length /
              checklistSteps.length) *
            100
          }
          mb="xl"
          size="lg"
        />

        <Stepper active={activeStep} orientation="vertical" size="sm">
          {checklistSteps.map((step, index) => (
            <Stepper.Step
              key={step.id}
              label={
                <Group gap="xs">
                  <Text fw={500}>{step.title}</Text>
                  {step.completed && (
                    <Badge color="green" size="sm">
                      Completed
                    </Badge>
                  )}
                </Group>
              }
              description={step.description}
              icon={getStepIcon(step, index)}
              color={getStepColor(step, index)}
            >
              <Card withBorder p="md" mt="md">
                <Group justify="space-between" mb="md">
                  <Text fw={500}>{step.title}</Text>
                  <Badge color={step.completed ? "green" : "gray"} size="sm">
                    {step.completed ? "Completed" : "Pending"}
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="md">
                  {step.description}
                </Text>

                {/* Step-specific actions */}
                {index === 0 && (
                  <Stack gap="md">
                    {/* Server Status */}
                    <Card
                      withBorder
                      p="sm"
                      bg={
                        systemHealth?.status === "healthy" ? "green.0" : "red.0"
                      }
                    >
                      <Group justify="space-between" mb="xs">
                        <Text
                          fw={500}
                          size="sm"
                          c={
                            systemHealth?.status === "healthy" ? "green" : "red"
                          }
                        >
                          Server Status
                        </Text>
                        <Badge
                          color={
                            systemHealth?.status === "healthy" ? "green" : "red"
                          }
                          size="sm"
                        >
                          {systemHealth?.status || "Unknown"}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">
                        API Server:{" "}
                        {systemHealth?.status === "healthy"
                          ? "Running"
                          : "Not Available"}
                      </Text>
                    </Card>

                    {/* Wallet Status */}
                    <Card
                      withBorder
                      p="sm"
                      bg={serverWalletLoaded ? "green.0" : "red.0"}
                    >
                      <Group justify="space-between" mb="xs">
                        <Text
                          fw={500}
                          size="sm"
                          c={serverWalletLoaded ? "green" : "red"}
                        >
                          Server Wallet
                        </Text>
                        <Badge
                          color={serverWalletLoaded ? "green" : "red"}
                          size="sm"
                        >
                          {serverWalletLoaded ? "Loaded" : "Not Loaded"}
                        </Badge>
                      </Group>
                      {serverWalletLoaded && walletInfo && (
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>
                              eSpace:
                            </Text>
                            <Code size="xs">{walletInfo.eSpaceAddress}</Code>
                          </Group>
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>
                              Core:
                            </Text>
                            <Code size="xs">{walletInfo.coreAddress}</Code>
                          </Group>
                        </Stack>
                      )}
                    </Card>

                    <Button
                      leftSection={<IconRefresh size={16} />}
                      onClick={handleRefreshAll}
                      loading={loading}
                      disabled={step.completed}
                    >
                      {step.completed ? "System Ready" : "Refresh Status"}
                    </Button>
                  </Stack>
                )}

                {index === 1 && (
                  <Stack gap="md">
                    {/* Node Configuration */}
                    <Card withBorder p="sm" bg="blue.0">
                      <Text fw={500} size="sm" c="blue" mb="xs">
                        Node Configuration
                      </Text>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            eSpace RPC:
                          </Text>
                          <Code size="xs">http://127.0.0.1:8545</Code>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            Core RPC:
                          </Text>
                          <Code size="xs">http://127.0.0.1:12537</Code>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            Genesis Miner:
                          </Text>
                          <Code size="xs">
                            {walletInfo?.eSpaceAddress || "Server Wallet"}
                          </Code>
                        </Group>
                      </Stack>
                      <Text size="xs" c="dimmed" mt="xs">
                        Node will be pre-funded and start mining automatically
                      </Text>
                    </Card>

                    <Group>
                      <Button
                        leftSection={<IconPlayerPlay size={16} />}
                        color="green"
                        onClick={handleStartNode}
                        disabled={step.completed || !serverWalletLoaded}
                        loading={loading}
                      >
                        {nodeRunning ? "Node Running" : "Start Node"}
                      </Button>
                      {nodeRunning && (
                        <Badge color="green" size="sm">
                          Node Running
                        </Badge>
                      )}
                      {!serverWalletLoaded && (
                        <Badge color="red" size="sm">
                          Load Wallet First
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                )}

                {index === 2 && (
                  <Stack gap="md">
                    {/* Available Modules with Checkboxes */}
                    {ignitionModules.length > 0 && (
                      <Card withBorder p="sm" bg="blue.0">
                        <Text fw={500} size="sm" c="blue" mb="xs">
                          Select Modules to Deploy
                        </Text>
                        <Stack gap="xs">
                          {ignitionModules.map((module) => (
                            <Group key={module.name} justify="space-between">
                              <Checkbox
                                checked={selectedModules.includes(module.name)}
                                onChange={(event) => {
                                  if (event.currentTarget.checked) {
                                    setSelectedModules([
                                      ...selectedModules,
                                      module.name,
                                    ]);
                                  } else {
                                    setSelectedModules(
                                      selectedModules.filter(
                                        (m) => m !== module.name
                                      )
                                    );
                                  }
                                }}
                                label={
                                  <div>
                                    <Text size="sm" fw={500}>
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
                          ))}
                        </Stack>
                        <Button
                          size="xs"
                          variant="outline"
                          mt="xs"
                          onClick={() => {
                            if (
                              selectedModules.length === ignitionModules.length
                            ) {
                              setSelectedModules([]);
                            } else {
                              setSelectedModules(
                                ignitionModules.map((m) => m.name)
                              );
                            }
                          }}
                        >
                          {selectedModules.length === ignitionModules.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </Card>
                    )}

                    {/* Deployment Status */}
                    {deploymentInProgress && (
                      <Card withBorder p="sm" bg="yellow.0">
                        <Group>
                          <Loader size="sm" />
                          <Text size="sm" c="yellow">
                            Deploying contracts... Please wait.
                          </Text>
                        </Group>
                      </Card>
                    )}

                    {/* Recent Deployments */}
                    {deploymentHistory.length > 0 && (
                      <Card withBorder p="sm" bg="green.0">
                        <Text fw={500} size="sm" c="green" mb="xs">
                          Recent Deployments
                        </Text>
                        <Stack gap="xs">
                          {deploymentHistory
                            .slice(0, 3)
                            .map((deployment, idx) => (
                              <Group key={idx} justify="space-between">
                                <div>
                                  <Text size="sm" fw={500}>
                                    {deployment.contract}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {deployment.address}
                                  </Text>
                                </div>
                                <Badge color="green" size="sm">
                                  Deployed
                                </Badge>
                              </Group>
                            ))}
                        </Stack>
                      </Card>
                    )}

                    <Group>
                      <Button
                        leftSection={<IconRocket size={16} />}
                        color="blue"
                        onClick={handleDeploySelectedModules}
                        disabled={
                          step.completed ||
                          !nodeRunning ||
                          selectedModules.length === 0 ||
                          deploymentInProgress
                        }
                        loading={deploymentInProgress}
                      >
                        {deploymentInProgress
                          ? "Deploying..."
                          : `Deploy ${selectedModules.length} Module(s)`}
                      </Button>
                      {contractsDeployed > 0 && (
                        <Badge color="green" size="sm">
                          {contractsDeployed} Contract(s) Deployed
                        </Badge>
                      )}
                      {!nodeRunning && (
                        <Badge color="red" size="sm">
                          Start Node First
                        </Badge>
                      )}
                      {ignitionModules.length === 0 && (
                        <Badge color="yellow" size="sm">
                          No Modules Available
                        </Badge>
                      )}
                    </Group>

                    {/* Dashboard Button - Show when checklist is complete */}
                    {checklistSteps.every((step) => step.completed) && (
                      <Card withBorder p="md" bg="green.0">
                        <Group justify="space-between" mb="md">
                          <div>
                            <Text fw={500} size="sm" c="green">
                              🎉 All Steps Completed!
                            </Text>
                            <Text size="xs" c="dimmed">
                              Your development environment is ready.
                            </Text>
                          </div>
                          <Badge color="green" size="sm">
                            Ready
                          </Badge>
                        </Group>
                        <Button
                          leftSection={<IconDashboard size={16} />}
                          color="green"
                          onClick={() => {
                            // Navigate to dashboard or show dashboard content
                            setShowDashboard(true);
                          }}
                          fullWidth
                        >
                          Go to Dashboard
                        </Button>
                      </Card>
                    )}
                  </Stack>
                )}
              </Card>
            </Stepper.Step>
          ))}
        </Stepper>
      </Card>

      {/* Removed authentication modal - using server wallet only */}

      {/* Deploy Contract Modal */}
      <Modal
        opened={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        title="Deploy Smart Contracts with Hardhat Ignition"
        centered
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select an Ignition module to deploy. The module will deploy all its
            contracts to the running Conflux node.
          </Text>

          <Select
            label="Ignition Module"
            placeholder="Select a module to deploy"
            data={ignitionModules.map((module) => ({
              value: module.name,
              label: `${module.name} - ${module.description}`,
            }))}
            value={selectedModule}
            onChange={(value: any) => setSelectedModule(value || "")}
            required
          />

          {selectedModule && (
            <Card withBorder p="sm" bg="blue.0">
              <Text fw={500} size="sm" c="blue" mb="xs">
                Module Details
              </Text>
              {(() => {
                const module = ignitionModules.find(
                  (m) => m.name === selectedModule
                );
                return module ? (
                  <Stack gap="xs">
                    <Text size="sm">
                      <Text component="span" fw={500}>
                        Contracts:
                      </Text>{" "}
                      {module.contracts.join(", ")}
                    </Text>
                    <Text size="sm">
                      <Text component="span" fw={500}>
                        Path:
                      </Text>{" "}
                      {module.path}
                    </Text>
                  </Stack>
                ) : null;
              })()}
            </Card>
          )}

          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setShowDeployModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeployContract}
              loading={deploymentInProgress}
              disabled={!selectedModule || !nodeRunning}
              leftSection={<IconRocket size={16} />}
            >
              {deploymentInProgress ? "Deploying..." : "Deploy Module"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Removed test contract modal - not needed for current workflow */}

      {/* Dashboard Modal */}
      <Modal
        opened={showDashboard}
        onClose={() => setShowDashboard(false)}
        title="Development Dashboard"
        centered
        size="xl"
      >
        <Stack gap="md">
          <Card withBorder p="md" bg="green.0">
            <Group justify="space-between" mb="md">
              <div>
                <Text fw={500} size="lg" c="green">
                  🎉 Development Environment Ready!
                </Text>
                <Text size="sm" c="dimmed">
                  Your Conflux development stack is fully operational.
                </Text>
              </div>
              <Badge color="green" size="lg">
                All Systems Go
              </Badge>
            </Group>
          </Card>

          <Card withBorder p="md">
            <Text fw={500} size="md" mb="md">
              System Status
            </Text>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">Server Status:</Text>
                <Badge color="green" size="sm">
                  Running
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Conflux Node:</Text>
                <Badge color="green" size="sm">
                  Active
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Wallet Status:</Text>
                <Badge color="green" size="sm">
                  Loaded
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Contracts Deployed:</Text>
                <Badge color="blue" size="sm">
                  {contractsDeployed}
                </Badge>
              </Group>
            </Stack>
          </Card>

          <Card withBorder p="md">
            <Text fw={500} size="md" mb="md">
              Quick Actions
            </Text>
            <Group>
              <Button
                leftSection={<IconRocket size={16} />}
                onClick={() => {
                  setShowDashboard(false);
                  setActiveStep(2);
                }}
              >
                Deploy More Contracts
              </Button>
              <Button
                variant="outline"
                leftSection={<IconSettings size={16} />}
                onClick={() => {
                  setShowDashboard(false);
                  setActiveStep(1);
                }}
              >
                Node Management
              </Button>
            </Group>
          </Card>

          <Text size="sm" c="dimmed" ta="center">
            This is a placeholder dashboard. More features will be added as the
            development progresses.
          </Text>
        </Stack>
      </Modal>
    </Container>
  );
}
