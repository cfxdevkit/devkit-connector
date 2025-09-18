// Wallet Card Web Component

import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

interface WalletInfo {
  address: string;
  balance?: string;
  isDefault?: boolean;
  name?: string;
  network?: string;
}

@customElement('conflux-wallet-card')
export class WalletCard extends LitElement {
  static properties = {
    wallet: { type: Object },
    active: { type: Boolean, reflect: true },
    showActions: { type: Boolean },
    compact: { type: Boolean },
    isExpanded: { type: Boolean, state: true },
  };

  // Property declarations for TypeScript
  declare wallet: WalletInfo | null;
  declare active: boolean;
  declare showActions: boolean;
  declare compact: boolean;
  declare isExpanded: boolean;

  constructor() {
    super();
    this.active = false;
    this.showActions = true;
    this.compact = false;
    this.isExpanded = false;
  }

  static styles = css`
    :host {
      display: block;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    :host(:hover) {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    :host([active]) {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .card-header {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 4px 0;
    }

    .card-subtitle {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }

    .card-content {
      padding: 16px;
    }

    .wallet-info {
      display: grid;
      gap: 8px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-size: 12px;
      color: #718096;
      font-weight: 500;
    }

    .info-value {
      font-size: 12px;
      color: #2d3748;
      font-family: monospace;
    }

    .address {
      font-family: monospace;
      font-size: 12px;
      color: #4a5568;
      background: #f7fafc;
      padding: 4px 8px;
      border-radius: 4px;
      word-break: break-all;
    }

    .balance {
      font-size: 18px;
      font-weight: 600;
      color: #10b981;
      text-align: center;
      padding: 12px;
      background: #f0fdf4;
      border-radius: 6px;
      margin: 8px 0;
    }

    .balance-label {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .wallet-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }

    .badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 12px;
      background: #edf2f7;
      color: #4a5568;
    }

    .badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .badge.default {
      background: #dbeafe;
      color: #1e40af;
    }

    .card-actions {
      padding: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .btn {
      padding: 6px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: white;
      color: #4a5568;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }

    .btn.primary {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }

    .btn.primary:hover {
      background: #059669;
      border-color: #059669;
    }

    .compact .card-content {
      padding: 12px;
    }

    .compact .card-actions {
      padding: 12px;
    }

    .expanded {
      max-height: none;
    }

    .collapsed {
      max-height: 200px;
      overflow: hidden;
    }
  `;

  render() {
    return html`
      <div class="card-header" @click=${this.toggleExpanded}>
        <h3 class="card-title">Wallet</h3>
        <p class="card-subtitle">Wallet</p>
      </div>

      <div
        class="card-content ${this.compact ? 'compact' : ''} ${
          this.isExpanded ? 'expanded' : 'collapsed'
        }"
      >
        <div class="wallet-info">
          <div class="balance">
            ${this.formatBalance(this.wallet?.balance)}
            <div class="balance-label">CFX</div>
          </div>

          <div class="info-row">
            <span class="info-label">Address:</span>
            <span class="address">${this.wallet?.address || 'Unknown'}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Network:</span>
            <span class="info-value">Unknown</span>
          </div>

          <div class="wallet-badges">${this.renderBadges()}</div>
        </div>
      </div>

      ${
        this.showActions
          ? html`
            <div class="card-actions">
              <button class="btn" @click=${this.handleSelect}>Select</button>
              <button class="btn primary" @click=${this.handleRefresh}>
                Refresh
              </button>
            </div>
          `
          : ''
      }
    `;
  }

  private renderBadges() {
    const badges = [];

    if (this.wallet?.isDefault) {
      badges.push(html`<span class="badge default">Default</span>`);
    }

    if (this.active) {
      badges.push(html`<span class="badge active">Active</span>`);
    }

    return badges;
  }

  private formatBalance(balance?: string): string {
    if (!balance) return '0.0000';
    const num = BigInt(balance);
    const cfx = Number(num) / 1e18;
    return cfx.toFixed(4);
  }

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private handleSelect() {
    this.dispatchEvent(
      new CustomEvent('wallet-select', {
        detail: { wallet: this.wallet },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleRefresh() {
    this.dispatchEvent(
      new CustomEvent('wallet-refresh', {
        detail: { wallet: this.wallet },
        bubbles: true,
        composed: true,
      })
    );
  }
}
