import { BaseWebComponent, WebComponentConfig } from '../base/BaseWebComponent';
import { DelegationData, TransactionData } from '@conflux-wallet/types';

export interface DelegationManagerConfig extends WebComponentConfig {
  userAddress?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export class DelegationManagerComponent extends BaseWebComponent {
  private refreshInterval?: NodeJS.Timeout;
  private delegations: DelegationData[] = [];
  private isLoading = false;

  protected getDefaultConfig(): DelegationManagerConfig {
    return {
      network: 'confluxEspaceTestnet',
      rpcUrl: '',
      theme: 'light',
      locale: 'en',
      debug: false,
      userAddress: '',
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
    };
  }

  static get observedAttributes() {
    return [
      ...BaseWebComponent.observedAttributes,
      'user-address',
      'auto-refresh',
      'refresh-interval'
    ];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    super.attributeChangedCallback(name, oldValue, newValue);

    switch (name) {
      case 'user-address':
        (this.config as DelegationManagerConfig).userAddress = newValue;
        if (this.isConnected) {
          this.loadDelegations();
        }
        break;
      case 'auto-refresh':
        (this.config as DelegationManagerConfig).autoRefresh = newValue === 'true';
        this.setupAutoRefresh();
        break;
      case 'refresh-interval':
        (this.config as DelegationManagerConfig).refreshInterval = parseInt(newValue) || 30000;
        this.setupAutoRefresh();
        break;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupAutoRefresh();
  }

  disconnectedCallback() {
    this.clearAutoRefresh();
    super.disconnectedCallback();
  }

  protected getTemplate(): string {
    return `
      <div class="delegation-manager">
        <div class="header">
          <h2>Delegation Manager</h2>
          <div class="controls">
            <button id="refresh-btn" class="btn btn-secondary">
              ${this.isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button id="create-delegation-btn" class="btn btn-primary">
              Create Delegation
            </button>
          </div>
        </div>
        
        <div class="content">
          <div id="delegations-list" class="delegations-list">
            ${this.renderDelegationsList()}
          </div>
          
          <div id="create-delegation-form" class="create-form" style="display: none;">
            ${this.renderCreateDelegationForm()}
          </div>
        </div>
        
        <div id="error-message" class="error-message" style="display: none;"></div>
      </div>
    `;
  }

  protected getStyles(): string {
    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --primary-color: #3b82f6;
          --secondary-color: #6b7280;
          --success-color: #10b981;
          --error-color: #ef4444;
          --warning-color: #f59e0b;
          --background-color: #ffffff;
          --text-color: #111827;
          --border-color: #e5e7eb;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        :host([theme="dark"]) {
          --background-color: #1f2937;
          --text-color: #f9fafb;
          --border-color: #374151;
        }

        .delegation-manager {
          background: var(--background-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--background-color);
        }

        .header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .controls {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: var(--secondary-color);
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-danger {
          background: var(--error-color);
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .content {
          padding: 1rem;
        }

        .delegations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .delegation-item {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background-color);
        }

        .delegation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .delegation-id {
          font-weight: 600;
          color: var(--primary-color);
        }

        .delegation-status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .delegation-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-weight: 500;
          color: var(--secondary-color);
          margin-bottom: 0.25rem;
        }

        .detail-value {
          color: var(--text-color);
        }

        .delegation-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .create-form {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background-color);
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-color);
        }

