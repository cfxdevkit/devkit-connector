// Network Selector Web Component

import type { BrowserNetworkConfig } from '@conflux-devkit/core';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('conflux-network-selector')
export class NetworkSelector extends LitElement {
  static properties = {
    current: { type: Object },
    available: { type: Array },
    isLoading: { type: Boolean },
    disabled: { type: Boolean },
    isOpen: { type: Boolean, state: true },
  };

  // Property declarations for TypeScript
  declare current: BrowserNetworkConfig | null;
  declare available: BrowserNetworkConfig[];
  declare isLoading: boolean;
  declare disabled: boolean;
  declare isOpen: boolean;

  constructor() {
    super();
    this.current = null;
    this.available = [];
    this.isLoading = false;
    this.disabled = false;
    this.isOpen = false;
  }

  static styles = css`
    :host {
      display: block;
      position: relative;
    }

    .selector {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 200px;
    }

    .selector:hover:not(:disabled) {
      border-color: #cbd5e0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .selector:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .network-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .network-name {
      font-size: 14px;
      font-weight: 500;
      color: #1a202c;
      margin: 0;
    }

    .network-details {
      font-size: 12px;
      color: #718096;
      margin: 0;
    }

    .network-icon {
      font-size: 16px;
    }

    .dropdown-arrow {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 4px solid #718096;
      transition: transform 0.2s ease;
    }

    .dropdown-arrow.open {
      transform: rotate(180deg);
    }

    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      border-bottom: 1px solid #f1f5f9;
    }

    .dropdown-item:last-child {
      border-bottom: none;
    }

    .dropdown-item:hover {
      background: #f7fafc;
    }

    .dropdown-item.selected {
      background: #edf2f7;
    }

    .item-icon {
      font-size: 16px;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .item-name {
      font-size: 14px;
      font-weight: 500;
      color: #1a202c;
      margin: 0;
    }

    .item-details {
      font-size: 12px;
      color: #718096;
      margin: 0;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #e2e8f0;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .empty-state {
      padding: 20px;
      text-align: center;
      color: #718096;
      font-size: 14px;
    }
  `;

  render() {
    return html`
      <div
        class="selector"
        @click=${this.toggleDropdown}
        ?disabled=${this.disabled || this.isLoading}
      >
        ${this.isLoading
          ? html` <div class="loading-spinner"></div> `
          : html` <div class="network-icon">${this.getNetworkIcon()}</div> `}

        <div class="network-info">
          <h4 class="network-name">${this.getCurrentNetworkName()}</h4>
          <p class="network-details">${this.getCurrentNetworkDetails()}</p>
        </div>

        <div class="dropdown-arrow ${this.isOpen ? 'open' : ''}"></div>
      </div>

      ${this.isOpen
        ? html`
            <div class="dropdown">
              ${this.available.length > 0
                ? this.renderNetworkList()
                : this.renderEmptyState()}
            </div>
          `
        : ''}
    `;
  }

  private renderNetworkList() {
    return this.available.map(
      network => html`
        <div
          class="dropdown-item ${this.isCurrentNetwork(network)
            ? 'selected'
            : ''}"
          @click=${() => this.selectNetwork(network)}
        >
          <div class="item-icon">${this.getNetworkIcon(network)}</div>
          <div class="item-info">
            <h4 class="item-name">${network.name}</h4>
            <p class="item-details">
              Chain ID: ${network.chainId} | EVM: ${network.evmChainId}
            </p>
          </div>
        </div>
      `
    );
  }

  private renderEmptyState() {
    return html` <div class="empty-state">No networks available</div> `;
  }

  private getCurrentNetworkName() {
    if (this.isLoading) return 'Loading...';
    return this.current?.name || 'Select Network';
  }

  private getCurrentNetworkDetails() {
    if (this.isLoading) return 'Please wait...';
    if (!this.current) return 'No network selected';
    return `Chain ID: ${this.current.chainId} | EVM: ${this.current.evmChainId}`;
  }

  private getNetworkIcon(network?: BrowserNetworkConfig) {
    const targetNetwork = network || this.current;
    if (!targetNetwork) return '❓';

    if (targetNetwork.name?.toLowerCase().includes('local')) return '🏠';
    if (targetNetwork.isTestnet) return '🧪';
    return '🌐';
  }

  private isCurrentNetwork(network: BrowserNetworkConfig) {
    return this.current?.chainId === network.chainId;
  }

  private toggleDropdown() {
    if (this.disabled || this.isLoading) return;
    this.isOpen = !this.isOpen;
  }

  private selectNetwork(network: BrowserNetworkConfig) {
    this.dispatchEvent(
      new CustomEvent('network-select', {
        detail: { network },
        bubbles: true,
        composed: true,
      })
    );
    this.isOpen = false;
  }

  // Close dropdown when clicking outside
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleOutsideClick);
  }

  private handleOutsideClick = (event: Event) => {
    if (!this.contains(event.target as Node)) {
      this.isOpen = false;
    }
  };
}
