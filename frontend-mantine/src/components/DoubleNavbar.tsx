import { useState } from "react";
import {
  IconDeviceDesktopAnalytics,
  IconGauge,
  IconHome2,
  IconSettings,
  IconWallet,
  IconServer,
  IconWorld,
} from "@tabler/icons-react";
import { Title, Tooltip, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import classes from "./DoubleNavbar.module.css";

const mainLinksMockdata = [
  { icon: IconHome2, label: "Dashboard", path: "/" },
  { icon: IconWallet, label: "Wallets", path: "/wallet" },
  { icon: IconGauge, label: "System", path: "/system" },
];

const walletLinks = [
  {
    label: "Connection Test",
    path: "/wallet",
    icon: IconWallet,
    description: "Test wallet connections",
  },
  {
    label: "Server Pattern",
    path: "/pattern-a",
    icon: IconServer,
    description: "Server-managed wallet",
  },
  {
    label: "Delegation Pattern",
    path: "/pattern-b",
    icon: IconWorld,
    description: "User delegation",
  },
  {
    label: "Contracts",
    path: "/contracts",
    icon: IconDeviceDesktopAnalytics,
    description: "Smart contracts",
  },
];

const systemLinks = [
  {
    label: "Health Status",
    path: "/status",
    icon: IconGauge,
    description: "System monitoring",
  },
  {
    label: "API Status",
    path: "/api-health",
    icon: IconDeviceDesktopAnalytics,
    description: "API endpoints",
  },
  {
    label: "Node Status",
    path: "/node-status",
    icon: IconWorld,
    description: "Conflux node",
  },
  {
    label: "Documentation",
    path: "/docs",
    icon: IconSettings,
    description: "API reference",
  },
];

export function DoubleNavbar() {
  const location = useLocation();
  const [active, setActive] = useState("Dashboard");
  const [activeLink, setActiveLink] = useState("Connection Test");

  const mainLinks = mainLinksMockdata.map((link) => (
    <Tooltip
      label={link.label}
      position="right"
      withArrow
      transitionProps={{ duration: 0 }}
      key={link.label}
    >
      <UnstyledButton
        component={Link}
        to={link.path}
        onClick={() => {
          setActive(link.label);
          // Reset active link when switching sections
          if (link.label === "Wallets") {
            setActiveLink("Connection Test");
          } else if (link.label === "System") {
            setActiveLink("Health Status");
          }
        }}
        className={classes.mainLink}
        data-active={
          link.label === active || location.pathname === link.path || undefined
        }
      >
        <link.icon size={22} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  ));

  // Determine which links to show based on active section
  const getCurrentLinks = () => {
    // Check if we're in wallet-related routes
    if (
      location.pathname.startsWith("/pattern") ||
      location.pathname === "/wallet"
    ) {
      return walletLinks;
    }
    // Check if we're in system health routes
    else if (
      location.pathname.startsWith("/status") ||
      location.pathname.startsWith("/api") ||
      location.pathname.startsWith("/docs") ||
      location.pathname === "/system"
    ) {
      return systemLinks;
    }
    // Dashboard route shows wallet links by default
    else if (location.pathname === "/") {
      return walletLinks;
    }
    // Default based on active state
    else if (active === "Wallets") {
      return walletLinks;
    } else if (active === "System") {
      return systemLinks;
    }
    // Default to wallet links
    return walletLinks;
  };

  const currentLinks = getCurrentLinks();

  const links = currentLinks.map((link) => (
    <div key={link.label} style={{ marginBottom: "4px" }}>
      <Link
        to={link.path}
        className={classes.link}
        data-active={
          activeLink === link.label ||
          location.pathname === link.path ||
          undefined
        }
        onClick={() => {
          setActiveLink(link.label);
        }}
        style={{ display: "flex", alignItems: "center", padding: "8px 16px" }}
      >
        {link.icon && <link.icon size={16} style={{ marginRight: "8px" }} />}
        <div>
          <div style={{ fontWeight: 500, fontSize: "14px" }}>{link.label}</div>
          {link.description && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--mantine-color-gray-6)",
                marginTop: "2px",
              }}
            >
              {link.description}
            </div>
          )}
        </div>
      </Link>
    </div>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.wrapper}>
        <div className={classes.aside}>
          <div className={classes.logo}>
            <div
              style={{
                width: 30,
                height: 30,
                backgroundColor: "var(--mantine-color-blue-6)",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              CF
            </div>
          </div>
          {mainLinks}
        </div>
        <div className={classes.main}>
          <Title order={4} className={classes.title}>
            {active}
          </Title>
          <div style={{ padding: "0 16px" }}>
            <div
              style={{
                fontSize: "12px",
                color: "var(--mantine-color-gray-6)",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              {currentLinks === walletLinks
                ? "Wallet Operations"
                : "System Monitoring"}
            </div>
            {links}
          </div>
        </div>
      </div>
    </nav>
  );
}
