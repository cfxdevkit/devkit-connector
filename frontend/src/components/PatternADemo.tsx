import React, { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Grid,
  TextInput,
  Alert,
  Badge,
  Code,
  NumberInput,
  ThemeIcon,
  Paper,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconCalculator,
  IconCheck,
  IconX,
  IconPlus,
  IconMinus,
  IconX as IconMultiply,
  IconDivide,
} from "@tabler/icons-react";
import { apiRequest, getErrorMessage } from "../utils/apiUtils";

interface ContractStatus {
  espace: {
    deployed: boolean;
    address?: string;
    mock: boolean;
  };
  core: {
    deployed: boolean;
    address?: string;
    mock: boolean;
  };
}

interface CounterStatus {
  count: string;
  maxCount: string;
  address: string;
}

interface CounterOperation {
  operation: string;
  value?: number;
  values?: number[];
  newCount: string;
}

const PatternADemo: React.FC = () => {
  // State management
  const [contractStatus, setContractStatus] = useState<ContractStatus | null>(
    null
  );
  const [counterStatus, setCounterStatus] = useState<CounterStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Counter operation state
  const [operationValue, setOperationValue] = useState<string>("");
  const [batchValues, setBatchValues] = useState<string>("");

  // Load contract status
  const loadContractStatus = async () => {
    try {
      const response = await apiRequest<ContractStatus>(
        "/api/contracts/status"
      );

      if (response.success && response.data) {
        setContractStatus(response.data);
      } else {
        setError(response.error || "Failed to load contract status");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Load counter status
  const loadCounterStatus = async () => {
    try {
      const response = await apiRequest<CounterStatus>(
        "/api/contracts/counter/status"
      );

      if (response.success && response.data) {
        setCounterStatus(response.data);
      } else {
        setError(response.error || "Failed to load counter status");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Perform counter operation
  const performCounterOperation = async (
    operation: string,
    value?: number,
    values?: number[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<CounterOperation>(
        "/api/contracts/counter/operation",
        {
          method: "POST",
          body: JSON.stringify({ operation, value, values }),
        }
      );

      if (response.success) {
        // Reload counter status
        await loadCounterStatus();
      } else {
        setError(response.error || "Operation failed");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle single operations
  const handleSingleOperation = (operation: string) => {
    const value = parseInt(operationValue);
    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid positive number");
      return;
    }
    performCounterOperation(operation, value);
  };

  // Handle batch operations
  const handleBatchOperation = (operation: string) => {
    const values = batchValues
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v) && v > 0);

    if (values.length === 0) {
      setError("Please enter valid numbers separated by commas");
      return;
    }
    performCounterOperation(operation, undefined, values);
  };

  // Load data on component mount
  useEffect(() => {
    loadContractStatus();
    loadCounterStatus();
  }, []);

  return (
    <Stack gap="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group mb="md">
          <ThemeIcon color="blue" variant="light" size="lg">
            <IconCalculator size={20} />
          </ThemeIcon>
          <div>
            <Title order={3}>Contract Demo: Direct Interaction</Title>
            <Text c="dimmed" size="sm">
              Direct interaction with smart contracts through the server API on
              Conflux eSpace.
            </Text>
          </div>
        </Group>

        {error && (
          <Alert color="red" title="Error" mb="md">
            {error}
          </Alert>
        )}

        {/* Contract Status */}
        <Stack gap="md">
          <Title order={4}>Contract Status</Title>
          {contractStatus ? (
            <Grid>
              <Grid.Col span={6}>
                <Paper p="md" withBorder>
                  <Title order={5} mb="sm">
                    DelegationManager Contract
                  </Title>
                  <Stack gap="xs">
                    <Group>
                      <Text size="sm" fw={500}>
                        Deployed:
                      </Text>
                      <Badge
                        color={contractStatus.espace.deployed ? "green" : "red"}
                        leftSection={
                          contractStatus.espace.deployed ? (
                            <IconCheck size={12} />
                          ) : (
                            <IconX size={12} />
                          )
                        }
                      >
                        {contractStatus.espace.deployed ? "Yes" : "No"}
                      </Badge>
                    </Group>
                    {contractStatus.espace.address && (
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Address:
                        </Text>
                        <Code block>{contractStatus.espace.address}</Code>
                      </div>
                    )}
                    <Text size="sm">
                      Type: {contractStatus.espace.mock ? "Mock" : "Real"}
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper p="md" withBorder>
                  <Title order={5} mb="sm">
                    Counter Contract
                  </Title>
                  <Stack gap="xs">
                    <Group>
                      <Text size="sm" fw={500}>
                        Deployed:
                      </Text>
                      <Badge
                        color={contractStatus.espace.deployed ? "green" : "red"}
                        leftSection={
                          contractStatus.espace.deployed ? (
                            <IconCheck size={12} />
                          ) : (
                            <IconX size={12} />
                          )
                        }
                      >
                        {contractStatus.espace.deployed ? "Yes" : "No"}
                      </Badge>
                    </Group>
                    {contractStatus.espace.address && (
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Address:
                        </Text>
                        <Code block>{contractStatus.espace.address}</Code>
                      </div>
                    )}
                    <Text size="sm">
                      Type: {contractStatus.espace.mock ? "Mock" : "Real"}
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          ) : (
            <Center p="xl">
              <Loader size="sm" />
              <Text ml="sm">Loading contract status...</Text>
            </Center>
          )}
        </Stack>
      </Card>

      {/* Counter Contract Demo */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Counter Contract Demo
        </Title>
        {counterStatus ? (
          <Stack gap="lg">
            {/* Current Status */}
            <Paper p="md" withBorder>
              <Title order={5} mb="sm">
                Current Status
              </Title>
              <Grid>
                <Grid.Col span={4}>
                  <Text size="sm" fw={500}>
                    Count
                  </Text>
                  <Text size="lg" fw={700}>
                    {counterStatus.count}
                  </Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="sm" fw={500}>
                    Max Count
                  </Text>
                  <Text size="lg" fw={700}>
                    {counterStatus.maxCount}
                  </Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="sm" fw={500}>
                    Address
                  </Text>
                  <Code block>{counterStatus.address}</Code>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Single Operations */}
            <Paper p="md" withBorder>
              <Title order={5} mb="md">
                Single Operations
              </Title>
              <Stack gap="md">
                <NumberInput
                  label="Enter value"
                  placeholder="Enter value"
                  value={operationValue}
                  onChange={(value) =>
                    setOperationValue(value?.toString() || "")
                  }
                  min={1}
                />
                <Group>
                  <Button
                    onClick={() => handleSingleOperation("add")}
                    loading={loading}
                    leftSection={<IconPlus size={16} />}
                    color="green"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => handleSingleOperation("subtract")}
                    loading={loading}
                    leftSection={<IconMinus size={16} />}
                    color="red"
                  >
                    Subtract
                  </Button>
                  <Button
                    onClick={() => handleSingleOperation("multiply")}
                    loading={loading}
                    leftSection={<IconMultiply size={16} />}
                    color="blue"
                  >
                    Multiply
                  </Button>
                  <Button
                    onClick={() => handleSingleOperation("divide")}
                    loading={loading}
                    leftSection={<IconDivide size={16} />}
                    color="orange"
                  >
                    Divide
                  </Button>
                </Group>
              </Stack>
            </Paper>

            {/* Quick Actions */}
            <Paper p="md" withBorder>
              <Title order={5} mb="md">
                Quick Actions
              </Title>
              <Group>
                <Button
                  onClick={() => performCounterOperation("add", 1)}
                  loading={loading}
                  variant="outline"
                  size="sm"
                >
                  +1
                </Button>
                <Button
                  onClick={() => performCounterOperation("add", 10)}
                  loading={loading}
                  variant="outline"
                  size="sm"
                >
                  +10
                </Button>
                <Button
                  onClick={() => performCounterOperation("add", 100)}
                  loading={loading}
                  variant="outline"
                  size="sm"
                >
                  +100
                </Button>
                <Button
                  onClick={() => performCounterOperation("multiply", 2)}
                  loading={loading}
                  variant="outline"
                  size="sm"
                >
                  ×2
                </Button>
                <Button
                  onClick={() => performCounterOperation("divide", 2)}
                  loading={loading}
                  variant="outline"
                  size="sm"
                >
                  ÷2
                </Button>
                <Button
                  onClick={() => performCounterOperation("reset")}
                  loading={loading}
                  variant="outline"
                  color="red"
                  size="sm"
                >
                  Reset
                </Button>
              </Group>
            </Paper>

            {/* Batch Operations */}
            <Paper p="md" withBorder>
              <Title order={5} mb="md">
                Batch Operations
              </Title>
              <Stack gap="md">
                <TextInput
                  label="Enter values separated by commas"
                  placeholder="Enter values separated by commas (e.g., 1,2,3)"
                  value={batchValues}
                  onChange={(e) => setBatchValues(e.target.value)}
                />
                <Group>
                  <Button
                    onClick={() => handleBatchOperation("batchAdd")}
                    loading={loading}
                    leftSection={<IconPlus size={16} />}
                    color="green"
                  >
                    Batch Add
                  </Button>
                  <Button
                    onClick={() => handleBatchOperation("batchSubtract")}
                    loading={loading}
                    leftSection={<IconMinus size={16} />}
                    color="red"
                  >
                    Batch Subtract
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        ) : (
          <Center p="xl">
            <Loader size="sm" />
            <Text ml="sm">Loading counter status...</Text>
          </Center>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Center p="md">
            <Loader size="sm" />
            <Text ml="sm">Processing operation...</Text>
          </Center>
        )}
      </Card>
    </Stack>
  );
};

export default PatternADemo;
