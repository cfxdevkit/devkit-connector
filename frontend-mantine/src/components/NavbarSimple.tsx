import { useState } from "react";
import {
  IconHome2,
  IconWallet,
  IconGauge,
  IconSettings,
  IconShield,
  IconActivity,
  IconDatabase,
  IconLogout,
  IconSwitchHorizontal,
} from "@tabler/icons-react";
import { Code, Group, Text } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import classes from "./NavbarSimple.module.css";

// All navigation items at the same level
const navigationItems = [
  { link: "/", label: "Dashboard", icon: IconHome2 },
  { link: "/wallet", label: "Wallet Test", icon: IconWallet },
  { link: "/pattern-a", label: "Server Pattern", icon: IconShield },
  { link: "/pattern-b", label: "Delegation Pattern", icon: IconActivity },
  { link: "/contracts", label: "Contracts", icon: IconDatabase },
  { link: "/status", label: "Health Status", icon: IconGauge },
  { link: "/api-health", label: "API Status", icon: IconActivity },
  { link: "/node-status", label: "Node Status", icon: IconDatabase },
  { link: "/system", label: "System", icon: IconGauge },
  { link: "/settings", label: "Settings", icon: IconSettings },
  { link: "/docs", label: "Documentation", icon: IconSettings },
];

export function NavbarSimple() {
  const location = useLocation();
  const [active, setActive] = useState("Dashboard");

  const navLinks = navigationItems.map((item) => (
    <Link
      className={classes.link}
      data-active={
        item.label === active || location.pathname === item.link || undefined
      }
      to={item.link}
      key={item.label}
      onClick={() => setActive(item.label)}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <div className={classes.logo}>
            <div
              style={{
                width: 28,
                height: 28,
                backgroundColor: "var(--mantine-color-blue-6)",
                borderRadius: "6px",
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
            <Text fw={700} size="lg">
              Conflux
            </Text>
          </div>
          <Code fw={700}>v1.0.0</Code>
        </Group>

        {/* All Navigation Items */}
        {navLinks}
      </div>

      <div className={classes.footer}>
        <Link
          to="#"
          className={classes.link}
          onClick={(event) => event.preventDefault()}
        >
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Switch Account</span>
        </Link>

        <Link
          to="#"
          className={classes.link}
          onClick={(event) => event.preventDefault()}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </Link>
      </div>
    </nav>
  );
}
