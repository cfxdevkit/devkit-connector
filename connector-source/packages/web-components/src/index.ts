// Export base classes
export { BaseWebComponent, WebComponentConfig } from './base/BaseWebComponent';

// Export components
export { DelegationManagerComponent, DelegationManagerConfig } from './components/DelegationManager';
export { TransactionExecutorComponent, TransactionExecutorConfig } from './components/TransactionExecutor';

// Export types
export type { DelegationData, TransactionData } from '@conflux-wallet/types';

// Auto-register components when imported
import './components/DelegationManager';
import './components/TransactionExecutor';

// Utility functions
export const registerAllComponents = () => {
  // Components are auto-registered when imported
  console.log('Conflux Wallet Web Components registered');
};

// Version info
export const VERSION = '0.1.0';

// Global registration for UMD builds
if (typeof window !== 'undefined') {
  (window as any).ConfluxWalletComponents = {
    BaseWebComponent: require('./base/BaseWebComponent').BaseWebComponent,
    DelegationManagerComponent: require('./components/DelegationManager').DelegationManagerComponent,
    TransactionExecutorComponent: require('./components/TransactionExecutor').TransactionExecutorComponent,
    registerAllComponents,
    VERSION,
  };
}
