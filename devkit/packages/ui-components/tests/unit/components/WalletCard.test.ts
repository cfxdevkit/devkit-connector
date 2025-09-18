// WalletCard component tests

import { describe, it, expect, beforeEach } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { WalletCard } from '../../../src/components/WalletCard';
import type { BrowserWalletInfo } from '@conflux-devkit/core';

// Mock wallet data
const mockWallet: BrowserWalletInfo = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  balance: '1000000000000000000', // 1 CFX in wei
  isDefault: false,
  network: 'testnet',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('WalletCard', () => {
  let element: WalletCard;

  beforeEach(async () => {
    element = await fixture<WalletCard>(
      html`<conflux-wallet-card .wallet=${mockWallet}></conflux-wallet-card>`
    );
  });

  it('should render wallet information', () => {
    expect(element).to.exist;
    expect(element.wallet).to.deep.equal(mockWallet);
  });

  it('should display wallet address', () => {
    const addressElement = element.shadowRoot?.querySelector('.address');
    expect(addressElement?.textContent).to.contain(mockWallet.address);
  });

  it('should display formatted balance', () => {
    const balanceElement = element.shadowRoot?.querySelector('.balance');
    expect(balanceElement?.textContent).to.contain('1.0000');
  });

  it('should show active state when active property is true', async () => {
    element.active = true;
    await element.updateComplete;

    expect(element.hasAttribute('active')).to.be.true;
  });

  it('should show compact mode when compact property is true', async () => {
    element.compact = true;
    await element.updateComplete;

    const contentElement = element.shadowRoot?.querySelector('.card-content');
    expect(contentElement?.classList.contains('compact')).to.be.true;
  });

  it('should hide actions when showActions is false', async () => {
    element.showActions = false;
    await element.updateComplete;

    const actionsElement = element.shadowRoot?.querySelector('.card-actions');
    expect(actionsElement).to.not.exist;
  });

  it('should dispatch wallet-select event when select button is clicked', async () => {
    let eventDispatched = false;
    let eventDetail: any = null;

    element.addEventListener('wallet-select', (e: CustomEvent) => {
      eventDispatched = true;
      eventDetail = e.detail;
    });

    const selectButton = element.shadowRoot?.querySelector(
      '.btn'
    ) as HTMLButtonElement;
    selectButton?.click();

    // Wait for the event to be dispatched
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(eventDispatched).to.be.true;
    expect(eventDetail).to.deep.equal({ wallet: mockWallet });
  });

  it('should dispatch wallet-refresh event when refresh button is clicked', async () => {
    let eventDispatched = false;
    let eventDetail: any = null;

    element.addEventListener('wallet-refresh', (e: CustomEvent) => {
      eventDispatched = true;
      eventDetail = e.detail;
    });

    const refreshButton = element.shadowRoot?.querySelector(
      '.btn.primary'
    ) as HTMLButtonElement;
    refreshButton?.click();

    // Wait for the event to be dispatched
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(eventDispatched).to.be.true;
    expect(eventDetail).to.deep.equal({ wallet: mockWallet });
  });

  it('should toggle expanded state when header is clicked', async () => {
    const headerElement = element.shadowRoot?.querySelector('.card-header');
    headerElement?.click();
    await element.updateComplete;

    expect(element.isExpanded).to.be.true;

    headerElement?.click();
    await element.updateComplete;

    expect(element.isExpanded).to.be.false;
  });

  it('should render active badge when active is true', async () => {
    element.active = true;
    await element.updateComplete;

    const activeBadge = element.shadowRoot?.querySelector('.badge.active');
    expect(activeBadge).to.exist;
    expect(activeBadge?.textContent).to.contain('Active');
  });

  it('should render default badge when wallet is default', async () => {
    const defaultWallet = { ...mockWallet, isDefault: true };
    element.wallet = defaultWallet;
    await element.updateComplete;

    const defaultBadge = element.shadowRoot?.querySelector('.badge.default');
    expect(defaultBadge).to.exist;
    expect(defaultBadge?.textContent).to.contain('Default');
  });

  it('should format balance correctly', async () => {
    // Test with different balance values
    const testCases = [
      { balance: '1000000000000000000', expected: '1.0000' }, // 1 CFX
      { balance: '500000000000000000', expected: '0.5000' }, // 0.5 CFX
      { balance: '0', expected: '0.0000' }, // 0 CFX
      { balance: '1234567890000000000', expected: '1.2346' }, // 1.23456789 CFX
    ];

    for (const { balance, expected } of testCases) {
      const wallet = { ...mockWallet, balance };
      element.wallet = wallet;
      await element.updateComplete;
      const balanceElement = element.shadowRoot?.querySelector('.balance');
      expect(balanceElement?.textContent).to.contain(expected);
    }
  });
});
