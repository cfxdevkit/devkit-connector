import { defineConfig } from '@wagmi/cli'
import { react, actions } from '@wagmi/cli/plugins'
import { confluxESpace, confluxESpaceTestnet } from './src/chains'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    // Delegation Framework Contracts
    {
      name: 'ConfluxDelegationManager',
      abi: [], // Will be populated from actual contract
      address: {
        [confluxESpace.id]: '0x0000000000000000000000000000000000000000', // Placeholder
        [confluxESpaceTestnet.id]: '0x0000000000000000000000000000000000000000', // Placeholder
      },
    },
    {
      name: 'ConfluxSessionRegistry',
      abi: [], // Will be populated from actual contract
      address: {
        [confluxESpace.id]: '0x0000000000000000000000000000000000000000', // Placeholder
        [confluxESpaceTestnet.id]: '0x0000000000000000000000000000000000000000', // Placeholder
      },
    },
    // Test Contracts
    {
      name: 'ConfluxWalletTestSuite',
      abi: [], // Will be populated from actual contract
      address: {
        [confluxESpace.id]: '0x0000000000000000000000000000000000000000', // Placeholder
        [confluxESpaceTestnet.id]: '0x0000000000000000000000000000000000000000', // Placeholder
      },
    },
    {
      name: 'ConfluxTestToken',
      abi: [], // Will be populated from actual contract
      address: {
        [confluxESpace.id]: '0x0000000000000000000000000000000000000000', // Placeholder
        [confluxESpaceTestnet.id]: '0x0000000000000000000000000000000000000000', // Placeholder
      },
    },
    {
      name: 'ConfluxTestNFT',
      abi: [], // Will be populated from actual contract
      address: {
        [confluxESpace.id]: '0x0000000000000000000000000000000000000000', // Placeholder
        [confluxESpaceTestnet.id]: '0x0000000000000000000000000000000000000000', // Placeholder
      },
    },
  ],
  plugins: [
    actions({
      getContract: true,
      readContract: true,
      writeContract: true,
      prepareWriteContract: true,
      watchContractEvent: true,
    }),
    react({
      useContractRead: true,
      useContractWrite: true,
      useContractEvent: true,
      usePrepareContractWrite: true,
    }),
  ],
})
