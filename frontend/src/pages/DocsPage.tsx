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
  Code,
  Button,
  Alert,
  Tabs,
  Divider,
  List,
  Anchor,
  CopyButton,
  Tooltip,
  Table,
} from "@mantine/core";
import {
  IconBook,
  IconRefresh,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconClock,
  IconCode,
  IconApi,
  IconShield,
  IconWallet,
  IconDatabase,
  IconCopy,
  IconExternalLink,
  IconInfoCircle,
} from "@tabler/icons-react";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response: {
    status: number;
    description: string;
    example: any;
  };
}

interface CodeExample {
  language: string;
  title: string;
  code: string;
  description: string;
}

const DocsPage: React.FC = () => {
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [codeExamples, setCodeExamples] = useState<CodeExample[]>([]);
  const [loading, setLoading] = useState(false);

  const loadApiEndpoints = async () => {
    setApiEndpoints([
      {
        method: "GET",
        path: "/api/health",
        description: "Check system health status",
        response: {
          status: 200,
          description: "System is healthy",
          example: {
            status: "healthy",
            timestamp: "2024-01-15T10:30:00Z",
            services: {
              database: "healthy",
              blockchain: "healthy",
              api: "healthy",
            },
          },
        },
      },
      {
        method: "GET",
        path: "/api/wallet/status",
        description: "Get wallet connection status",
        response: {
          status: 200,
          description: "Wallet status retrieved successfully",
          example: {
            connected: true,
            address: "0x742d35Cc6634C0532925a3b8D0C0E1c2C5c2B5c2",
            network: "Conflux eSpace",
            balance: "1.5 CFX",
          },
        },
      },
      {
        method: "POST",
        path: "/api/wallet/load",
        description: "Load a wallet by ID",
        parameters: [
          {
            name: "walletId",
            type: "string",
            required: true,
            description: "Unique wallet identifier",
          },
          {
            name: "password",
            type: "string",
            required: true,
            description: "Wallet password for decryption",
          },
        ],
        response: {
          status: 200,
          description: "Wallet loaded successfully",
          example: {
            success: true,
            walletId: "demo-user",
            address: "0x742d35Cc6634C0532925a3b8D0C0E1c2C5c2B5c2",
            message: "Wallet loaded successfully",
          },
        },
      },
      {
        method: "POST",
        path: "/api/wallet/delegation",
        description: "Create a new delegation session",
        parameters: [
          {
            name: "delegateAddress",
            type: "string",
            required: true,
            description: "Address of the delegate",
          },
          {
            name: "expirationTime",
            type: "number",
            required: false,
            description: "Delegation expiration timestamp",
          },
        ],
        response: {
          status: 201,
          description: "Delegation created successfully",
          example: {
            success: true,
            sessionId: "delegation_123456",
            delegateAddress: "0x742d35Cc6634C0532925a3b8D0C0E1c2C5c2B5c2",
            expirationTime: 1642248000,
          },
        },
      },
      {
        method: "GET",
        path: "/api/contracts/status",
        description: "Get smart contract deployment status",
        response: {
          status: 200,
          description: "Contract status retrieved successfully",
          example: {
            success: true,
            data: {
              espace: {
                deployed: true,
                address: "0x742d35Cc6634C0532925a3b8D0C0E1c2C5c2B5c2",
                transactionHash: "0x1234567890abcdef...",
              },
            },
          },
        },
      },
      {
        method: "POST",
        path: "/api/contracts/operation",
        description: "Execute a contract operation",
        parameters: [
          {
            name: "operation",
            type: "string",
            required: true,
            description: "Operation type (increment, decrement, etc.)",
          },
          {
            name: "value",
            type: "number",
            required: false,
            description: "Value for the operation",
          },
        ],
        response: {
          status: 200,
          description: "Operation executed successfully",
          example: {
            success: true,
            transactionHash: "0x1234567890abcdef...",
            gasUsed: "21000",
            blockNumber: 1234567,
          },
        },
      },
    ]);
  };

  const loadCodeExamples = async () => {
    setCodeExamples([
      {
        language: "JavaScript",
        title: "Connect to Wallet",
        description: "Connect to a wallet using the API",
        code: `// Connect to wallet
const response = await fetch('/api/wallet/load', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    walletId: 'demo-user',
    password: 'your-password'
  })
});

const result = await response.json();
console.log('Wallet connected:', result.address);`,
      },
      {
        language: "JavaScript",
        title: "Check System Health",
        description: "Monitor system health status",
        code: `// Check system health
const healthCheck = async () => {
  try {
    const response = await fetch('/api/health');
    const health = await response.json();
    
    if (health.status === 'healthy') {
      console.log('All systems operational');
    } else {
      console.warn('System issues detected:', health);
    }
  } catch (error) {
    console.error('Health check failed:', error);
  }
};

// Run health check every 30 seconds
setInterval(healthCheck, 30000);`,
      },
      {
        language: "JavaScript",
        title: "Create Delegation",
        description: "Create a new delegation session",
        code: `// Create delegation session
const createDelegation = async (delegateAddress) => {
  const response = await fetch('/api/wallet/delegation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      delegateAddress: delegateAddress,
      expirationTime: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })
  });
  
  const result = await response.json();
  return result.sessionId;
};

// Usage
const sessionId = await createDelegation('0x742d35Cc6634C0532925a3b8D0C0E1c2C5c2B5c2');
console.log('Delegation created:', sessionId);`,
      },
      {
        language: "Python",
        title: "Python API Client",
        description: "Python client for the API",
        code: `import requests
import json

class ConfluxWalletAPI:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
    
    def health_check(self):
        response = requests.get(f"{self.base_url}/api/health")
        return response.json()
    
    def load_wallet(self, wallet_id, password):
        response = requests.post(
            f"{self.base_url}/api/wallet/load",
            json={"walletId": wallet_id, "password": password}
        )
        return response.json()
    
    def create_delegation(self, delegate_address):
        response = requests.post(
            f"{self.base_url}/api/wallet/delegation",
            json={"delegateAddress": delegate_address}
        )
        return response.json()

# Usage
api = ConfluxWalletAPI()
health = api.health_check()
print(f"System status: {health['status']}")`,
      },
    ]);
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadApiEndpoints(), loadCodeExamples()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "blue";
      case "POST":
        return "green";
      case "PUT":
        return "yellow";
      case "DELETE":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={1} mb="sm">
              API Documentation
            </Title>
            <Text c="dimmed" size="lg">
              Complete API reference and integration guides
            </Text>
          </Box>
          <ActionIcon
            onClick={loadAllData}
            loading={loading}
            variant="light"
            color="blue"
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Quick Start */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group mb="md">
          <ThemeIcon color="green" variant="light" size="lg">
            <IconBook size={24} />
          </ThemeIcon>
          <Box>
            <Title order={3}>Quick Start</Title>
            <Text size="sm" c="dimmed">
              Get started with the Conflux Dual Wallet API
            </Text>
          </Box>
        </Group>

        <Stack gap="md">
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light"
          >
            The API runs on <Code>http://localhost:3001</Code> and provides
            endpoints for wallet management, contract interactions, and system
            monitoring.
          </Alert>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder>
                <Text fw={500} mb="xs">
                  Base URL
                </Text>
                <Code block>http://localhost:3001</Code>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder>
                <Text fw={500} mb="xs">
                  Content Type
                </Text>
                <Code block>application/json</Code>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      <Tabs defaultValue="endpoints">
        <Tabs.List>
          <Tabs.Tab value="endpoints" leftSection={<IconApi size={16} />}>
            API Endpoints
          </Tabs.Tab>
          <Tabs.Tab value="examples" leftSection={<IconCode size={16} />}>
            Code Examples
          </Tabs.Tab>
          <Tabs.Tab value="guides" leftSection={<IconBook size={16} />}>
            Integration Guides
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="endpoints" pt="md">
          <Stack gap="md">
            {apiEndpoints.map((endpoint, index) => (
              <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Group>
                    <Badge color={getMethodColor(endpoint.method)} size="lg">
                      {endpoint.method}
                    </Badge>
                    <Code>{endpoint.path}</Code>
                  </Group>
                  <CopyButton value={endpoint.path}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied!" : "Copy path"}>
                        <ActionIcon onClick={copy} variant="light">
                          <IconCopy size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>

                <Text mb="md">{endpoint.description}</Text>

                {endpoint.parameters && (
                  <Box mb="md">
                    <Text fw={500} mb="xs">
                      Parameters
                    </Text>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Name</Table.Th>
                          <Table.Th>Type</Table.Th>
                          <Table.Th>Required</Table.Th>
                          <Table.Th>Description</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {endpoint.parameters.map((param, paramIndex) => (
                          <Table.Tr key={paramIndex}>
                            <Table.Td>
                              <Code>{param.name}</Code>
                            </Table.Td>
                            <Table.Td>
                              <Badge size="sm" variant="outline">
                                {param.type}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={param.required ? "red" : "gray"}
                                size="sm"
                              >
                                {param.required ? "Required" : "Optional"}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">{param.description}</Text>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Box>
                )}

                <Box>
                  <Text fw={500} mb="xs">
                    Response
                  </Text>
                  <Paper p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Status: {endpoint.response.status}</Text>
                      <Text size="sm" c="dimmed">
                        {endpoint.response.description}
                      </Text>
                    </Group>
                    <Code block>
                      {JSON.stringify(endpoint.response.example, null, 2)}
                    </Code>
                  </Paper>
                </Box>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="examples" pt="md">
          <Grid>
            {codeExamples.map((example, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 6 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Group justify="space-between" mb="md">
                    <Box>
                      <Title order={4}>{example.title}</Title>
                      <Text size="sm" c="dimmed">
                        {example.description}
                      </Text>
                    </Box>
                    <Badge size="sm" variant="outline">
                      {example.language}
                    </Badge>
                  </Group>

                  <Code block>{example.code}</Code>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="guides" pt="md">
          <Stack gap="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Wallet Integration
              </Title>
              <Text mb="md">
                Learn how to integrate wallet functionality into your
                application.
              </Text>
              <List>
                <List.Item>Connect to server-managed wallets</List.Item>
                <List.Item>
                  Create delegation sessions for browser wallets
                </List.Item>
                <List.Item>Monitor wallet status and balance</List.Item>
                <List.Item>Handle wallet encryption and security</List.Item>
              </List>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Contract Interactions
              </Title>
              <Text mb="md">
                Interact with smart contracts through the API.
              </Text>
              <List>
                <List.Item>Deploy contracts to Conflux eSpace</List.Item>
                <List.Item>Execute contract operations</List.Item>
                <List.Item>Monitor contract status and events</List.Item>
                <List.Item>Handle transaction confirmations</List.Item>
              </List>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                System Monitoring
              </Title>
              <Text mb="md">Monitor system health and performance.</Text>
              <List>
                <List.Item>Check system health status</List.Item>
                <List.Item>Monitor API performance metrics</List.Item>
                <List.Item>Track blockchain node status</List.Item>
                <List.Item>Set up alerts and notifications</List.Item>
              </List>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default DocsPage;
