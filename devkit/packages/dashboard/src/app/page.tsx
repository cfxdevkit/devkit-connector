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
import dynamic from 'next/dynamic';
import { contractApi, nodeApi, systemApi, walletApi } from '../services/api';
import type { ChecklistStep, DashboardState } from '../types/dashboard';

// Dynamic import to avoid SSR issues
const DashboardContent = dynamic(() => import('./DashboardContent'), {
  ssr: false,
  loading: () => (
    <Container size="xl" py="md">
      <Stack gap="md">
        <Text>Loading dashboard...</Text>
      </Stack>
    </Container>
  ),
});

export default function DashboardPage() {
  return <DashboardContent />;
}
