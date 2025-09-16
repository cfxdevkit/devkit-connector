export interface ChainConfig {
    id: number;
    name: string;
    rpcUrl: string;
    blockExplorerUrl: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
}
export interface ConfluxESpaceConfig extends ChainConfig {
    type: 'eSpace';
    chainId: number;
}
export interface ConfluxCoreConfig extends ChainConfig {
    type: 'core';
    networkId: number;
}
export type ConfluxChainConfig = ConfluxESpaceConfig | ConfluxCoreConfig;
export interface AddressConversion {
    eSpaceToCore: (eSpaceAddress: string) => string;
    coreToESpace: (coreAddress: string) => string;
    isValidESpace: (address: string) => boolean;
    isValidCore: (address: string) => boolean;
}
//# sourceMappingURL=chains.d.ts.map