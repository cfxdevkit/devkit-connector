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
  TextInput,
  Switch,
  Select,
  Button,
  Divider,
  Alert,
  NumberInput,
  Textarea,
  Tabs,
} from "@mantine/core";
import {
  IconSettings,
  IconWallet,
  IconDatabase,
  IconShield,
  IconBell,
  IconPalette,
  IconNetwork,
  IconDeviceFloppy,
  IconRefresh,
  IconCheck,
  IconX,
  IconInfoCircle,
} from "@tabler/icons-react";

interface SettingSection {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    // Wallet Settings
    autoConnect: true,
    defaultWallet: "metamask",
    sessionTimeout: 30,
    enableNotifications: true,

    // Network Settings
    rpcUrl: "http://localhost:8545",
    chainId: "0x1",
    gasLimit: 21000,
    gasPrice: "20",

    // UI Settings
    theme: "dark",
    language: "en",
    fontSize: "medium",
    compactMode: false,

    // Security Settings
    requirePassword: true,
    enable2FA: false,
    sessionEncryption: true,
    logLevel: "info",

    // API Settings
    apiTimeout: 30000,
    retryAttempts: 3,
    enableCaching: true,
    cacheTimeout: 300,
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const settingSections: SettingSection[] = [
    {
      title: "Wallet",
      description: "Wallet connection and session settings",
      icon: IconWallet,
      color: "blue",
    },
    {
      title: "Network",
      description: "Blockchain network configuration",
      icon: IconNetwork,
      color: "green",
    },
    {
      title: "Interface",
      description: "UI and display preferences",
      icon: IconPalette,
      color: "purple",
    },
    {
      title: "Security",
      description: "Security and privacy settings",
      icon: IconShield,
      color: "red",
    },
    {
      title: "Notifications",
      description: "Alert and notification preferences",
      icon: IconBell,
      color: "yellow",
    },
    {
      title: "Advanced",
      description: "Advanced system configuration",
      icon: IconSettings,
      color: "gray",
    },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus("saving");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage for demo
      localStorage.setItem("appSettings", JSON.stringify(settings));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      autoConnect: true,
      defaultWallet: "metamask",
      sessionTimeout: 30,
      enableNotifications: true,
      rpcUrl: "http://localhost:8545",
      chainId: "0x1",
      gasLimit: 21000,
      gasPrice: "20",
      theme: "dark",
      language: "en",
      fontSize: "medium",
      compactMode: false,
      requirePassword: true,
      enable2FA: false,
      sessionEncryption: true,
      logLevel: "info",
      apiTimeout: 30000,
      retryAttempts: 3,
      enableCaching: true,
      cacheTimeout: 300,
    });
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  const renderWalletSettings = () => (
    <Stack gap="md">
      <Switch
        label="Auto-connect wallet on startup"
        description="Automatically connect to the last used wallet when the app starts"
        checked={settings.autoConnect}
        onChange={(event) =>
          handleSettingChange("autoConnect", event.currentTarget.checked)
        }
      />

      <Select
        label="Default Wallet"
        description="Preferred wallet provider"
        value={settings.defaultWallet}
        onChange={(value) => handleSettingChange("defaultWallet", value)}
        data={[
          { value: "metamask", label: "MetaMask" },
          { value: "walletconnect", label: "WalletConnect" },
          { value: "coinbase", label: "Coinbase Wallet" },
        ]}
      />

      <NumberInput
        label="Session Timeout (minutes)"
        description="How long to keep wallet sessions active"
        value={settings.sessionTimeout}
        onChange={(value) => handleSettingChange("sessionTimeout", value)}
        min={5}
        max={1440}
      />
    </Stack>
  );

  const renderNetworkSettings = () => (
    <Stack gap="md">
      <TextInput
        label="RPC URL"
        description="Conflux node RPC endpoint"
        value={settings.rpcUrl}
        onChange={(event) =>
          handleSettingChange("rpcUrl", event.currentTarget.value)
        }
      />

      <TextInput
        label="Chain ID"
        description="Network chain identifier"
        value={settings.chainId}
        onChange={(event) =>
          handleSettingChange("chainId", event.currentTarget.value)
        }
      />

      <NumberInput
        label="Gas Limit"
        description="Default gas limit for transactions"
        value={settings.gasLimit}
        onChange={(value) => handleSettingChange("gasLimit", value)}
        min={21000}
        max={1000000}
      />

      <TextInput
        label="Gas Price (Gwei)"
        description="Gas price in Gwei"
        value={settings.gasPrice}
        onChange={(event) =>
          handleSettingChange("gasPrice", event.currentTarget.value)
        }
      />
    </Stack>
  );

  const renderInterfaceSettings = () => (
    <Stack gap="md">
      <Select
        label="Theme"
        description="Application color scheme"
        value={settings.theme}
        onChange={(value) => handleSettingChange("theme", value)}
        data={[
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
          { value: "auto", label: "Auto" },
        ]}
      />

      <Select
        label="Language"
        description="Interface language"
        value={settings.language}
        onChange={(value) => handleSettingChange("language", value)}
        data={[
          { value: "en", label: "English" },
          { value: "es", label: "Spanish" },
          { value: "fr", label: "French" },
          { value: "de", label: "German" },
        ]}
      />

      <Select
        label="Font Size"
        description="Text size preference"
        value={settings.fontSize}
        onChange={(value) => handleSettingChange("fontSize", value)}
        data={[
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ]}
      />

      <Switch
        label="Compact Mode"
        description="Use more compact UI elements"
        checked={settings.compactMode}
        onChange={(event) =>
          handleSettingChange("compactMode", event.currentTarget.checked)
        }
      />
    </Stack>
  );

  const renderSecuritySettings = () => (
    <Stack gap="md">
      <Switch
        label="Require Password"
        description="Require password for sensitive operations"
        checked={settings.requirePassword}
        onChange={(event) =>
          handleSettingChange("requirePassword", event.currentTarget.checked)
        }
      />

      <Switch
        label="Enable 2FA"
        description="Two-factor authentication for enhanced security"
        checked={settings.enable2FA}
        onChange={(event) =>
          handleSettingChange("enable2FA", event.currentTarget.checked)
        }
      />

      <Switch
        label="Session Encryption"
        description="Encrypt wallet session data"
        checked={settings.sessionEncryption}
        onChange={(event) =>
          handleSettingChange("sessionEncryption", event.currentTarget.checked)
        }
      />

      <Select
        label="Log Level"
        description="Application logging verbosity"
        value={settings.logLevel}
        onChange={(value) => handleSettingChange("logLevel", value)}
        data={[
          { value: "error", label: "Error" },
          { value: "warn", label: "Warning" },
          { value: "info", label: "Info" },
          { value: "debug", label: "Debug" },
        ]}
      />
    </Stack>
  );

  const renderNotificationSettings = () => (
    <Stack gap="md">
      <Switch
        label="Enable Notifications"
        description="Show system notifications"
        checked={settings.enableNotifications}
        onChange={(event) =>
          handleSettingChange(
            "enableNotifications",
            event.currentTarget.checked
          )
        }
      />

      <Switch
        label="Transaction Alerts"
        description="Notify on transaction status changes"
        checked={true}
        onChange={() => {}}
      />

      <Switch
        label="System Alerts"
        description="Notify on system health issues"
        checked={true}
        onChange={() => {}}
      />

      <Switch
        label="Wallet Events"
        description="Notify on wallet connection changes"
        checked={true}
        onChange={() => {}}
      />
    </Stack>
  );

  const renderAdvancedSettings = () => (
    <Stack gap="md">
      <NumberInput
        label="API Timeout (ms)"
        description="Request timeout in milliseconds"
        value={settings.apiTimeout}
        onChange={(value) => handleSettingChange("apiTimeout", value)}
        min={5000}
        max={120000}
      />

      <NumberInput
        label="Retry Attempts"
        description="Number of retry attempts for failed requests"
        value={settings.retryAttempts}
        onChange={(value) => handleSettingChange("retryAttempts", value)}
        min={0}
        max={10}
      />

      <Switch
        label="Enable Caching"
        description="Cache API responses for better performance"
        checked={settings.enableCaching}
        onChange={(event) =>
          handleSettingChange("enableCaching", event.currentTarget.checked)
        }
      />

      <NumberInput
        label="Cache Timeout (seconds)"
        description="How long to cache responses"
        value={settings.cacheTimeout}
        onChange={(value) => handleSettingChange("cacheTimeout", value)}
        min={60}
        max={3600}
        disabled={!settings.enableCaching}
      />
    </Stack>
  );

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <IconRefresh size={16} className="animate-spin" />;
      case "saved":
        return <IconCheck size={16} color="green" />;
      case "error":
        return <IconX size={16} color="red" />;
      default:
        return <IconDeviceFloppy size={16} />;
    }
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Title order={1} mb="sm">
          Settings
        </Title>
        <Text c="dimmed" size="lg">
          Configure your application preferences and system settings
        </Text>
      </Box>

      {/* Settings Grid */}
      <Grid>
        {settingSections.map((section, index) => (
          <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Group mb="md">
                <ThemeIcon color={section.color} variant="light" size="lg">
                  <section.icon size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={3}>{section.title}</Title>
                  <Text size="sm" c="dimmed">
                    {section.description}
                  </Text>
                </Box>
              </Group>

              {index === 0 && renderWalletSettings()}
              {index === 1 && renderNetworkSettings()}
              {index === 2 && renderInterfaceSettings()}
              {index === 3 && renderSecuritySettings()}
              {index === 4 && renderNotificationSettings()}
              {index === 5 && renderAdvancedSettings()}
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Group>
            <Button
              leftSection={getSaveStatusIcon()}
              onClick={handleSave}
              loading={loading}
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saved"
                ? "Saved!"
                : saveStatus === "error"
                  ? "Error"
                  : "Save Settings"}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              Reset to Defaults
            </Button>
          </Group>

          {saveStatus === "saved" && (
            <Alert icon={<IconCheck size={16} />} color="green" variant="light">
              Settings saved successfully!
            </Alert>
          )}

          {saveStatus === "error" && (
            <Alert icon={<IconX size={16} />} color="red" variant="light">
              Failed to save settings. Please try again.
            </Alert>
          )}
        </Group>
      </Card>
    </Stack>
  );
};

export default SettingsPage;