        .form-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--background-color);
          color: var(--text-color);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--secondary-color);
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--secondary-color);
        }
      </style>
    `;
  }

  protected attachEventListeners() {
    const refreshBtn = this.shadowRoot.getElementById('refresh-btn');
    const createBtn = this.shadowRoot.getElementById('create-delegation-btn');
    const form = this.shadowRoot.getElementById('create-delegation-form');

    refreshBtn?.addEventListener('click', () => this.loadDelegations());
    createBtn?.addEventListener('click', () => this.toggleCreateForm());
    
    // Form submission
    const formElement = this.shadowRoot.querySelector('form');
    formElement?.addEventListener('submit', (e) => this.handleCreateDelegation(e));
  }

  private renderDelegationsList(): string {
    if (this.isLoading) {
      return '<div class="loading">Loading delegations...</div>';
    }

    if (this.delegations.length === 0) {
      return '<div class="empty-state">No delegations found</div>';
    }

    return this.delegations.map(delegation => `
      <div class="delegation-item">
        <div class="delegation-header">
          <span class="delegation-id">Delegation #${delegation.delegator}</span>
          <span class="delegation-status ${delegation.isActive ? 'status-active' : 'status-inactive'}">
            ${delegation.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div class="delegation-details">
          <div class="detail-item">
            <span class="detail-label">Delegate</span>
            <span class="detail-value">${delegation.delegate}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Daily Limit</span>
            <span class="detail-value">${this.formatCFX(delegation.dailyLimit)} CFX</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Per-Tx Limit</span>
            <span class="detail-value">${this.formatCFX(delegation.perTxLimit)} CFX</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Daily Spent</span>
            <span class="detail-value">${this.formatCFX(delegation.dailySpent)} CFX</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Expires</span>
            <span class="detail-value">${new Date(delegation.expiresAt * 1000).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="delegation-actions">
          <button class="btn btn-danger" onclick="this.revokeDelegation('${delegation.delegator}')">
            Revoke
          </button>
          <button class="btn btn-secondary" onclick="this.updateLimits('${delegation.delegator}')">
            Update Limits
          </button>
        </div>
      </div>
    `).join('');
  }

  private renderCreateDelegationForm(): string {
    return `
      <form>
        <h3>Create New Delegation</h3>
        <div class="form-group">
          <label class="form-label" for="delegate-address">Delegate Address</label>
          <input 
            type="text" 
            id="delegate-address" 
            class="form-input" 
            placeholder="0x..." 
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="duration">Duration (days)</label>
          <input 
            type="number" 
            id="duration" 
            class="form-input" 
            value="7" 
            min="1" 
            max="365" 
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="daily-limit">Daily Limit (CFX)</label>
          <input 
            type="number" 
            id="daily-limit" 
            class="form-input" 
            value="1.0" 
            step="0.1" 
            min="0.1" 
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="per-tx-limit">Per-Transaction Limit (CFX)</label>
          <input 
            type="number" 
            id="per-tx-limit" 
            class="form-input" 
            value="0.1" 
            step="0.01" 
            min="0.01" 
            required
          />
        </div>
        <div class="delegation-actions">
          <button type="submit" class="btn btn-primary">Create Delegation</button>
          <button type="button" class="btn btn-secondary" onclick="this.toggleCreateForm()">Cancel</button>
        </div>
      </form>
    `;
  }

  private async loadDelegations() {
    if (!this.contractService || !this.config.userAddress) return;

    this.isLoading = true;
    this.render();

    const result = await this.executeContractOperation(
      () => this.contractService!.getUserDelegations(this.config.userAddress!),
      'load-delegations'
    );

    if (result) {
      this.delegations = result;
    }

    this.isLoading = false;
    this.render();
  }

  private toggleCreateForm() {
    const form = this.shadowRoot.getElementById('create-delegation-form');
    if (form) {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
  }

  private async handleCreateDelegation(event: Event) {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const delegate = (form.querySelector('#delegate-address') as HTMLInputElement).value;
    const duration = parseInt((form.querySelector('#duration') as HTMLInputElement).value) * 24 * 60 * 60;
    const dailyLimit = (form.querySelector('#daily-limit') as HTMLInputElement).value;
    const perTxLimit = (form.querySelector('#per-tx-limit') as HTMLInputElement).value;

    const result = await this.executeContractOperation(
      () => this.contractService!.createDelegation(delegate, duration, dailyLimit, perTxLimit),
      'create-delegation'
    );

    if (result) {
      this.toggleCreateForm();
      this.loadDelegations();
    }
  }

  private async revokeDelegation(delegationId: string) {
    const result = await this.executeContractOperation(
      () => this.contractService!.revokeDelegation(parseInt(delegationId)),
      'revoke-delegation'
    );

    if (result) {
      this.loadDelegations();
    }
  }

  private async updateLimits(delegationId: string) {
    // Implementation for updating limits
    this.log('Update limits not implemented yet');
  }

  private setupAutoRefresh() {
    this.clearAutoRefresh();
    
    if (this.config.autoRefresh && this.config.refreshInterval) {
      this.refreshInterval = setInterval(() => {
        this.loadDelegations();
      }, this.config.refreshInterval);
    }
  }

  private clearAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  private formatCFX(wei: string): string {
    return (parseFloat(wei) / 1e18).toFixed(4);
  }

  // Public methods for external access
  public async refresh() {
    await this.loadDelegations();
  }

  public getDelegations(): DelegationData[] {
    return [...this.delegations];
  }
}

// Register the custom element
customElements.define('delegation-manager', DelegationManagerComponent);
