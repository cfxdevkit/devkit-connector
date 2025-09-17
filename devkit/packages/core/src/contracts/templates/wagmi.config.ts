// Wagmi configuration template for Conflux DevKit

import { defineConfig } from '@wagmi/cli';
import { react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'src/generated/contracts.ts',
  contracts: [
    // EVM contracts will be added here automatically
    // Example:
    // {
    //   name: 'MyContract',
    //   address: '0x...',
    //   abi: [...],
    //   chainId: 1030, // Conflux eSpace mainnet
    // },
  ],
  plugins: [react()],
});
