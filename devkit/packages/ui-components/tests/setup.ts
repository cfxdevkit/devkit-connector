import '@open-wc/testing';
import { WalletCard } from '../src/components/WalletCard';
import { NetworkSelector } from '../src/components/NetworkSelector';

// Register custom elements only if they haven't been registered yet
if (!customElements.get('conflux-wallet-card')) {
  customElements.define('conflux-wallet-card', WalletCard);
}
if (!customElements.get('conflux-network-selector')) {
  customElements.define('conflux-network-selector', NetworkSelector);
}
