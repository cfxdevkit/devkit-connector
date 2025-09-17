"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Container,
  Title,
  Text,
  Alert,
  Button,
  List,
  Stack,
  Code,
  Paper,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI using Mantine components
      return (
        <Container size="md" py="xl">
          <Paper withBorder p="xl" radius="md">
            <Stack gap="md">
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Something went wrong"
                color="red"
                variant="light"
              >
                <Text size="sm">
                  An error occurred while loading the application. This might be
                  due to:
                </Text>
              </Alert>

              <List size="sm" spacing="xs">
                <List.Item>
                  Multiple wallet extensions installed (MetaMask, Fluent Wallet,
                  etc.)
                </List.Item>
                <List.Item>Wallet extension conflicts</List.Item>
                <List.Item>Browser compatibility issues</List.Item>
                <List.Item>Network connectivity problems</List.Item>
              </List>

              <div>
                <Text fw={500} size="sm" mb="xs">
                  Suggested fixes:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Disable conflicting wallet extensions</List.Item>
                  <List.Item>Refresh the page</List.Item>
                  <List.Item>
                    Try using only one wallet extension at a time
                  </List.Item>
                  <List.Item>Clear browser cache and cookies</List.Item>
                </List>
              </div>

              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={() => {
                  this.setState({
                    hasError: false,
                    error: undefined,
                    errorInfo: undefined,
                  });
                  window.location.reload();
                }}
                color="red"
                fullWidth
              >
                Reload Page
              </Button>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <Paper withBorder p="md" bg="red.0">
                  <Text fw={500} size="sm" c="red" mb="xs">
                    Error Details (Development Only)
                  </Text>
                  <Code block size="xs" c="red">
                    {this.state.error.toString()}
                  </Code>
                  {this.state.errorInfo && (
                    <Code block size="xs" c="red" mt="xs">
                      {this.state.errorInfo.componentStack}
                    </Code>
                  )}
                </Paper>
              )}
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
