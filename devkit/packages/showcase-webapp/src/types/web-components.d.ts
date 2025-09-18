// Web Components Type Declarations

declare namespace JSX {
  interface IntrinsicElements {
    'conflux-contract-card': {
      name?: string;
      address?: string;
      'chain-type'?: string;
      'network-id'?: string;
      methods?: string;
      active?: string;
      'show-actions'?: string;
    };
    'conflux-wallet-card': {
      address?: string;
      balance?: string;
      'balance-formatted'?: string;
      'is-mining'?: string;
      theme?: string;
    };
    'conflux-node-status': {
      running?: string;
      'chain-id'?: string;
      'evm-chain-id'?: string;
      'block-number'?: string;
      'peer-count'?: string;
      health?: string;
      'show-actions'?: string;
    };
    'conflux-network-selector': {
      'current-network'?: string;
      'available-networks'?: string;
      theme?: string;
    };
  }
}


