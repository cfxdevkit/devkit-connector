// NetworkSelector component tests

import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { NetworkSelector } from '../../../src/components/NetworkSelector';
import type { BrowserNetworkConfig } from '@conflux-devkit/core';

// Mock network data
const mockNetworks: BrowserNetworkConfig[] = [
  {
    name: 'Conflux Testnet',
    chainId: 1,
    evmChainId: 71,
    rpcUrl: 'https://test.confluxrpc.com',
    isTestnet: true,
    blockExplorer: 'https://testnet.confluxscan.io',
  },
  {
    name: 'Conflux Mainnet',
    chainId: 1029,
    evmChainId: 1030,
    rpcUrl: 'https://main.confluxrpc.com',
    isTestnet: false,
    blockExplorer: 'https://confluxscan.io',
  },
  {
    name: 'Local Network',
    chainId: 1337,
    evmChainId: 1337,
    rpcUrl: 'http://localhost:12537',
    isTestnet: false,
    blockExplorer: 'http://localhost:3000',
  },
];

describe('NetworkSelector', () => {
  let element: NetworkSelector;

  beforeEach(async () => {
    element = await fixture<NetworkSelector>(
      html`<conflux-network-selector
        .current=${mockNetworks[0]}
        .available=${mockNetworks}
      ></conflux-network-selector>`
    );
  });

  it('should render network selector', () => {
    expect(element).to.exist;
    expect(element.current).to.deep.equal(mockNetworks[0]);
    expect(element.available).to.deep.equal(mockNetworks);
  });

  it('should display current network name', () => {
    const nameElement = element.shadowRoot?.querySelector('.network-name');
    expect(nameElement?.textContent).to.contain('Conflux Testnet');
  });

  it('should display current network details', () => {
    const detailsElement =
      element.shadowRoot?.querySelector('.network-details');
    expect(detailsElement?.textContent).to.contain('Chain ID: 1');
    expect(detailsElement?.textContent).to.contain('EVM: 71');
  });

  it('should show loading state when isLoading is true', async () => {
    element.isLoading = true;
    await element.updateComplete;

    const loadingSpinner =
      element.shadowRoot?.querySelector('.loading-spinner');
    expect(loadingSpinner).to.exist;

    const nameElement = element.shadowRoot?.querySelector('.network-name');
    expect(nameElement?.textContent).to.contain('Loading...');
  });

  it('should show disabled state when disabled is true', async () => {
    element.disabled = true;
    await element.updateComplete;

    const selector = element.shadowRoot?.querySelector('.selector');
    expect(selector?.hasAttribute('disabled')).to.be.true;
  });

  it('should toggle dropdown when clicked', async () => {
    const selector = element.shadowRoot?.querySelector(
      '.selector'
    ) as HTMLElement;
    selector?.click();
    await element.updateComplete;

    expect(element.isOpen).to.be.true;

    const dropdown = element.shadowRoot?.querySelector('.dropdown');
    expect(dropdown).to.exist;
  });

  it('should not toggle dropdown when disabled', async () => {
    element.disabled = true;
    await element.updateComplete;

    const selector = element.shadowRoot?.querySelector(
      '.selector'
    ) as HTMLElement;
    selector?.click();
    await element.updateComplete;

    expect(element.isOpen).to.be.false;
  });

  it('should not toggle dropdown when loading', async () => {
    element.isLoading = true;
    await element.updateComplete;

    const selector = element.shadowRoot?.querySelector(
      '.selector'
    ) as HTMLElement;
    selector?.click();
    await element.updateComplete;

    expect(element.isOpen).to.be.false;
  });

  it('should render network list in dropdown', async () => {
    element.isOpen = true;
    await element.updateComplete;

    const dropdownItems =
      element.shadowRoot?.querySelectorAll('.dropdown-item');
    expect(dropdownItems?.length).to.equal(mockNetworks.length);
  });

  it('should mark current network as selected', async () => {
    element.isOpen = true;
    await element.updateComplete;

    const selectedItem = element.shadowRoot?.querySelector(
      '.dropdown-item.selected'
    );
    expect(selectedItem).to.exist;
  });

  it('should dispatch network-select event when network is selected', async () => {
    element.isOpen = true;
    await element.updateComplete;

    let eventDispatched = false;
    let eventDetail: any = null;

    element.addEventListener('network-select', (e: CustomEvent) => {
      eventDispatched = true;
      eventDetail = e.detail;
    });

    const networkItem = element.shadowRoot?.querySelectorAll(
      '.dropdown-item'
    )[1] as HTMLElement;
    networkItem?.click();

    expect(eventDispatched).to.be.true;
    expect(eventDetail).to.deep.equal({ network: mockNetworks[1] });
    expect(element.isOpen).to.be.false;
  });

  it('should show empty state when no networks available', async () => {
    element.available = [];
    element.isOpen = true;
    await element.updateComplete;

    const emptyState = element.shadowRoot?.querySelector('.empty-state');
    expect(emptyState).to.exist;
    expect(emptyState?.textContent).to.contain('No networks available');
  });

  it('should show correct network icons', async () => {
    // Test different network types
    const testCases = [
      { network: mockNetworks[0], expectedIcon: '🧪' }, // testnet
      { network: mockNetworks[1], expectedIcon: '🌐' }, // mainnet
      { network: mockNetworks[2], expectedIcon: '🏠' }, // local
    ];

    for (const { network, expectedIcon } of testCases) {
      element.current = network;
      await element.updateComplete;
      const iconElement = element.shadowRoot?.querySelector('.network-icon');
      expect(iconElement?.textContent).to.contain(expectedIcon);
    }
  });

  it('should show select network when no current network', async () => {
    element.current = null;
    await element.updateComplete;

    const nameElement = element.shadowRoot?.querySelector('.network-name');
    expect(nameElement?.textContent).to.contain('Select Network');

    const detailsElement =
      element.shadowRoot?.querySelector('.network-details');
    expect(detailsElement?.textContent).to.contain('No network selected');
  });

  it('should close dropdown when clicking outside', async () => {
    element.isOpen = true;
    await element.updateComplete;

    // Simulate clicking outside
    const outsideEvent = new MouseEvent('click', { bubbles: true });
    document.dispatchEvent(outsideEvent);
    await element.updateComplete;

    expect(element.isOpen).to.be.false;
  });

  it('should not close dropdown when clicking inside', async () => {
    element.isOpen = true;
    await element.updateComplete;

    const selector = element.shadowRoot?.querySelector(
      '.selector'
    ) as HTMLElement;
    const insideEvent = new MouseEvent('click', { bubbles: true });
    selector?.dispatchEvent(insideEvent);
    await element.updateComplete;

    expect(element.isOpen).to.be.false; // Should close because of toggle
  });
});
