// Contract Card Web Component

import { LitElement, html, css, customElement, property, state } from 'lit';
import type { BrowserContractOrchestrator } from '@conflux-devkit/core';

@customElement('conflux-contract-card')
export class ContractCard extends LitElement {
  @property({ type: Object }) contract!: BrowserContractOrchestrator;
  @property({ type: Boolean }) active = false;
  @property({ type: Boolean }) showActions = true;
  @property({ type: Boolean }) compact = false;

  @state() private isExpanded = false;

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
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

    .contract-info {
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

    .capabilities {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }

    .capability {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 12px;
      background: #edf2f7;
      color: #4a5568;
    }

    .capability.active {
      background: #bee3f8;
      color: #2b6cb0;
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
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .btn.primary:hover {
      background: #2563eb;
      border-color: #2563eb;
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
        <h3 class="card-title">${this.contract.name || 'Unnamed Contract'}</h3>
        <p class="card-subtitle">
          ${this.contract.chainType || 'Unknown Type'}
        </p>
      </div>

      <div
        class="card-content ${this.compact ? 'compact' : ''} ${this.isExpanded
          ? 'expanded'
          : 'collapsed'}"
      >
        <div class="contract-info">
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span class="address">${this.contract.address}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Chain ID:</span>
            <span class="info-value">${this.contract.chainId}</span>
          </div>

          <div class="info-row">
            <span class="info-label">EVM Chain ID:</span>
            <span class="info-value">${this.contract.evmChainId}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Deployed:</span>
            <span class="info-value"
              >${new Date(this.contract.deployedAt).toLocaleDateString()}</span
            >
          </div>

          <div class="capabilities">${this.renderCapabilities()}</div>
        </div>
      </div>

      ${this.showActions
        ? html`
            <div class="card-actions">
              <button class="btn" @click=${this.handleSelect}>Select</button>
              <button class="btn primary" @click=${this.handleCall}>
                Call Method
              </button>
            </div>
          `
        : ''}
    `;
  }

  private renderCapabilities() {
    const capabilities = this.contract.capabilities || {};
    const capabilityLabels = [
      { key: 'canRead', label: 'Read' },
      { key: 'canWrite', label: 'Write' },
      { key: 'hasEvents', label: 'Events' },
      { key: 'isUpgradeable', label: 'Upgradeable' },
      { key: 'isPausable', label: 'Pausable' },
      { key: 'isOwnable', label: 'Ownable' },
    ];

    return capabilityLabels.map(
      cap => html`
        <span class="capability ${capabilities[cap.key] ? 'active' : ''}">
          ${cap.label}
        </span>
      `
    );
  }

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private handleSelect() {
    this.dispatchEvent(
      new CustomEvent('contract-select', {
        detail: { contract: this.contract },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleCall() {
    this.dispatchEvent(
      new CustomEvent('contract-call', {
        detail: { contract: this.contract },
        bubbles: true,
        composed: true,
      })
    );
  }
}
