// Node Status Web Component

import { LitElement, html, css, customElement, property, state } from 'lit';
import type { BrowserNodeStatus } from '@conflux-devkit/core';

@customElement('conflux-node-status')
export class NodeStatus extends LitElement {
  @property({ type: Object }) status: BrowserNodeStatus | null = null;
  @property({ type: Boolean }) isLoading = false;
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

    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      margin-top: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .status-running .status-dot {
      background: #10b981;
    }

    .status-stopped .status-dot {
      background: #ef4444;
    }

    .status-starting .status-dot {
      background: #f59e0b;
    }

    .status-stopping .status-dot {
      background: #f59e0b;
    }

    .status-unknown .status-dot {
      background: #6b7280;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .card-content {
      padding: 16px;
    }

    .node-info {
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

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }

    .metric {
      text-align: center;
      padding: 8px;
      background: #f7fafc;
      border-radius: 6px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
    }

    .metric-label {
      font-size: 10px;
      color: #718096;
      margin-top: 2px;
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

    .btn.danger {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }

    .btn.danger:hover {
      background: #dc2626;
      border-color: #dc2626;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .loading {
      opacity: 0.6;
      pointer-events: none;
    }
  `;

  render() {
    const statusClass = this.getStatusClass();
    const statusText = this.getStatusText();
    const statusColor = this.getStatusColor();

    return html`
      <div class="card-header" @click=${this.toggleExpanded}>
        <h3 class="card-title">Node Status</h3>
        <p class="card-subtitle">Conflux Node</p>
        <div class="status-indicator ${statusClass}">
          <div class="status-dot"></div>
          ${statusText}
        </div>
      </div>

      <div
        class="card-content ${this.compact ? 'compact' : ''} ${this.isExpanded
          ? 'expanded'
          : 'collapsed'} ${this.isLoading ? 'loading' : ''}"
      >
        <div class="node-info">
          ${this.status ? this.renderNodeInfo() : this.renderNoStatus()}
        </div>
      </div>

      ${this.showActions
        ? html` <div class="card-actions">${this.renderActions()}</div> `
        : ''}
    `;
  }

  private renderNodeInfo() {
    if (!this.status) return html`<p>No status available</p>`;

    return html`
      <div class="info-row">
        <span class="info-label">Health:</span>
        <span class="info-value">${this.status.health || 'Unknown'}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Core Port:</span>
        <span class="info-value">${this.status.corePort || 'N/A'}</span>
      </div>

      <div class="info-row">
        <span class="info-label">EVM Port:</span>
        <span class="info-value">${this.status.evmPort || 'N/A'}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Chain ID:</span>
        <span class="info-value">${this.status.chainId || 'N/A'}</span>
      </div>

      <div class="info-row">
        <span class="info-label">EVM Chain ID:</span>
        <span class="info-value">${this.status.evmChainId || 'N/A'}</span>
      </div>

      <div class="metrics-grid">
        <div class="metric">
          <div class="metric-value">${this.status.blockNumber || '0'}</div>
          <div class="metric-label">Block Number</div>
        </div>

        <div class="metric">
          <div class="metric-value">${this.status.peerCount || '0'}</div>
          <div class="metric-label">Peers</div>
        </div>
      </div>
    `;
  }

  private renderNoStatus() {
    return html`
      <p style="text-align: center; color: #718096; padding: 20px;">
        Node is not running or status unavailable
      </p>
    `;
  }

  private renderActions() {
    const isRunning = this.status?.running || false;
    const isStarting = this.isLoading;

    return html`
      <button
        class="btn primary"
        @click=${this.handleStart}
        ?disabled=${isRunning || isStarting}
      >
        ${isStarting ? 'Starting...' : 'Start'}
      </button>

      <button
        class="btn danger"
        @click=${this.handleStop}
        ?disabled=${!isRunning || isStarting}
      >
        Stop
      </button>

      <button
        class="btn"
        @click=${this.handleRestart}
        ?disabled=${!isRunning || isStarting}
      >
        Restart
      </button>
    `;
  }

  private getStatusClass() {
    if (this.isLoading) return 'status-starting';
    if (!this.status) return 'status-stopped';
    if (this.status.running) return 'status-running';
    return 'status-stopped';
  }

  private getStatusText() {
    if (this.isLoading) return 'Starting...';
    if (!this.status) return 'Stopped';
    if (this.status.running) return 'Running';
    return 'Stopped';
  }

  private getStatusColor() {
    if (this.isLoading) return '#f59e0b';
    if (!this.status) return '#ef4444';
    if (this.status.running) return '#10b981';
    return '#ef4444';
  }

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private handleStart() {
    this.dispatchEvent(
      new CustomEvent('node-start', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleStop() {
    this.dispatchEvent(
      new CustomEvent('node-stop', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleRestart() {
    this.dispatchEvent(
      new CustomEvent('node-restart', {
        bubbles: true,
        composed: true,
      })
    );
  }
}
