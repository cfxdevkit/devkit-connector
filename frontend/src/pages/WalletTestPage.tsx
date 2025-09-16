import React from "react";
import { Container, Title, Stack } from "@mantine/core";
import WalletTest from "../components/WalletTest";

const WalletTestPage: React.FC = () => {
  return (
    <Container size="xl">
      <Stack gap="xl">
        <Title order={1} ta="center">
          Wallet Connection Test
        </Title>
        <WalletTest />
      </Stack>
    </Container>
  );
};

export default WalletTestPage;
