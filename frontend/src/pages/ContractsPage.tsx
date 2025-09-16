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
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Alert,
  Tabs,
  Divider,
} from "@mantine/core";
import {
  IconCode,
  IconPlus,
  IconRefresh,
  IconEye,
  IconEdit,
  IconTrash,
  IconCopy,
  IconExternalLink,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
  IconDatabase,
  IconActivity,
  IconShield,
} from "@tabler/icons-react";
import { apiRequest } from "../utils/apiUtils";

interface Contract {
  id: string;
  name: string;
  address: string;
  abi: any[];
  bytecode: string;
  deployed: boolean;
  network: string;
  createdAt: string;
  lastUsed: string;
  transactionCount: number;
  balance?: string;
}

interface ContractMethod {
  name: string;
  type: "function" | "event" | "constructor";
  inputs: any[];
  outputs?: any[];
  stateMutability?: string;
}

const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [contractMethods, setContractMethods] = useState<ContractMethod[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newContract, setNewContract] = useState({
    name: "",
    address: "",
    abi: "",
    bytecode: "",
  });

  const loadContracts = async () => {
    try {
      const response = await apiRequest("/api/contracts/status");
      if (response.success && response.data?.espace?.deployed) {
        setContracts([
          {
            id: "1",
            name: "Counter Contract",
            address: response.data.espace.address,
            abi: [
              {
                inputs: [],
                name: "getCount",
                outputs: [
                  { internalType: "uint256", name: "", type: "uint256" },
                ],
                stateMutability: "view",
                type: "function",
              },
              {
                inputs: [],
                name: "increment",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            bytecode: "0x608060405234801561001057600080fd5b50...",
            deployed: true,
            network: "Conflux eSpace",
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 2
            ).toISOString(),
            lastUsed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            transactionCount: 15,
            balance: "0.0 CFX",
          },
          {
            id: "2",
            name: "Delegation Manager",
            address: "0x742d35Cc6634C0532925a3b8D0C0E1c2C5c2B5c2",
            abi: [
              {
                inputs: [
                  {
                    internalType: "address",
                    name: "delegate",
                    type: "address",
                  },
                ],
                name: "createDelegation",
                outputs: [
                  { internalType: "bytes32", name: "", type: "bytes32" },
                ],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            bytecode: "0x608060405234801561001057600080fd5b50...",
            deployed: true,
            network: "Conflux eSpace",
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 5
            ).toISOString(),
            lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            transactionCount: 8,
            balance: "0.0 CFX",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadContractMethods = (contract: Contract) => {
    const methods: ContractMethod[] = contract.abi.map((item: any) => ({
      name: item.name,
      type: item.type,
      inputs: item.inputs || [],
      outputs: item.outputs || [],
      stateMutability: item.stateMutability,
    }));
    setContractMethods(methods);
  };

  const handleContractSelect = (contract: Contract) => {
    setSelectedContract(contract);
    loadContractMethods(contract);
  };

  const handleAddContract = () => {
    setNewContract({
      name: "",
      address: "",
      abi: "",
      bytecode: "",
    });
    setModalOpen(true);
  };

  const handleSaveContract = () => {
    // In a real app, this would save to the backend
    const contract: Contract = {
      id: Date.now().toString(),
      name: newContract.name,
      address: newContract.address,
      abi: JSON.parse(newContract.abi || "[]"),
      bytecode: newContract.bytecode,
      deployed: true,
      network: "Conflux eSpace",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      transactionCount: 0,
      balance: "0.0 CFX",
    };

    setContracts((prev) => [contract, ...prev]);
    setModalOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getContractStatusColor = (deployed: boolean) => {
    return deployed ? "green" : "red";
  };

  const getContractStatusIcon = (deployed: boolean) => {
    return deployed ? <IconCheck size={12} /> : <IconX size={12} />;
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={1} mb="sm">
              Contract Management
            </Title>
            <Text c="dimmed" size="lg">
              Deploy, manage, and interact with smart contracts
            </Text>
          </Box>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddContract}
          >
            Add Contract
          </Button>
        </Group>
      </Box>

      <Grid>
        {/* Contracts List */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon color="blue" variant="light" size="lg">
                  <IconCode size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={3}>Deployed Contracts</Title>
                  <Text size="sm" c="dimmed">
                    {contracts.length} contracts deployed
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                onClick={loadContracts}
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
                    <Table.Th>Contract</Table.Th>
                    <Table.Th>Address</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Network</Table.Th>
                    <Table.Th>Transactions</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {contracts.map((contract) => (
                    <Table.Tr key={contract.id}>
                      <Table.Td>
                        <Text fw={500}>{contract.name}</Text>
                        <Text size="xs" c="dimmed">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Code>{contract.address.slice(0, 10)}...</Code>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getContractStatusColor(contract.deployed)}
                          leftSection={getContractStatusIcon(contract.deployed)}
                          size="sm"
                        >
                          {contract.deployed ? "Deployed" : "Not Deployed"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{contract.network}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{contract.transactionCount}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            onClick={() => handleContractSelect(contract)}
                          >
                            <IconEye size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            variant="light"
                            onClick={() => copyToClipboard(contract.address)}
                          >
                            <IconCopy size={14} />
                          </ActionIcon>
                          <ActionIcon size="sm" variant="light" color="red">
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* Contract Details */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group mb="md">
              <ThemeIcon color="green" variant="light" size="lg">
                <IconDatabase size={24} />
              </ThemeIcon>
              <Box>
                <Title order={3}>Contract Details</Title>
                <Text size="sm" c="dimmed">
                  {selectedContract
                    ? "Selected contract info"
                    : "Select a contract"}
                </Text>
              </Box>
            </Group>

            {selectedContract ? (
              <Stack gap="md">
                <Paper p="md" withBorder>
                  <Text fw={500} mb="xs">
                    {selectedContract.name}
                  </Text>
                  <Code style={{ display: "block", wordBreak: "break-all" }}>
                    {selectedContract.address}
                  </Code>
                  <Group justify="space-between" mt="xs">
                    <Badge
                      color={getContractStatusColor(selectedContract.deployed)}
                      leftSection={getContractStatusIcon(
                        selectedContract.deployed
                      )}
                      size="sm"
                    >
                      {selectedContract.deployed ? "Deployed" : "Not Deployed"}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {selectedContract.network}
                    </Text>
                  </Group>
                </Paper>

                <Paper p="md" withBorder>
                  <Text fw={500} mb="xs">
                    Statistics
                  </Text>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Transactions:</Text>
                    <Text size="sm" fw={500}>
                      {selectedContract.transactionCount}
                    </Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Balance:</Text>
                    <Text size="sm" fw={500}>
                      {selectedContract.balance}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Last Used:</Text>
                    <Text size="sm" fw={500}>
                      {new Date(selectedContract.lastUsed).toLocaleDateString()}
                    </Text>
                  </Group>
                </Paper>

                <Paper p="md" withBorder>
                  <Text fw={500} mb="xs">
                    Methods ({contractMethods.length})
                  </Text>
                  <ScrollArea h={200}>
                    <Stack gap="xs">
                      {contractMethods.map((method, index) => (
                        <Paper key={index} p="sm" withBorder>
                          <Group justify="space-between" mb="xs">
                            <Text fw={500} size="sm">
                              {method.name}
                            </Text>
                            <Badge
                              color={
                                method.type === "function" ? "blue" : "green"
                              }
                              size="xs"
                            >
                              {method.type}
                            </Badge>
                          </Group>
                          {method.stateMutability && (
                            <Text size="xs" c="dimmed">
                              {method.stateMutability}
                            </Text>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  </ScrollArea>
                </Paper>
              </Stack>
            ) : (
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
              >
                Select a contract from the list to view its details and methods.
              </Alert>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {/* Add Contract Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Contract"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Contract Name"
            placeholder="Enter contract name"
            value={newContract.name}
            onChange={(event) =>
              setNewContract((prev) => ({
                ...prev,
                name: event.currentTarget.value,
              }))
            }
          />

          <TextInput
            label="Contract Address"
            placeholder="0x..."
            value={newContract.address}
            onChange={(event) =>
              setNewContract((prev) => ({
                ...prev,
                address: event.currentTarget.value,
              }))
            }
          />

          <Textarea
            label="ABI (JSON)"
            placeholder="Paste contract ABI here"
            value={newContract.abi}
            onChange={(event) =>
              setNewContract((prev) => ({
                ...prev,
                abi: event.currentTarget.value,
              }))
            }
            minRows={4}
          />

          <Textarea
            label="Bytecode (optional)"
            placeholder="Contract bytecode"
            value={newContract.bytecode}
            onChange={(event) =>
              setNewContract((prev) => ({
                ...prev,
                bytecode: event.currentTarget.value,
              }))
            }
            minRows={2}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContract}>Add Contract</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ContractsPage;
